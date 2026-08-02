export type SchoolType = "university" | "polytechnic" | "college";

export interface School {
  id: string;
  name: string;
  state: string;
  type: SchoolType;
}

export type RoomType =
  | "single"
  | "shared"
  | "self-contained"
  | "studio"
  | "1-bedroom"
  | "2-bedroom";

export type GenderPreference = "any" | "male" | "female";

export type PricePeriod = "session" | "semester" | "year" | "month";

export type ListingStatus = "available" | "pending" | "taken";

export type ConversationStatus = "active" | "contact_shared";

export type MessageType = "text" | "contact_share" | "system";

export type ReportTargetType = "listing" | "user" | "conversation" | "general";

export type ReportStatus = "open" | "reviewing" | "resolved";

export interface Report {
  id: string;
  reporterId: string;
  targetType: ReportTargetType;
  targetId?: string;
  category: string;
  message: string;
  status: ReportStatus;
  createdAt: string;
}

export interface SeekerPreferences {
  tags: string[];
  note?: string;
}

export interface ListingPhoto {
  id: string;
  url: string;
  position: number;
}

export interface Listing {
  id: string;
  ownerId: string;
  schoolId: string;
  title: string;
  description: string;
  roomType: RoomType;
  genderPreference: GenderPreference;
  price: number;
  pricePeriod: PricePeriod;
  state: string;
  lga: string;
  area?: string;
  availableFrom: string;
  availableUntil?: string;
  status: ListingStatus;
  seekerPreferences?: SeekerPreferences;
  photos: ListingPhoto[];
  createdAt: string;
}

export interface Profile {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  schoolId?: string;
  avatarUrl?: string;
  bio?: string;
  isAdmin?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: MessageType;
  createdAt: string;
}

export interface Conversation {
  id: string;
  listingId: string;
  seekerId: string;
  listerId: string;
  status: ConversationStatus;
  createdAt: string;
}

export interface SavedListing {
  id: string;
  userId: string;
  listingId: string;
  createdAt: string;
}

export interface ListingFilters {
  q?: string;
  schoolId?: string;
  state?: string;
  lga?: string;
  roomTypes?: RoomType[];
  gender?: GenderPreference;
  maxPrice?: number;
  pricePeriod?: PricePeriod;
  status?: ListingStatus;
  savedOnly?: boolean;
}
