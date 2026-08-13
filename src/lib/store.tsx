import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { schools as schoolsData, getSchool as getSchoolData } from "@/data/schools";
import { toast } from "sonner";
import { joinName, namesFromMetadata, splitFullName, uid } from "./format";
import type {
  Conversation,
  Listing,
  ListingFilters,
  ListingPage,
  ListingStatus,
  Message,
  Profile,
  Report,
  ReportStatus,
  ReportTargetType,
  RoomType,
  SavedListing,
  School,
  SeekerPreferences,
} from "./types";

interface RawListing {
  id: string;
  owner_id: string;
  school_id: string;
  title: string;
  description: string | null;
  room_type: string;
  gender_preference: string;
  price: string | number;
  price_period: string;
  state: string;
  lga: string;
  area: string | null;
  available_from: string;
  available_until: string | null;
  status: string;
  seeker_preferences: SeekerPreferences | null;
  created_at: string;
  listing_photos?: RawPhoto[];
}
interface RawPhoto {
  id: string;
  url: string;
  position: number;
}
interface RawProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  school_id: string | null;
  bio: string | null;
  is_admin?: boolean;
  is_suspended?: boolean;
}
interface RawConversation {
  id: string;
  listing_id: string;
  seeker_id: string;
  lister_id: string;
  status: string;
  created_at: string;
}
interface RawMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: string;
  created_at: string;
}
interface RawReport {
  id: string;
  reporter_id: string;
  target_type: string;
  target_id: string | null;
  category: string;
  message: string;
  status: string;
  created_at: string;
}

function mapListing(row: RawListing): Listing {
  const photos = row.listing_photos ?? [];
  return {
    id: row.id,
    ownerId: row.owner_id,
    schoolId: row.school_id,
    title: row.title,
    description: row.description ?? "",
    roomType: row.room_type as RoomType,
    genderPreference: row.gender_preference as Listing["genderPreference"],
    price: Number(row.price),
    pricePeriod: row.price_period as Listing["pricePeriod"],
    state: row.state,
    lga: row.lga,
    area: row.area ?? undefined,
    availableFrom: row.available_from,
    availableUntil: row.available_until ?? undefined,
    status: row.status as Listing["status"],
    seekerPreferences: row.seeker_preferences ?? undefined,
    photos: photos
      .map((p) => ({ id: p.id, url: p.url, position: p.position }))
      .sort((a, b) => a.position - b.position),
    createdAt: row.created_at,
  };
}
function mapProfile(
  row: RawProfile,
  email?: string,
  emailConfirmedAt?: string | null,
  meta?: Record<string, unknown>,
): Profile {
  const names = namesFromMetadata(row.full_name, meta);
  const split = splitFullName(row.full_name);
  return {
    id: row.id,
    firstName: names.firstName || split.firstName,
    lastName: names.lastName || split.lastName,
    fullName: names.fullName || row.full_name,
    email,
    emailConfirmedAt: emailConfirmedAt ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    schoolId: row.school_id ?? undefined,
    bio: row.bio ?? undefined,
    isAdmin: row.is_admin ?? false,
    isSuspended: row.is_suspended ?? false,
  };
}
function mapConversation(row: RawConversation): Conversation {
  return {
    id: row.id,
    listingId: row.listing_id,
    seekerId: row.seeker_id,
    listerId: row.lister_id,
    status: row.status as Conversation["status"],
    createdAt: row.created_at,
  };
}
function mapMessage(row: RawMessage): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    content: row.content,
    type: row.type as Message["type"],
    createdAt: row.created_at,
  };
}
function mapReport(row: RawReport): Report {
  return {
    id: row.id,
    reporterId: row.reporter_id,
    targetType: row.target_type as ReportTargetType,
    targetId: row.target_id ?? undefined,
    category: row.category,
    message: row.message,
    status: row.status as ReportStatus,
    createdAt: row.created_at,
  };
}

interface SignupInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  whatsapp?: string;
  schoolId?: string;
}

interface CreateListingInput {
  schoolId: string;
  title: string;
  description: string;
  roomType: RoomType;
  genderPreference: Listing["genderPreference"];
  price: number;
  pricePeriod: Listing["pricePeriod"];
  state: string;
  lga: string;
  area?: string;
  availableFrom: string;
  availableUntil?: string;
  seekerPreferences?: SeekerPreferences;
  photos: { url: string; file?: File }[];
}

interface AppContextValue {
  authReady: boolean;
  currentUser: Profile | null;
  schools: School[];

  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  loginWithOAuth: (provider: "google" | "facebook") => Promise<{ ok: boolean; error?: string }>;
  signup: (input: SignupInput) => Promise<{ ok: boolean; error?: string }>;
  resendEmailVerification: (email?: string) => Promise<{ ok: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ ok: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;

  listings: Listing[];
  listingsLoading: boolean;
  getListing: (id: string) => Listing | undefined;
  fetchListingById: (id: string) => Promise<Listing | undefined>;
  fetchListings: (filters: ListingFilters, page?: number, pageSize?: number) => Promise<ListingPage>;
  fetchSchoolCounts: () => Promise<Record<string, number>>;
  createListing: (input: CreateListingInput) => Promise<Listing>;
  updateListingStatus: (id: string, status: ListingStatus) => Promise<void>;
  filterListings: (filters: ListingFilters) => Listing[];

  conversations: Conversation[];
  getConversation: (id: string) => Conversation | undefined;
  getConversationForListing: (listingId: string) => Conversation | undefined;
  expressInterest: (listingId: string) => Promise<string | undefined>;
  getMyConversations: () => Conversation[];
  getMessages: (conversationId: string) => Message[];
  fetchMessages: (conversationId: string) => Promise<void>;
  subscribeMessages: (conversationId: string) => () => void;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  shareContact: (conversationId: string) => Promise<void>;
  getOtherParticipant: (conversationId: string) => Profile | undefined;

  savedListings: SavedListing[];
  isSaved: (listingId: string) => boolean;
  toggleSave: (listingId: string) => Promise<void>;
  getSavedListings: () => Listing[];

  getProfile: (id: string) => Profile | undefined;
  getSchool: (id: string) => School | undefined;

  submitReport: (input: {
    targetType: ReportTargetType;
    targetId?: string;
    category: string;
    message: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  fetchAllReports: () => Promise<Report[]>;
  updateReportStatus: (id: string, status: ReportStatus) => Promise<void>;

  fetchAllUsers: () => Promise<Profile[]>;
  setUserAdmin: (id: string, isAdmin: boolean) => Promise<void>;
  setUserSuspended: (id: string, isSuspended: boolean) => Promise<void>;
}

export const LISTING_PAGE_SIZE = 12;

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [authReady, setAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messagesByConv, setMessagesByConv] = useState<Record<string, Message[]>>(
    {},
  );
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [profilesCache, setProfilesCache] = useState<Record<string, Profile>>({});
  const listingsRef = useRef<Listing[]>([]);
  listingsRef.current = listings;
  const savedListingsRef = useRef<SavedListing[]>([]);
  savedListingsRef.current = savedListings;
  const currentUserRef = useRef<Profile | null>(null);
  currentUserRef.current = currentUser;

  const cacheProfiles = useCallback((rows: RawProfile[]) => {
    setProfilesCache((prev) => {
      const next = { ...prev };
      for (const r of rows) next[r.id] = mapProfile(r);
      return next;
    });
  }, []);

  const mergeListings = useCallback((incoming: Listing[]) => {
    if (!incoming.length) return;
    setListings((prev) => {
      const byId = new Map(prev.map((l) => [l.id, l]));
      for (const listing of incoming) byId.set(listing.id, listing);
      return [...byId.values()];
    });
  }, []);

  const cacheOwners = useCallback(
    async (mapped: Listing[]) => {
      const ownerIds = [...new Set(mapped.map((l) => l.ownerId))];
      if (!ownerIds.length) return;
      const { data: profs } = await supabase
        .from("profiles")
        .select("*")
        .in("id", ownerIds);
      if (profs) cacheProfiles(profs as unknown as RawProfile[]);
    },
    [cacheProfiles],
  );

  const loadUserSession = useCallback(
    async (session: {
      user: {
        id: string;
        email?: string;
        email_confirmed_at?: string | null;
        user_metadata?: Record<string, unknown>;
      };
    }) => {
      const userId = session.user.id;
      const email = session.user.email;
      const emailConfirmedAt = session.user.email_confirmed_at ?? null;
      const meta = (session.user.user_metadata ?? {}) as Record<string, unknown>;
      const names = namesFromMetadata("Student", meta);
      const [{ data: prof }, { data: contact }] = await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("contact_details")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle(),
      ]);
      let profile: Profile | null = prof
        ? mapProfile(prof as RawProfile, email, emailConfirmedAt, meta)
        : null;
      if (!profile) {
        await supabase
          .from("profiles")
          .insert({ id: userId, full_name: names.fullName });
        profile = {
          id: userId,
          firstName: names.firstName,
          lastName: names.lastName,
          fullName: names.fullName,
          email,
          emailConfirmedAt: emailConfirmedAt ?? undefined,
        };
      }
      if (profile.isSuspended) {
        toast.error("Your account has been suspended", {
          description: "Contact support if you think this is a mistake.",
        });
        await supabase.auth.signOut();
        return;
      }
      if (contact) {
        const c = contact as { phone?: string | null; whatsapp?: string | null };
        profile.phone = c.phone ?? undefined;
        profile.whatsapp = c.whatsapp ?? undefined;
      }
      setCurrentUser(profile);
      setProfilesCache((prev) => ({ ...prev, [userId]: profile! }));

      // load conversations + saved
      const [{ data: convRows }, { data: savedRows }] = await Promise.all([
        supabase
          .from("conversations")
          .select("*")
          .or(`seeker_id.eq.${userId},lister_id.eq.${userId}`)
          .order("created_at", { ascending: false }),
        supabase
          .from("saved_listings")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
      ]);
      const convs = (convRows ?? []).map((r) =>
        mapConversation(r as unknown as RawConversation),
      );
      setConversations(convs);
      setSavedListings(
        (savedRows ?? []).map((r) => {
          const s = r as unknown as {
            id: string;
            user_id: string;
            listing_id: string;
            created_at: string;
          };
          return {
            id: s.id,
            userId: s.user_id,
            listingId: s.listing_id,
            createdAt: s.created_at,
          };
        }),
      );

      // cache participant profiles + load messages for previews
      const ids = new Set<string>();
      convs.forEach((c) => {
        ids.add(c.seekerId);
        ids.add(c.listerId);
      });
      const idsArr = [...ids];
      if (idsArr.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("*")
          .in("id", idsArr);
        if (profs) cacheProfiles(profs as unknown as RawProfile[]);
      }
      if (convs.length) {
        const convIds = convs.map((c) => c.id);
        const { data: msgs } = await supabase
          .from("messages")
          .select("*")
          .in("conversation_id", convIds)
          .order("created_at", { ascending: true });
        const byConv: Record<string, Message[]> = {};
        (msgs ?? []).forEach((m) => {
          const mapped = mapMessage(m as unknown as RawMessage);
          byConv[mapped.conversationId] = byConv[mapped.conversationId]
            ? [...byConv[mapped.conversationId], mapped]
            : [mapped];
        });
        setMessagesByConv((prev) => ({ ...prev, ...byConv }));
      }

      const listingIds = [...new Set(convs.map((c) => c.listingId))];
      if (listingIds.length) {
        const { data: listingRows } = await supabase
          .from("listings")
          .select("*, listing_photos(*)")
          .in("id", listingIds);
        if (listingRows?.length) {
          const mapped = (listingRows as unknown as RawListing[]).map(mapListing);
          mergeListings(mapped);
          void cacheOwners(mapped);
        }
      }
    },
    [cacheOwners, cacheProfiles, mergeListings],
  );

  // Auth state
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthReady(true);
      if (session?.user) {
        const u = session.user;
        const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
        const names = namesFromMetadata("Student", meta);
        setCurrentUser({
          id: u.id,
          email: u.email,
          emailConfirmedAt:
            (u as { email_confirmed_at?: string | null }).email_confirmed_at ??
            undefined,
          firstName: names.firstName,
          lastName: names.lastName,
          fullName: names.fullName,
          avatarUrl: String(meta.avatar_url ?? meta.picture ?? "") || undefined,
          schoolId: String(meta.school_id ?? "") || undefined,
        });
        setTimeout(() => {
          void loadUserSession(session);
        }, 0);
      } else {
        setCurrentUser(null);
        setConversations([]);
        setSavedListings([]);
        setMessagesByConv({});
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [loadUserSession]);

  const resendEmailVerification = useCallback(
    async (email?: string) => {
      const targetEmail = (email ?? currentUser?.email)?.trim();
      if (!targetEmail) {
        return { ok: false, error: "Missing email address." };
      }
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: targetEmail,
      });
      if (error) return { ok: false, error: error.message };
      toast.success("Confirmation link sent", {
        description: "Check your inbox when you have a moment — confirming is optional, but recommended.",
      });
      return { ok: true };
    },
    [currentUser?.email],
  );

  const requestPasswordReset = useCallback(async (email: string) => {
    const targetEmail = email.trim();
    if (!targetEmail) return { ok: false, error: "Missing email address." };
    const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return { ok: false, error: error.message };
    toast.success("Reset link sent", {
      description: "If that email is on HouseMate, check your inbox (and spam) for a link.",
    });
    return { ok: true };
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    if (password.length < 6) {
      return { ok: false, error: "Password must be at least 6 characters." };
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { ok: false, error: error.message };
    toast.success("Password updated");
    return { ok: true };
  }, []);

  const fetchListings = useCallback(
    async (filters: ListingFilters, page = 1, pageSize = LISTING_PAGE_SIZE): Promise<ListingPage> => {
      const empty: ListingPage = { items: [], total: 0, page, pageSize };
      let savedIds: string[] | undefined;
      if (filters.savedOnly) {
        savedIds = savedListingsRef.current
          .filter((s) => !currentUserRef.current || s.userId === currentUserRef.current.id)
          .map((s) => s.listingId);
        if (!savedIds.length) return empty;
      }
      const ids = filters.ids?.length ? filters.ids : savedIds;

      setListingsLoading(true);
      try {
        let query = supabase
          .from("listings")
          .select("*, listing_photos(*)", { count: "exact" });

        if (filters.schoolId) query = query.eq("school_id", filters.schoolId);
        if (filters.state) query = query.eq("state", filters.state);
        if (filters.lga) query = query.eq("lga", filters.lga);
        if (filters.roomTypes?.length) query = query.in("room_type", filters.roomTypes);
        if (filters.gender && filters.gender !== "any") {
          query = query.in("gender_preference", [filters.gender, "any"]);
        }
        if (filters.maxPrice) query = query.lte("price", filters.maxPrice);
        if (filters.pricePeriod && filters.pricePeriod !== "any") {
          query = query.eq("price_period", filters.pricePeriod);
        }
        if (filters.status && filters.status !== "any") query = query.eq("status", filters.status);
        if (filters.ownerId) query = query.eq("owner_id", filters.ownerId);
        if (ids?.length) query = query.in("id", ids);

        const q = filters.q?.trim();
        if (q) {
          const safe = q.replace(/[%_,()]/g, " ").trim();
          if (safe) {
            const needle = safe.toLowerCase();
            const schoolIds = schoolsData
              .filter(
                (s) =>
                  s.name.toLowerCase().includes(needle) ||
                  s.acronym.toLowerCase().includes(needle) ||
                  (s.aliases ?? []).some((a) => a.toLowerCase().includes(needle)) ||
                  s.state.toLowerCase().includes(needle),
              )
              .map((s) => s.id)
              .slice(0, 20);
            const parts = [
              `title.ilike.%${safe}%`,
              `description.ilike.%${safe}%`,
              `area.ilike.%${safe}%`,
              `lga.ilike.%${safe}%`,
            ];
            if (schoolIds.length) parts.push(`school_id.in.(${schoolIds.join(",")})`);
            query = query.or(parts.join(","));
          }
        }

        const from = (page - 1) * pageSize;
        const { data, count, error } = await query
          .order("created_at", { ascending: false })
          .range(from, from + pageSize - 1);

        if (error || !data) return empty;
        const mapped = (data as unknown as RawListing[]).map(mapListing);
        mergeListings(mapped);
        void cacheOwners(mapped);
        return { items: mapped, total: count ?? mapped.length, page, pageSize };
      } finally {
        setListingsLoading(false);
      }
    },
    [cacheOwners, mergeListings],
  );

  const fetchListingById = useCallback(
    async (id: string) => {
      const existing = listingsRef.current.find((l) => l.id === id);
      if (existing) return existing;
      const { data } = await supabase
        .from("listings")
        .select("*, listing_photos(*)")
        .eq("id", id)
        .maybeSingle();
      if (!data) return undefined;
      const mapped = mapListing(data as unknown as RawListing);
      mergeListings([mapped]);
      void cacheOwners([mapped]);
      return mapped;
    },
    [cacheOwners, mergeListings],
  );

  const fetchSchoolCounts = useCallback(async () => {
    const { data } = await supabase
      .from("listings")
      .select("school_id")
      .eq("status", "available")
      .order("created_at", { ascending: false })
      .limit(1000);
    const counts: Record<string, number> = {};
    for (const row of data ?? []) {
      const id = (row as { school_id: string }).school_id;
      counts[id] = (counts[id] ?? 0) + 1;
    }
    return counts;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, []);

  const loginWithOAuth = useCallback(async (provider: "google" | "facebook") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, []);

  const signup = useCallback(async (input: SignupInput) => {
    const firstName = input.firstName.trim();
    const lastName = input.lastName.trim();
    const fullName = joinName(firstName, lastName);
    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim(),
      password: input.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          phone: input.phone?.trim() || null,
          whatsapp: input.whatsapp?.trim() || input.phone?.trim() || null,
          school_id: input.schoolId || null,
        },
      },
    });
    if (error) return { ok: false, error: error.message };
    if (!data.user) return { ok: false, error: "Could not create account." };
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<Profile>) => {
      if (!currentUser) return;
      const id = currentUser.id;
      const nextFullName =
        patch.fullName ||
        joinName(
          patch.firstName ?? currentUser.firstName,
          patch.lastName ?? currentUser.lastName,
        ) ||
        currentUser.fullName;
      await supabase
        .from("profiles")
        .update({
          full_name: nextFullName,
          avatar_url: patch.avatarUrl,
          school_id: patch.schoolId,
          bio: patch.bio,
        })
        .eq("id", id);
      if (patch.firstName !== undefined || patch.lastName !== undefined || patch.fullName !== undefined) {
        await supabase.auth.updateUser({
          data: {
            first_name: patch.firstName ?? currentUser.firstName,
            last_name: patch.lastName ?? currentUser.lastName,
            full_name: nextFullName,
          },
        });
      }
      if (patch.phone !== undefined || patch.whatsapp !== undefined) {
        await supabase.from("contact_details").upsert(
          {
            user_id: id,
            phone: patch.phone ?? null,
            whatsapp: patch.whatsapp ?? null,
          },
          { onConflict: "user_id" },
        );
      }
      setCurrentUser((prev) => (prev ? { ...prev, ...patch } : prev));
      setProfilesCache((prev) => ({
        ...prev,
        [id]: { ...(prev[id] ?? ({} as Profile)), ...patch } as Profile,
      }));
    },
    [currentUser],
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!currentUser) throw new Error("Not signed in");
      const ext = (file.name.split(".").pop() || "png").toLowerCase();
      const path = `${currentUser.id}/${uid("a")}.${ext}`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, file, {
          contentType: file.type || "image/png",
          upsert: false,
        });
      if (error) throw error;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      return data.publicUrl;
    },
    [currentUser],
  );

  const getListing = useCallback(
    (id: string) => listings.find((l) => l.id === id),
    [listings],
  );

  const createListing = useCallback(
    async (input: CreateListingInput): Promise<Listing> => {
      const ownerId = currentUser?.id;
      if (!ownerId) throw new Error("Not signed in");
      const photoUrls: { url: string; position: number }[] = [];
      for (let i = 0; i < input.photos.length; i++) {
        const p = input.photos[i];
        let url = p.url;
        if (p.file) {
          const ext = (p.file.name.split(".").pop() || "jpg").toLowerCase();
          const path = `${ownerId}/${uid("p")}.${ext}`;
          const { error } = await supabase.storage
            .from("listing-photos")
            .upload(path, p.file, {
              contentType: p.file.type || "image/jpeg",
              upsert: false,
            });
          if (error) throw error;
          const { data } = supabase.storage
            .from("listing-photos")
            .getPublicUrl(path);
          url = data.publicUrl;
        }
        photoUrls.push({ url, position: i });
      }

      const { data: listingRow, error } = await supabase
        .from("listings")
        .insert({
          owner_id: ownerId,
          school_id: input.schoolId,
          title: input.title,
          description: input.description,
          room_type: input.roomType,
          gender_preference: input.genderPreference,
          price: input.price,
          price_period: input.pricePeriod,
          state: input.state,
          lga: input.lga,
          area: input.area || null,
          available_from: input.availableFrom,
          available_until: input.availableUntil || null,
          status: "available",
          seeker_preferences: input.seekerPreferences ?? null,
        })
        .select("*")
        .single();
      if (error || !listingRow) throw error ?? new Error("Failed to create listing");

      const row = listingRow as unknown as RawListing;
      if (photoUrls.length) {
        const { data: insertedPhotos } = await supabase
          .from("listing_photos")
          .insert(
            photoUrls.map((p) => ({
              listing_id: row.id,
              url: p.url,
              position: p.position,
            })),
          )
          .select("*");
        row.listing_photos = (insertedPhotos ?? []) as unknown as RawPhoto[];
      } else {
        row.listing_photos = [];
      }
      const listing = mapListing(row);
      setListings((prev) => [listing, ...prev]);
      if (currentUser)
        setProfilesCache((prev) => ({ ...prev, [ownerId]: currentUser }));
      return listing;
    },
    [currentUser],
  );

  const updateListingStatus = useCallback(
    async (id: string, status: ListingStatus) => {
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status } : l)),
      );
      await supabase.from("listings").update({ status }).eq("id", id);
    },
    [],
  );

  const filterListings = useCallback(
    (filters: ListingFilters): Listing[] => {
      return listings.filter((l) => {
        if (filters.schoolId && l.schoolId !== filters.schoolId) return false;
        if (filters.state && l.state !== filters.state) return false;
        if (filters.lga && l.lga !== filters.lga) return false;
        if (
          filters.roomTypes &&
          filters.roomTypes.length > 0 &&
          !filters.roomTypes.includes(l.roomType)
        )
          return false;
        if (
          filters.gender &&
          filters.gender !== "any" &&
          l.genderPreference !== "any" &&
          l.genderPreference !== filters.gender
        )
          return false;
        if (filters.maxPrice && l.price > filters.maxPrice) return false;
        if (
          filters.pricePeriod &&
          filters.pricePeriod !== "any" &&
          l.pricePeriod !== filters.pricePeriod
        )
          return false;
        if (
          filters.status &&
          filters.status !== "any" &&
          l.status !== filters.status
        )
          return false;
        if (filters.q) {
          const q = filters.q.toLowerCase();
          const school = getSchoolData(l.schoolId);
          const hay = `${l.title} ${l.description} ${l.area ?? ""} ${l.lga} ${
            school?.name ?? ""
          } ${school?.acronym ?? ""} ${(school?.aliases ?? []).join(" ")}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (filters.savedOnly) {
          if (!savedListings.some((s) => s.listingId === l.id)) return false;
        }
        return true;
      });
    },
    [listings, savedListings],
  );

  const getConversation = useCallback(
    (id: string) => conversations.find((c) => c.id === id),
    [conversations],
  );

  const getConversationForListing = useCallback(
    (listingId: string) =>
      conversations.find(
        (c) => c.listingId === listingId && c.seekerId === currentUser?.id,
      ),
    [conversations, currentUser?.id],
  );

  const expressInterest = useCallback(
    async (listingId: string): Promise<string | undefined> => {
      if (!currentUser) return undefined;
      const listing =
        listingsRef.current.find((l) => l.id === listingId) ??
        (await fetchListingById(listingId));
      if (!listing) return undefined;
      const existed = conversations.find(
        (c) =>
          c.listingId === listingId && c.seekerId === currentUser.id,
      );
      const { data, error } = await supabase
        .from("conversations")
        .upsert(
          {
            listing_id: listingId,
            seeker_id: currentUser.id,
            lister_id: listing.ownerId,
            status: "active",
          },
          { onConflict: "listing_id,seeker_id" },
        )
        .select("*")
        .single();
      if (error || !data) return undefined;
      const conv = mapConversation(data as unknown as RawConversation);
      setConversations((prev) =>
        prev.some((c) => c.id === conv.id) ? prev : [conv, ...prev],
      );
      if (!existed) {
        await supabase.from("messages").insert({
          conversation_id: conv.id,
          sender_id: currentUser.id,
          content: "You started a conversation about this listing.",
          type: "system",
        });
        setMessagesByConv((prev) => ({
          ...prev,
          [conv.id]: [
            {
              id: uid("msg"),
              conversationId: conv.id,
              senderId: currentUser.id,
              content: "You started a conversation about this listing.",
              type: "system",
              createdAt: new Date().toISOString(),
            },
          ],
        }));
      }
      return conv.id;
    },
    [conversations, currentUser, fetchListingById],
  );

  const getMyConversations = useCallback(() => conversations, [conversations]);

  const getMessages = useCallback(
    (conversationId: string) =>
      (messagesByConv[conversationId] ?? []).slice().sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      ),
    [messagesByConv],
  );

  const fetchMessages = useCallback(async (conversationId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    setMessagesByConv((prev) => ({
      ...prev,
      [conversationId]: (data ?? []).map((m) =>
        mapMessage(m as unknown as RawMessage),
      ),
    }));
  }, []);

  const subscribeMessages = useCallback((conversationId: string) => {
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const msg = mapMessage(payload.new as unknown as RawMessage);
          setMessagesByConv((prev) => {
            const existing = prev[conversationId] ?? [];
            if (existing.some((m) => m.id === msg.id)) return prev;
            return {
              ...prev,
              [conversationId]: [...existing, msg].sort(
                (a, b) =>
                  new Date(a.createdAt).getTime() -
                  new Date(b.createdAt).getTime(),
              ),
            };
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sendMessage = useCallback(
    async (conversationId: string, content: string) => {
      if (!currentUser || !content.trim()) return;
      const tempId = uid("msg");
      const optimistic: Message = {
        id: tempId,
        conversationId,
        senderId: currentUser.id,
        content: content.trim(),
        type: "text",
        createdAt: new Date().toISOString(),
      };
      setMessagesByConv((prev) => ({
        ...prev,
        [conversationId]: [...(prev[conversationId] ?? []), optimistic],
      }));
      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: currentUser.id,
          content: content.trim(),
          type: "text",
        })
        .select("*")
        .single();
      if (!error && data) {
        const real = mapMessage(data as unknown as RawMessage);
        setMessagesByConv((prev) => ({
          ...prev,
          [conversationId]: (prev[conversationId] ?? []).map((m) =>
            m.id === tempId ? real : m,
          ),
        }));
      } else if (error) {
        setMessagesByConv((prev) => ({
          ...prev,
          [conversationId]: (prev[conversationId] ?? []).filter(
            (m) => m.id !== tempId,
          ),
        }));
      }
    },
    [currentUser],
  );

  const shareContact = useCallback(
    async (conversationId: string) => {
      if (!currentUser) return;
      const conv = conversations.find((c) => c.id === conversationId);
      if (!conv || conv.status === "contact_shared") return;
      const contact = [currentUser.phone, currentUser.whatsapp]
        .filter(Boolean)
        .join(" • ");
      if (!contact) return;
      await supabase.from("messages").insert([
        {
          conversation_id: conversationId,
          sender_id: currentUser.id,
          content: contact,
          type: "contact_share",
        },
        {
          conversation_id: conversationId,
          sender_id: currentUser.id,
          content: "You shared your contact details.",
          type: "system",
        },
      ]);
      await supabase
        .from("conversations")
        .update({ status: "contact_shared" })
        .eq("id", conversationId);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, status: "contact_shared" } : c,
        ),
      );
      void fetchMessages(conversationId);
    },
    [currentUser, conversations, fetchMessages],
  );

  const getOtherParticipant = useCallback(
    (conversationId: string) => {
      const conv = conversations.find((c) => c.id === conversationId);
      if (!conv || !currentUser) return undefined;
      const otherId =
        conv.seekerId === currentUser.id ? conv.listerId : conv.seekerId;
      return profilesCache[otherId];
    },
    [conversations, currentUser, profilesCache],
  );

  const isSaved = useCallback(
    (listingId: string) =>
      savedListings.some(
        (s) => s.listingId === listingId && s.userId === currentUser?.id,
      ),
    [savedListings, currentUser?.id],
  );

  const toggleSave = useCallback(
    async (listingId: string) => {
      if (!currentUser) return;
      const existing = savedListings.find(
        (s) => s.listingId === listingId && s.userId === currentUser.id,
      );
      if (existing) {
        setSavedListings((prev) => prev.filter((s) => s.id !== existing.id));
        await supabase.from("saved_listings").delete().eq("id", existing.id);
      } else {
        const tempId = uid("sav");
        const optimistic: SavedListing = {
          id: tempId,
          userId: currentUser.id,
          listingId,
          createdAt: new Date().toISOString(),
        };
        setSavedListings((prev) => [optimistic, ...prev]);
        const { data, error } = await supabase
          .from("saved_listings")
          .insert({ user_id: currentUser.id, listing_id: listingId })
          .select("*")
          .single();
        if (!error && data) {
          const s = data as unknown as {
            id: string;
            user_id: string;
            listing_id: string;
            created_at: string;
          };
          setSavedListings((prev) =>
            prev.map((x) =>
              x.id === tempId
                ? {
                    id: s.id,
                    userId: s.user_id,
                    listingId: s.listing_id,
                    createdAt: s.created_at,
                  }
                : x,
            ),
          );
        } else if (error) {
          setSavedListings((prev) => prev.filter((s) => s.id !== tempId));
        }
      }
    },
    [currentUser, savedListings],
  );

  const getSavedListings = useCallback(() => {
    if (!currentUser) return [];
    const ids = savedListings
      .filter((s) => s.userId === currentUser.id)
      .map((s) => s.listingId);
    return listings
      .filter((l) => ids.includes(l.id))
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [savedListings, listings, currentUser]);

  const getProfile = useCallback(
    (id: string) => profilesCache[id],
    [profilesCache],
  );

  const submitReport = useCallback(
    async (input: {
      targetType: ReportTargetType;
      targetId?: string;
      category: string;
      message: string;
    }) => {
      if (!currentUser) {
        return { ok: false, error: "You need to be signed in to submit a report." };
      }
      const { error } = await supabase.from("reports").insert({
        reporter_id: currentUser.id,
        target_type: input.targetType,
        target_id: input.targetId ?? null,
        category: input.category,
        message: input.message.trim(),
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    },
    [currentUser],
  );

  const fetchAllReports = useCallback(async (): Promise<Report[]> => {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    const reports = (data as unknown as RawReport[]).map(mapReport);

    // Cache reporter profiles for display.
    const reporterIds = [...new Set(reports.map((r) => r.reporterId))];
    if (reporterIds.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("*")
        .in("id", reporterIds);
      if (profs) cacheProfiles(profs as unknown as RawProfile[]);
    }
    return reports;
  }, [cacheProfiles]);

  const updateReportStatus = useCallback(async (id: string, status: ReportStatus) => {
    await supabase.from("reports").update({ status }).eq("id", id);
  }, []);

  const fetchAllUsers = useCallback(async (): Promise<Profile[]> => {
    const [{ data: profs, error }, { data: contacts }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("contact_details").select("*"),
    ]);
    if (error || !profs) return [];
    const contactByUser = new Map(
      (contacts ?? []).map((c) => {
        const row = c as unknown as { user_id: string; email: string | null; phone: string | null };
        return [row.user_id, row];
      }),
    );
    const users = (profs as unknown as RawProfile[]).map((row) => {
      const contact = contactByUser.get(row.id);
      return mapProfile(row, contact?.email ?? undefined);
    });
    cacheProfiles(profs as unknown as RawProfile[]);
    return users;
  }, [cacheProfiles]);

  const setUserAdmin = useCallback(async (id: string, isAdmin: boolean) => {
    await supabase.from("profiles").update({ is_admin: isAdmin }).eq("id", id);
  }, []);

  const setUserSuspended = useCallback(async (id: string, isSuspended: boolean) => {
    await supabase.from("profiles").update({ is_suspended: isSuspended }).eq("id", id);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      authReady,
      currentUser,
      schools: schoolsData,
      login,
      loginWithOAuth,
      signup,
      resendEmailVerification,
      requestPasswordReset,
      updatePassword,
      logout,
      updateProfile,
      uploadAvatar,
      listings,
      listingsLoading,
      getListing,
      fetchListingById,
      fetchListings,
      fetchSchoolCounts,
      createListing,
      updateListingStatus,
      filterListings,
      conversations,
      getConversation,
      getConversationForListing,
      expressInterest,
      getMyConversations,
      getMessages,
      fetchMessages,
      subscribeMessages,
      sendMessage,
      shareContact,
      getOtherParticipant,
      savedListings,
      isSaved,
      toggleSave,
      getSavedListings,
      getProfile,
      getSchool: getSchoolData,
      submitReport,
      fetchAllReports,
      updateReportStatus,
      fetchAllUsers,
      setUserAdmin,
      setUserSuspended,
    }),
    [
      authReady,
      currentUser,
      login,
      loginWithOAuth,
      signup,
      resendEmailVerification,
      requestPasswordReset,
      updatePassword,
      logout,
      updateProfile,
      uploadAvatar,
      listings,
      listingsLoading,
      getListing,
      fetchListingById,
      fetchListings,
      fetchSchoolCounts,
      createListing,
      updateListingStatus,
      filterListings,
      conversations,
      getConversation,
      getConversationForListing,
      expressInterest,
      getMyConversations,
      getMessages,
      fetchMessages,
      subscribeMessages,
      sendMessage,
      shareContact,
      getOtherParticipant,
      savedListings,
      isSaved,
      toggleSave,
      getSavedListings,
      getProfile,
      submitReport,
      fetchAllReports,
      updateReportStatus,
      fetchAllUsers,
      setUserAdmin,
      setUserSuspended,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
