import type {
  Conversation,
  Listing,
  Message,
  Profile,
  Report,
  ReportStatus,
  ReportTargetType,
  RoomType,
  SeekerPreferences,
} from "@housemates/shared-types";
import { namesFromMetadata, splitFullName } from "@housemates/shared-utils";

export interface RawListing {
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
export interface RawPhoto {
  id: string;
  url: string;
  position: number;
}
export interface RawProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  school_id: string | null;
  bio: string | null;
  email?: string | null;
  created_at: string;
  is_admin?: boolean;
  is_suspended?: boolean;
}
export interface RawConversation {
  id: string;
  listing_id: string;
  seeker_id: string;
  lister_id: string;
  status: string;
  created_at: string;
}
export interface RawMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: string;
  created_at: string;
}
export interface RawReport {
  id: string;
  reporter_id: string;
  target_type: string;
  target_id: string | null;
  category: string;
  message: string;
  status: string;
  created_at: string;
}

export function mapListing(row: RawListing): Listing {
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

export function mapProfile(
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
    email: email ?? row.email ?? undefined,
    emailConfirmedAt: emailConfirmedAt ?? undefined,
    avatarUrl: row.avatar_url ?? undefined,
    schoolId: row.school_id ?? undefined,
    bio: row.bio ?? undefined,
    isAdmin: row.is_admin ?? false,
    isSuspended: row.is_suspended ?? false,
  };
}

export function mapConversation(row: RawConversation): Conversation {
  return {
    id: row.id,
    listingId: row.listing_id,
    seekerId: row.seeker_id,
    listerId: row.lister_id,
    status: row.status as Conversation["status"],
    createdAt: row.created_at,
  };
}

export function mapMessage(row: RawMessage): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    content: row.content,
    type: row.type as Message["type"],
    createdAt: row.created_at,
  };
}

export function mapReport(row: RawReport): Report {
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
