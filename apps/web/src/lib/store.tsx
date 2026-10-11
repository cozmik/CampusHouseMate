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
import { supabase } from "@housemates/shared-supabase";
import { mapConversation, mapListing, mapMessage, mapProfile, mapReport, type Json, type RawConversation, type RawListing, type RawMessage, type RawPhoto, type RawProfile, type RawReport } from "@housemates/shared-supabase";
import { schools as schoolsData, getSchool as getSchoolData, lgasForState } from "@housemates/shared-data";
import { toast } from "sonner";
import { joinName, namesFromMetadata, splitFullName, uid } from "@housemates/shared-utils";
import { captureEvent } from "@/lib/posthog";
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
} from "@housemates/shared-types";


interface SignupInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  whatsapp?: string;
  schoolId?: string;
}

export interface CreateListingInput {
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
  hasPassword: boolean;
  schools: School[];

  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  loginWithOAuth: (provider: "google" | "facebook") => Promise<{ ok: boolean; error?: string }>;
  signup: (input: SignupInput) => Promise<{ ok: boolean; error?: string; created?: boolean }>;
  resendEmailVerification: (email?: string) => Promise<{ ok: boolean; error?: string }>;
  requestPasswordReset: (email: string) => Promise<{ ok: boolean; error?: string }>;
  updatePassword: (password: string, currentPassword?: string) => Promise<{ ok: boolean; error?: string }>;
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
  updateListing: (id: string, input: CreateListingInput) => Promise<Listing>;
  archiveListing: (id: string) => Promise<void>;
  updateListingStatus: (id: string, status: ListingStatus) => Promise<void>;
  filterListings: (filters: ListingFilters) => Listing[];

  conversations: Conversation[];
  getConversation: (id: string) => Conversation | undefined;
  getConversationForListing: (listingId: string) => Conversation | undefined;
  expressInterest: (listingId: string) => Promise<string | undefined>;
  getMyConversations: () => Conversation[];
  isConversationUnread: (conversation: Conversation) => boolean;
  unreadCount: number;
  openConversation: (conversationId: string) => () => void;
  getMessages: (conversationId: string) => Message[];
  fetchMessages: (conversationId: string) => Promise<void>;
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

const LISTING_PHOTOS_BUCKET = "listing-photos";
const LISTING_PHOTOS_URL_MARKER = `/storage/v1/object/public/${LISTING_PHOTOS_BUCKET}/`;

async function uploadListingPhotos(
  ownerId: string,
  photos: CreateListingInput["photos"],
): Promise<{ url: string; position: number }[]> {
  const out: { url: string; position: number }[] = [];
  for (let i = 0; i < photos.length; i++) {
    const p = photos[i];
    let url = p.url;
    if (p.file) {
      const ext = (p.file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${ownerId}/${uid("p")}.${ext}`;
      const { error } = await supabase.storage
        .from(LISTING_PHOTOS_BUCKET)
        .upload(path, p.file, {
          contentType: p.file.type || "image/jpeg",
          upsert: false,
        });
      if (error) throw error;
      const { data } = supabase.storage
        .from(LISTING_PHOTOS_BUCKET)
        .getPublicUrl(path);
      url = data.publicUrl;
    }
    out.push({ url, position: i });
  }
  return out;
}

function listingPhotoPath(url: string): string | undefined {
  const at = url.indexOf(LISTING_PHOTOS_URL_MARKER);
  if (at < 0) return undefined;
  return decodeURIComponent(url.slice(at + LISTING_PHOTOS_URL_MARKER.length).split("?")[0]);
}

function myLastReadAt(conv: Conversation, userId: string): string | undefined {
  return conv.seekerId === userId ? conv.seekerLastReadAt : conv.listerLastReadAt;
}

function laterIso(a: string | undefined, b: string): string {
  return a && new Date(a).getTime() > new Date(b).getTime() ? a : b;
}

// Timestamps only move forward, so a stale realtime event can't undo a local read.
function mergeConversation(current: Conversation, incoming: Conversation): Conversation {
  return {
    ...incoming,
    lastMessageAt: laterIso(current.lastMessageAt, incoming.lastMessageAt),
    seekerLastReadAt: incoming.seekerLastReadAt
      ? laterIso(current.seekerLastReadAt, incoming.seekerLastReadAt)
      : current.seekerLastReadAt,
    listerLastReadAt: incoming.listerLastReadAt
      ? laterIso(current.listerLastReadAt, incoming.listerLastReadAt)
      : current.listerLastReadAt,
  };
}

function conversationUnreadFor(conv: Conversation, userId: string): boolean {
  if (conv.seekerId === conv.listerId) return false;
  // Rows without any read markers predate unread tracking.
  if (!conv.seekerLastReadAt && !conv.listerLastReadAt) return false;
  const lastRead = myLastReadAt(conv, userId);
  if (!lastRead) return true;
  return new Date(conv.lastMessageAt).getTime() > new Date(lastRead).getTime();
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [authReady, setAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [hasPassword, setHasPassword] = useState(false);
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
  const conversationsRef = useRef<Conversation[]>([]);
  conversationsRef.current = conversations;
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
        app_metadata?: { provider?: string };
        identities?: { provider: string }[] | null;
      };
    }) => {
      const userId = session.user.id;
      const email = session.user.email;
      const emailConfirmedAt = session.user.email_confirmed_at ?? null;
      const meta = (session.user.user_metadata ?? {}) as Record<string, unknown>;
      const names = namesFromMetadata("Student", meta);
      setHasPassword(
        Boolean(
          session.user.app_metadata?.provider === "email" ||
            session.user.identities?.some((i) => i.provider === "email"),
        ),
      );
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
          .insert({ id: userId, full_name: names.fullName, email });
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
        const latest = await supabase.rpc("get_latest_messages", {
          conv_ids: convIds,
        });
        let msgs: unknown[] | null = latest.data;
        if (latest.error) {
          const { data } = await supabase
            .from("messages")
            .select("*")
            .in("conversation_id", convIds)
            .order("created_at", { ascending: true });
          msgs = data;
        }
        const byConv: Record<string, Message[]> = {};
        (msgs ?? []).forEach((m) => {
          const mapped = mapMessage(m as unknown as RawMessage);
          byConv[mapped.conversationId] = byConv[mapped.conversationId]
            ? [...byConv[mapped.conversationId], mapped]
            : [mapped];
        });
        setMessagesByConv((prev) => {
          const next = { ...prev };
          for (const [convId, list] of Object.entries(byConv)) {
            if (!next[convId]?.length) next[convId] = list;
          }
          return next;
        });
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
        setHasPassword(
          Boolean(
            u.app_metadata?.provider === "email" ||
              u.identities?.some((i) => i.provider === "email"),
          ),
        );
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
        setHasPassword(false);
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
      description: "If that email is on Housemates Finder, check your inbox (and spam) for a link.",
    });
    return { ok: true };
  }, []);

  const updatePassword = useCallback(
    async (password: string, currentPassword?: string) => {
      if (password.length < 6) {
        return { ok: false, error: "Password must be at least 6 characters." };
      }
      if (currentPassword) {
        const email = currentUserRef.current?.email;
        if (!email) {
          return { ok: false, error: "No email on file to verify against." };
        }
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email,
          password: currentPassword,
        });
        if (verifyError) {
          return { ok: false, error: "Current password is incorrect." };
        }
      }
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return { ok: false, error: error.message };
      toast.success(
        currentPassword
          ? "Password updated"
          : "Password set — you can now also sign in with email + password",
      );
      return { ok: true };
    },
    [],
  );

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
          .select("*, listing_photos(*)", { count: "exact" })
          .is("archived_at", null);

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
      .is("archived_at", null)
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
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) return { ok: false, error: error.message };
    captureEvent("logged_in", { method: "password" });
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
    captureEvent("logged_in", { method: provider });
    return { ok: true };
  }, []);

  const signup = useCallback(async (input: SignupInput) => {
    const firstName = input.firstName.trim();
    const lastName = input.lastName.trim();
    const fullName = joinName(firstName, lastName);
    const email = input.email.trim().toLowerCase();
    const { data, error } = await supabase.auth.signUp({
      email,
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
    if (data.session) {
      captureEvent("signed_up", { school_id: input.schoolId || undefined });
      return { ok: true };
    }

    // Duplicate signUp returns the existing user with no identities and no session.
    const alreadyRegistered = !data.user.identities?.length;
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: input.password,
    });
    if (!signInError) {
      captureEvent("signed_up", { school_id: input.schoolId || undefined });
      return { ok: true };
    }
    if (alreadyRegistered) {
      return { ok: false, error: "An account with this email already exists. Try logging in." };
    }
    // User row exists (you will see it in the dashboard) but GoTrue still
    // refuses a session while "Confirm email" is required.
    captureEvent("signed_up", { school_id: input.schoolId || undefined, session: false });
    return {
      ok: false,
      created: true,
      error: "Your account was created. Log in with the same email and password.",
    };
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
      const school = getSchoolData(input.schoolId);
      if (!school) throw new Error("Select a school.");
      if (!lgasForState(school.state).includes(input.lga)) {
        throw new Error("That LGA is not in the school's state.");
      }
      const photoUrls = await uploadListingPhotos(ownerId, input.photos);

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
          state: school.state,
          lga: input.lga,
          area: input.area || null,
          available_from: input.availableFrom,
          available_until: input.availableUntil || null,
          status: "available",
          seeker_preferences: (input.seekerPreferences ?? null) as unknown as Json,
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
      captureEvent("listing_posted", {
        listing_id: listing.id,
        school_id: listing.schoolId,
        room_type: listing.roomType,
        price: listing.price,
        price_period: listing.pricePeriod,
        state: listing.state,
      });
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

  const updateListing = useCallback(
    async (id: string, input: CreateListingInput): Promise<Listing> => {
      const editorId = currentUser?.id;
      if (!editorId) throw new Error("Not signed in");
      const school = getSchoolData(input.schoolId);
      if (!school) throw new Error("Select a school.");
      if (!lgasForState(school.state).includes(input.lga)) {
        throw new Error("That LGA is not in the school's state.");
      }
      const before = listingsRef.current.find((l) => l.id === id);
      const photoUrls = await uploadListingPhotos(editorId, input.photos);

      const { data: listingRow, error } = await supabase
        .from("listings")
        .update({
          school_id: input.schoolId,
          title: input.title,
          description: input.description,
          room_type: input.roomType,
          gender_preference: input.genderPreference,
          price: input.price,
          price_period: input.pricePeriod,
          state: school.state,
          lga: input.lga,
          area: input.area || null,
          available_from: input.availableFrom,
          available_until: input.availableUntil || null,
          seeker_preferences: (input.seekerPreferences ?? null) as unknown as Json,
        })
        .eq("id", id)
        .select("*")
        .single();
      if (error || !listingRow) throw error ?? new Error("Failed to update listing");

      const { error: clearError } = await supabase
        .from("listing_photos")
        .delete()
        .eq("listing_id", id);
      if (clearError) throw clearError;
      let insertedPhotos: RawPhoto[] = [];
      if (photoUrls.length) {
        const { data, error: photoError } = await supabase
          .from("listing_photos")
          .insert(photoUrls.map((p) => ({ listing_id: id, url: p.url, position: p.position })))
          .select("*");
        if (photoError) throw photoError;
        insertedPhotos = (data ?? []) as unknown as RawPhoto[];
      }

      const keptUrls = new Set(photoUrls.map((p) => p.url));
      const removedPaths = (before?.photos ?? [])
        .filter((p) => !keptUrls.has(p.url))
        .map((p) => listingPhotoPath(p.url))
        .filter((p): p is string => Boolean(p));
      if (removedPaths.length) {
        void supabase.storage.from(LISTING_PHOTOS_BUCKET).remove(removedPaths);
      }

      const row = listingRow as unknown as RawListing;
      row.listing_photos = insertedPhotos;
      const listing = mapListing(row);
      mergeListings([listing]);
      captureEvent("listing_updated", { listing_id: id });
      return listing;
    },
    [currentUser?.id, mergeListings],
  );

  const archiveListing = useCallback(async (id: string) => {
    const archivedAt = new Date().toISOString();
    const { error } = await supabase
      .from("listings")
      .update({ archived_at: archivedAt })
      .eq("id", id);
    if (error) throw error;
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, archivedAt } : l)),
    );
    captureEvent("listing_deleted", { listing_id: id });
  }, []);

  const filterListings = useCallback(
    (filters: ListingFilters): Listing[] => {
      return listings.filter((l) => {
        if (l.archivedAt) return false;
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
      if (currentUser.id === listing.ownerId) {
        toast.error("You can't message yourself about your own listing.");
        return undefined;
      }
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
        captureEvent("interest_expressed", {
          listing_id: listingId,
          conversation_id: conv.id,
        });
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

  const getMyConversations = useCallback(
    () =>
      conversations
        .filter((c) => c.seekerId !== c.listerId)
        .sort(
          (a, b) =>
            new Date(b.lastMessageAt).getTime() -
            new Date(a.lastMessageAt).getTime(),
        ),
    [conversations],
  );

  const isConversationUnread = useCallback(
    (conv: Conversation) =>
      currentUser ? conversationUnreadFor(conv, currentUser.id) : false,
    [currentUser],
  );

  const unreadCount = useMemo(
    () => conversations.filter((c) => isConversationUnread(c)).length,
    [conversations, isConversationUnread],
  );

  // Pass upTo when the caller already knows the newest message time; otherwise the
  // conversation is only marked if it currently looks unread.
  const markConversationRead = useCallback((conversationId: string, upTo?: string) => {
    const me = currentUserRef.current?.id;
    if (!me) return;
    let until = upTo;
    if (!until) {
      const conv = conversationsRef.current.find((c) => c.id === conversationId);
      if (!conv || !conversationUnreadFor(conv, me)) return;
      until = conv.lastMessageAt;
    }
    const readAt = laterIso(until, new Date().toISOString());
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== conversationId) return c;
        return c.seekerId === me
          ? { ...c, seekerLastReadAt: laterIso(c.seekerLastReadAt, readAt) }
          : { ...c, listerLastReadAt: laterIso(c.listerLastReadAt, readAt) };
      }),
    );
    void supabase.rpc("mark_conversation_read", { conv_id: conversationId });
  }, []);

  const activeConversationRef = useRef<string | null>(null);

  const openConversation = useCallback(
    (conversationId: string) => {
      activeConversationRef.current = conversationId;
      markConversationRead(conversationId);
      return () => {
        if (activeConversationRef.current === conversationId) {
          activeConversationRef.current = null;
        }
      };
    },
    [markConversationRead],
  );

  const loadConversation = useCallback(
    async (conversationId: string) => {
      const { data } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .maybeSingle();
      if (!data) return;
      const conv = mapConversation(data as unknown as RawConversation);
      setConversations((prev) =>
        prev.some((c) => c.id === conv.id) ? prev : [conv, ...prev],
      );
      const { data: profs } = await supabase
        .from("profiles")
        .select("*")
        .in("id", [conv.seekerId, conv.listerId]);
      if (profs) cacheProfiles(profs as unknown as RawProfile[]);
      void fetchListingById(conv.listingId);
    },
    [cacheProfiles, fetchListingById],
  );

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

  // One live feed for the whole inbox. RLS limits events to the user's own conversations.
  const userId = currentUser?.id;
  useEffect(() => {
    if (!userId) return;

    const onMessage = (msg: Message) => {
      setMessagesByConv((prev) => {
        const existing = prev[msg.conversationId] ?? [];
        if (existing.some((m) => m.id === msg.id)) return prev;
        return {
          ...prev,
          [msg.conversationId]: [...existing, msg].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime(),
          ),
        };
      });
      const known = conversationsRef.current.some((c) => c.id === msg.conversationId);
      if (!known) {
        void loadConversation(msg.conversationId);
        return;
      }
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== msg.conversationId) return c;
          const next = { ...c, lastMessageAt: laterIso(c.lastMessageAt, msg.createdAt) };
          if (msg.senderId === userId) {
            if (c.seekerId === userId) next.seekerLastReadAt = laterIso(c.seekerLastReadAt, msg.createdAt);
            else next.listerLastReadAt = laterIso(c.listerLastReadAt, msg.createdAt);
          }
          return next;
        }),
      );
      if (msg.senderId !== userId && activeConversationRef.current === msg.conversationId) {
        markConversationRead(msg.conversationId, msg.createdAt);
      }
    };

    const onConversation = (conv: Conversation) => {
      const current = conversationsRef.current.find((c) => c.id === conv.id);
      if (!current) {
        void loadConversation(conv.id);
        return;
      }
      const merged = mergeConversation(current, conv);
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? mergeConversation(c, conv) : c)),
      );
      if (
        activeConversationRef.current === conv.id &&
        conversationUnreadFor(merged, userId)
      ) {
        markConversationRead(conv.id, merged.lastMessageAt);
      }
    };

    const channel = supabase
      .channel(`inbox:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => onMessage(mapMessage(payload.new as unknown as RawMessage)),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        (payload) => {
          if (payload.eventType === "DELETE") return;
          onConversation(mapConversation(payload.new as unknown as RawConversation));
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, loadConversation, markConversationRead]);

  const sendMessage = useCallback(
    async (conversationId: string, content: string) => {
      if (!currentUser || !content.trim()) return;
      const conv = conversationsRef.current.find((c) => c.id === conversationId);
      if (conv && conv.seekerId === conv.listerId) {
        toast.error("You can't message yourself.");
        return;
      }
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
        setMessagesByConv((prev) => {
          const list = prev[conversationId] ?? [];
          const alreadyLive = list.some((m) => m.id === real.id);
          return {
            ...prev,
            [conversationId]: alreadyLive
              ? list.filter((m) => m.id !== tempId)
              : list.map((m) => (m.id === tempId ? real : m)),
          };
        });
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== conversationId) return c;
            const next = { ...c, lastMessageAt: laterIso(c.lastMessageAt, real.createdAt) };
            if (c.seekerId === currentUser.id) next.seekerLastReadAt = laterIso(c.seekerLastReadAt, real.createdAt);
            else next.listerLastReadAt = laterIso(c.listerLastReadAt, real.createdAt);
            return next;
          }),
        );
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
      if (!conv || conv.status === "contact_shared" || conv.seekerId === conv.listerId) return;
      let phone = currentUser.phone;
      let whatsapp = currentUser.whatsapp;
      let hosted = false;
      if (conv.listerId === currentUser.id) {
        const { data, error } = await supabase
          .from("listings")
          .select("contact_phone, contact_whatsapp")
          .eq("id", conv.listingId)
          .maybeSingle();
        const row = data as { contact_phone: string | null; contact_whatsapp: string | null } | null;
        if (!error && (row?.contact_phone || row?.contact_whatsapp)) {
          phone = row.contact_phone ?? undefined;
          whatsapp = row.contact_whatsapp ?? undefined;
          hosted = true;
        }
      }
      const contact = [phone, whatsapp].filter(Boolean).join(" • ");
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
          content: hosted
            ? "You shared the student's contact details."
            : "You shared your contact details.",
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
        captureEvent("listing_unsaved", { listing_id: listingId });
      } else {
        const tempId = uid("sav");
        const optimistic: SavedListing = {
          id: tempId,
          userId: currentUser.id,
          listingId,
          createdAt: new Date().toISOString(),
        };
        setSavedListings((prev) => [optimistic, ...prev]);
        captureEvent("listing_saved", { listing_id: listingId });
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
      .filter((l) => ids.includes(l.id) && !l.archivedAt)
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
    const { data: profs, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error || !profs) return [];
    const users = (profs as unknown as RawProfile[]).map((row) => mapProfile(row));
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
      hasPassword,
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
      updateListing,
      archiveListing,
      updateListingStatus,
      filterListings,
      conversations,
      getConversation,
      getConversationForListing,
      expressInterest,
      getMyConversations,
      isConversationUnread,
      unreadCount,
      openConversation,
      getMessages,
      fetchMessages,
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
      hasPassword,
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
      updateListing,
      archiveListing,
      updateListingStatus,
      filterListings,
      conversations,
      getConversation,
      getConversationForListing,
      expressInterest,
      getMyConversations,
      isConversationUnread,
      unreadCount,
      openConversation,
      getMessages,
      fetchMessages,
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
