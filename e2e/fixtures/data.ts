export const TEST_USER = {
  id: "user-e2e-1",
  email: "joy@housemate.test",
  password: "password123",
  firstName: "Joy",
  lastName: "Eze",
  fullName: "Joy Eze",
};

export const OWNER_ID = "user-lister-1";

export type RawListing = {
  id: string;
  owner_id: string;
  school_id: string;
  title: string;
  description: string;
  room_type: string;
  gender_preference: string;
  price: number;
  price_period: string;
  state: string;
  lga: string;
  area: string | null;
  available_from: string;
  available_until: string | null;
  status: string;
  seeker_preferences: null;
  created_at: string;
  listing_photos: { id: string; url: string; position: number }[];
};

export function makeListing(
  index: number,
  patch: Partial<RawListing> = {},
): RawListing {
  const id = patch.id ?? `listing-${index}`;
  const created = new Date(Date.UTC(2026, 0, 20 - index)).toISOString();
  return {
    id,
    owner_id: OWNER_ID,
    school_id: "university-of-lagos",
    title: `Self-contained near UNILAG gate ${index}`,
    description: "Quiet room, prepaid meter, 8 minutes to campus.",
    room_type: "self-contained",
    gender_preference: "any",
    price: 250000 + index * 1000,
    price_period: "session",
    state: "Lagos",
    lga: "Mainland",
    area: "Yaba",
    available_from: "2026-09-01",
    available_until: null,
    status: "available",
    seeker_preferences: null,
    created_at: created,
    listing_photos: [],
    ...patch,
  };
}

export function makeListings(count: number): RawListing[] {
  return Array.from({ length: count }, (_, i) => makeListing(i + 1));
}

export function sessionPayload(user = TEST_USER) {
  const now = Math.floor(Date.now() / 1000);
  return {
    access_token: "e2e-access-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: now + 3600,
    refresh_token: "e2e-refresh-token",
    user: {
      id: user.id,
      aud: "authenticated",
      role: "authenticated",
      email: user.email,
      email_confirmed_at: new Date().toISOString(),
      phone: "",
      confirmed_at: new Date().toISOString(),
      last_sign_in_at: new Date().toISOString(),
      app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: {
        first_name: user.firstName,
        last_name: user.lastName,
        full_name: user.fullName,
      },
      identities: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };
}
