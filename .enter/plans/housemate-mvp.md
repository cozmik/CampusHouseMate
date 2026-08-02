# HouseMate — Student Housing Handover Marketplace (MVP)

## Context
HouseMate connects graduating/outgoing students at Nigerian tertiary institutions with incoming/new students who need their vacated hostel/lodge space. Primary discovery is "pick your school first"; secondary discovery is Airbnb-style browsing by State + LGA. Money changes hands off-app in person — the app only needs to get two students talking and comfortable enough to exchange contact details.

The project is currently the blank Enter template (no auth, no database, one placeholder page). This is a full greenfield build touching data model, auth, and every page.

**Decisions locked in from your feedback:**
- Interest flow = **in-app messaging thread** started when a seeker expresses interest, with a **"Share Contact"** action inside the chat to reveal phone/WhatsApp once both sides are ready (your "Option D").

**Assumptions used for the rest of the scope (flag now if you want something different — otherwise I'll build to these):**
- Single account, dual role: any signed-in student can post a listing AND browse/message. No separate "lister vs seeker" signup path.
- Schools are a seeded, searchable list (~60-80 well-known Nigerian universities/polytechnics/colleges) stored in the database — not free text. More can be added later via a migration.
- Listing fields: photos, price + billing period (per session/semester/year), room type, gender preference, state/LGA/area (no exact street address, for safety), availability date(s), description.
- No real payments/escrow anywhere — "Express Interest" and chat only. This requires **Enter Cloud** (auth + database + storage for photos).

## Design System
Brand direction: "Campus Ember" — warm marigold-orange primary (distinct from Airbnb's coral), neutral warm-gray surfaces, mobile-first. Full tokens, layout grid, and component recipes (search bar, listing card, status badges, filter sheet, gallery, chat bubbles, wizard) were produced by the designer tool and will be applied to `src/index.css` + `tailwind.config.ts` before any page is built, so every component uses semantic tokens (no hardcoded colors).

Key semantic additions beyond the default shadcn palette:
- `--primary` set to the ember orange (`24 86% 39%`), `--secondary`/`--accent` to a light ember tint.
- New status tokens for listing state: `available` (green), `pending` (amber), `taken` (neutral gray), used only via a `StatusBadge` component.
- Radius scale (`sm/md/lg/full`) and two shadow levels for the flat, youthful card style.

## Data Model (Enter Cloud / Postgres)

| Table | Purpose | Key columns |
|---|---|---|
| `schools` | Seeded list of institutions | `id, name, state, type` — public read, no client writes |
| `profiles` | 1:1 with `auth.users` | `id, full_name, phone, whatsapp, school_id, avatar_url` |
| `listings` | A vacated space post | `id, owner_id, school_id, title, description, room_type, gender_preference, price, price_period, state, lga, area, available_from, available_until, status(available/pending/taken)` |
| `listing_photos` | Photos per listing | `id, listing_id, url, position` |
| `conversations` | One thread per (listing, seeker) | `id, listing_id, seeker_id, lister_id, status(active/contact_shared)` |
| `messages` | Chat messages | `id, conversation_id, sender_id, content, type(text/contact_share/system)` |
| `saved_listings` | Bookmarks for seekers | `id, user_id, listing_id` |

RLS: `schools` public read-only; `listings`/`listing_photos` public read (any status), write restricted to `owner_id = auth.uid()`; `conversations`/`messages` restricted to participants (`seeker_id`/`lister_id` = `auth.uid()`); `saved_listings` restricted to own rows. Storage buckets: `listing-photos` (public read, owner-scoped write) and `avatars` (public read, owner-scoped write).

Nigerian States + LGAs list is static reference data (doesn't change) — shipped as a frontend data file `src/data/nigeria-states-lgas.ts`, not a DB table.

## Pages & Routes
- `/` — Landing: hero with segmented "By School" / "By State & LGA" search, trending schools, recent listings strip.
- `/browse` — Search results grid with filter bar/sheet (room type, price, gender, availability), driven by query params.
- `/listings/:id` — Listing detail: gallery, details, lister mini-profile, "Express Interest" CTA.
- `/post` — Multi-step create-listing wizard (School → Location → Room Details → Photos → Price/Availability → Review). Auth required.
- `/messages` and `/messages/:id` — Conversation list and chat thread with "Share Contact". Auth required.
- `/dashboard` — My Listings (available/pending/taken), My Interests (sent), Saved Listings. Auth required.
- `/login`, `/signup` — Auth (email/password via Enter Cloud), signup collects name, phone, school.
- `/profile` — Edit name, phone, whatsapp, school, avatar.
- Keep existing `/` → `NotFound` catch-all.

## Key Components (new, in `src/components/housemate/`)
`SchoolStateSearch`, `ListingCard`, `StatusBadge`, `FilterBar`/`FilterSheet`, `PhotoGallery`, `PhotoUploader`, `ChatBubble`, `ConversationListItem`, `ListingWizard` (+ step components), `ProtectedRoute`, `AppHeader`/`BottomNav`.

## Implementation Checklist
- [ ] Enable Enter Cloud; load `enter_cloud` skill before writing SQL/auth/storage code
- [ ] Migration: `schools` table + seed ~60-80 Nigerian institutions (name, state, type)
- [ ] Migration: `profiles` table + trigger to auto-create on signup
- [ ] Migration: `listings`, `listing_photos`, `conversations`, `messages`, `saved_listings` with RLS policies scoped as above
- [ ] Storage buckets `listing-photos` and `avatars` with owner-scoped write policies
- [ ] `src/data/nigeria-states-lgas.ts` static states/LGA reference data
- [ ] Update `src/index.css` + `tailwind.config.ts` with Campus Ember tokens, status colors, radius/shadow scale
- [ ] Auth pages `/login`, `/signup` (collect name, phone, school) using Enter Cloud auth
- [ ] `ProtectedRoute` wrapper + wire into router for `/post`, `/messages*`, `/dashboard`, `/profile`
- [ ] Landing page `/` with `SchoolStateSearch` (school autocomplete + state/LGA mode)
- [ ] `/browse` results grid + `FilterBar`/`FilterSheet` reading/writing query params
- [ ] `/listings/:id` detail page with gallery, details, "Express Interest" (creates/opens a conversation)
- [ ] `/post` multi-step listing wizard with photo upload to `listing-photos` bucket
- [ ] `/messages` list + `/messages/:id` thread with text messages and "Share Contact" system message revealing phone/WhatsApp
- [ ] `/dashboard` with My Listings (status change to taken/available), My Interests, Saved Listings
- [ ] `/profile` edit page
- [ ] App shell: header/bottom nav wired into `src/router.tsx` and `src/App.tsx`

## Verification Checklist
- [ ] Signup creates a profile row; login/logout works; protected routes redirect anonymous users to `/login`
- [ ] Posting a listing with photos appears immediately in `/browse` and on the correct school's results
- [ ] Searching by school returns only that school's listings; searching by state+LGA returns matching listings regardless of school
- [ ] Filters (room type, price, gender, availability) narrow results correctly and combine with school/state search
- [ ] Expressing interest on a listing creates exactly one conversation per (listing, seeker) pair — repeat clicks reopen the same thread
- [ ] Messages send/receive in order; "Share Contact" reveals phone/WhatsApp only after the action is taken, not by default
- [ ] A user cannot edit/delete another user's listing or read a conversation they're not part of (RLS check)
- [ ] Marking a listing "Taken" reflects immediately in browse results and dashboard
- [ ] Mobile layout (bottom nav, single-column cards, filter sheet) and desktop layout both render correctly
- [ ] `pnpm lint` and the production build pass with no errors
