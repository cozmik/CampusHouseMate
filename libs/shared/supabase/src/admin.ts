import type {
  Listing,
  ListingStatus,
  Profile,
  Report,
  ReportStatus,
} from "@housemates/shared-types";
import { supabase } from "./client";
import {
  mapListing,
  mapProfile,
  mapReport,
  type RawListing,
  type RawProfile,
  type RawReport,
} from "./mappers";

export interface AdminOverview {
  totalUsers: number;
  totalListings: number;
  listingsByStatus: Record<ListingStatus, number>;
  totalConversations: number;
  totalMessages: number;
  totalReports: number;
  openReports: number;
  listingsPerDay: { date: string; count: number }[];
  usersPerDay: { date: string; count: number }[];
  newUsersThisWeek: number;
  newListingsThisWeek: number;
  listingsBySchool: { schoolId: string; count: number }[];
}

function lastNDays(n: number): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function tallyPerDay(rows: { created_at: string }[], days: string[]): { date: string; count: number }[] {
  const counts = new Map<string, number>(days.map((d) => [d, 0]));
  for (const row of rows) {
    const day = new Date(row.created_at).toISOString().slice(0, 10);
    if (counts.has(day)) counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  return days.map((date) => ({ date, count: counts.get(date) ?? 0 }));
}

export async function fetchAdminOverview(): Promise<AdminOverview> {
  const sinceWeek = new Date();
  sinceWeek.setDate(sinceWeek.getDate() - 7);

  const [{ data: userRows }, { data: listingRows }, { data: convRows }, { data: msgRows }, { data: reportRows }] =
    await Promise.all([
      supabase.from("profiles").select("id, created_at"),
      supabase.from("listings").select("id, status, school_id, created_at"),
      supabase.from("conversations").select("id, created_at"),
      supabase.from("messages").select("id, created_at"),
      supabase.from("reports").select("id, status, created_at"),
    ]);

  const listings = (listingRows ?? []) as unknown as {
    id: string;
    status: string;
    school_id: string;
    created_at: string;
  }[];
  const users = (userRows ?? []) as unknown as { id: string; created_at: string }[];
  const conversations = (convRows ?? []) as unknown as { id: string; created_at: string }[];
  const messages = (msgRows ?? []) as unknown as { id: string; created_at: string }[];
  const reports = (reportRows ?? []) as unknown as { id: string; status: string; created_at: string }[];

  const days30 = lastNDays(30);
  const schoolCounts = new Map<string, number>();
  for (const l of listings) {
    schoolCounts.set(l.school_id, (schoolCounts.get(l.school_id) ?? 0) + 1);
  }

  const weekCutoff = sinceWeek.toISOString();

  return {
    totalUsers: users.length,
    totalListings: listings.length,
    listingsByStatus: {
      available: listings.filter((l) => l.status === "available").length,
      pending: listings.filter((l) => l.status === "pending").length,
      taken: listings.filter((l) => l.status === "taken").length,
    },
    totalConversations: conversations.length,
    totalMessages: messages.length,
    totalReports: reports.length,
    openReports: reports.filter((r) => r.status !== "resolved").length,
    listingsPerDay: tallyPerDay(listings, days30),
    usersPerDay: tallyPerDay(users, days30),
    newUsersThisWeek: users.filter((u) => u.created_at >= weekCutoff).length,
    newListingsThisWeek: listings.filter((l) => l.created_at >= weekCutoff).length,
    listingsBySchool: [...schoolCounts.entries()]
      .map(([schoolId, count]) => ({ schoolId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
  };
}

export interface AdminUser extends Profile {
  phone?: string;
  whatsapp?: string;
  listingCount: number;
  joinedAt: string;
}

export async function fetchAllUsers(): Promise<AdminUser[]> {
  const [{ data: profs, error }, { data: contacts }, { data: listingRows }] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("contact_details").select("user_id, phone, whatsapp"),
    supabase.from("listings").select("owner_id, id"),
  ]);

  if (error || !profs) return [];

  const contactByUser = new Map(
    (contacts ?? []).map((c) => {
      const row = c as unknown as { user_id: string; phone: string | null; whatsapp: string | null };
      return [row.user_id, row];
    }),
  );

  const listingCountByOwner = new Map<string, number>();
  for (const row of listingRows ?? []) {
    const owner = (row as unknown as { owner_id: string }).owner_id;
    listingCountByOwner.set(owner, (listingCountByOwner.get(owner) ?? 0) + 1);
  }

  return (profs as unknown as RawProfile[]).map((row) => {
    const contact = contactByUser.get(row.id);
    const user: AdminUser = {
      ...mapProfile(row),
      phone: contact?.phone ?? undefined,
      whatsapp: contact?.whatsapp ?? undefined,
      listingCount: listingCountByOwner.get(row.id) ?? 0,
      joinedAt: row.created_at,
    };
    return user;
  });
}

export async function setUserAdmin(id: string, isAdmin: boolean): Promise<void> {
  await supabase.from("profiles").update({ is_admin: isAdmin }).eq("id", id);
}

export async function setUserSuspended(id: string, isSuspended: boolean): Promise<void> {
  await supabase.from("profiles").update({ is_suspended: isSuspended }).eq("id", id);
}

export interface AdminUserDetail extends AdminUser {
  listings: Listing[];
  conversationsCount: number;
  savedCount: number;
}

export async function fetchUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const [profileRes, contactRes, listingRes, convRes, savedRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("contact_details")
      .select("user_id, phone, whatsapp")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("listings")
      .select("*, listing_photos(*)")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("conversations")
      .select("id")
      .or(`seeker_id.eq.${userId},lister_id.eq.${userId}`),
    supabase.from("saved_listings").select("id").eq("user_id", userId),
  ]);

  const profileRow = profileRes.data as unknown as RawProfile | null;
  if (!profileRow) return null;

  const contact = contactRes.data as unknown as {
    user_id: string;
    phone: string | null;
    whatsapp: string | null;
  } | null;

  return {
    ...mapProfile(profileRow),
    phone: contact?.phone ?? undefined,
    whatsapp: contact?.whatsapp ?? undefined,
    listingCount: (listingRes.data ?? []).length,
    joinedAt: profileRow.created_at,
    listings: ((listingRes.data ?? []) as unknown as RawListing[]).map(mapListing),
    conversationsCount: convRes.data?.length ?? 0,
    savedCount: savedRes.data?.length ?? 0,
  };
}

export async function fetchAllReports(): Promise<Report[]> {
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as unknown as RawReport[]).map(mapReport);
}

export async function updateReportStatus(id: string, status: ReportStatus): Promise<void> {
  await supabase.from("reports").update({ status }).eq("id", id);
}

export interface AdminListing extends Listing {
  owner?: Profile;
}

export async function fetchAllListings(): Promise<AdminListing[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("*, listing_photos(*)")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  const mapped = (data as unknown as RawListing[]).map(mapListing);

  const ownerIds = [...new Set(mapped.map((l) => l.ownerId))];
  const ownerMap = new Map<string, Profile>();
  if (ownerIds.length) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("*")
      .in("id", ownerIds);
    for (const p of profs ?? []) {
      const profile = mapProfile(p as unknown as RawProfile);
      ownerMap.set(profile.id, profile);
    }
  }

  return mapped.map((l) => ({ ...l, owner: ownerMap.get(l.ownerId) }));
}

export async function updateListingStatus(id: string, status: ListingStatus): Promise<void> {
  await supabase.from("listings").update({ status }).eq("id", id);
}

export async function fetchProfileById(id: string): Promise<Profile | null> {
  const { data } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  return mapProfile(data as unknown as RawProfile);
}
