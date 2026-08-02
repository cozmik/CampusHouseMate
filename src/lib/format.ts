import type {
  GenderPreference,
  ListingStatus,
  PricePeriod,
  RoomType,
  SchoolType,
} from "./types";

export function formatPrice(price: number, period: PricePeriod): string {
  return `₦${price.toLocaleString("en-NG")} / ${periodLabel(period)}`;
}

export function formatNaira(price: number): string {
  return `₦${price.toLocaleString("en-NG")}`;
}

export function periodLabel(period: PricePeriod): string {
  switch (period) {
    case "session": return "session";
    case "semester": return "semester";
    case "year": return "yr";
    case "month": return "mo";
  }
}

export function periodLabelLong(period: PricePeriod): string {
  switch (period) {
    case "session": return "per session";
    case "semester": return "per semester";
    case "year": return "per year";
    case "month": return "per month";
  }
}

export function roomTypeLabel(room: RoomType): string {
  switch (room) {
    case "single": return "Single room";
    case "shared": return "Shared room";
    case "self-contained": return "Self-contained";
    case "studio": return "Studio";
    case "1-bedroom": return "1 bedroom";
    case "2-bedroom": return "2 bedroom";
  }
}

export const ROOM_TYPES: RoomType[] = ["single", "shared", "self-contained", "studio", "1-bedroom", "2-bedroom"];
export const PRICE_PERIODS: PricePeriod[] = ["session", "semester", "year", "month"];

export function genderLabel(gender: GenderPreference): string {
  switch (gender) {
    case "any": return "Any gender";
    case "male": return "Male only";
    case "female": return "Female only";
  }
}

export function statusLabel(status: ListingStatus): string {
  switch (status) {
    case "available": return "Available";
    case "pending": return "Pending";
    case "taken": return "Taken";
  }
}

export function schoolTypeLabel(type: SchoolType): string {
  switch (type) {
    case "university": return "University";
    case "polytechnic": return "Polytechnic";
    case "college": return "College";
  }
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-NG", { day: "numeric", month: "short" });
}

export function timeAgo(iso: string): string {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return "";
  const diff = Date.now() - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatShortDate(iso);
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" });
}

export function initials(name: string): string {
  return name.split(" ").filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase()).join("");
}

export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}
