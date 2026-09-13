import type {
  GenderPreference,
  ListingStatus,
  PricePeriod,
  RoomType,
} from "@housemates/shared-types";

export interface FilterValue {
  roomTypes: RoomType[];
  gender: GenderPreference | "any";
  pricePeriod: PricePeriod | "any";
  maxPrice?: number;
  status: ListingStatus | "any";
  savedOnly: boolean;
}

export const DEFAULT_FILTERS: FilterValue = {
  roomTypes: [],
  gender: "any",
  pricePeriod: "any",
  maxPrice: undefined,
  status: "available",
  savedOnly: false,
};

export function countActiveFilters(v: FilterValue): number {
  let n = 0;
  if (v.roomTypes.length) n += v.roomTypes.length;
  if (v.gender !== "any") n++;
  if (v.pricePeriod !== "any") n++;
  if (v.maxPrice) n++;
  if (v.status !== "available" && v.status !== "any") n++;
  if (v.savedOnly) n++;
  return n;
}
