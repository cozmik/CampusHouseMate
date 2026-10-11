# TODO

## 1. Unread counts and a live inbox (done, needs migration 20261011_153000000 applied)

- [x] Migration: add `seeker_last_read_at` and `lister_last_read_at` to `conversations`
- [x] Migration: add `last_message_at` to `conversations`, kept current by a trigger on `messages` insert; sort the inbox by it
- [x] Store: one realtime subscription for new messages across all of the user's conversations (replaces the per-chat subscription)
- [x] Store: mark a conversation read when it is opened and when new messages arrive while it is open
- [x] Store: on login, load only the latest message per conversation instead of every message
- [x] UI: unread badge on the Chats tab (`BottomNav`) and the desktop Messages link
- [x] UI: bold / highlighted unread rows in `ConversationListItem`
- [x] E2E: unread badge appears and clears after opening the chat

## 2. Edit and delete listings (done, needs migration 20261011_153100000 applied)

- [x] `ListingWizard`: accept an existing listing and save changes instead of creating
- [x] Store: `updateListing` (fields + photos: add, remove, reorder)
- [x] Remove deleted photos from the `listing-photos` storage bucket
- [x] Route `/listings/:id/edit`, owner-only
- [x] Edit and Delete buttons on the listing page and Dashboard
- [x] Soft delete (`archived_at`) so existing conversations survive; hide archived listings from browse and search
- [x] E2E: edit a listing, delete a listing

## 3. Email notifications (1.5–2 days)

- [ ] Resend account, verify the `housemates.ng` sending domain, deploy `notify-message`, set the secrets below
- [x] Edge function `supabase/functions/notify-message` sends "new message" emails through Resend
- [x] Message insert enqueues a job; pg_cron calls the function once a minute (an insert webhook would send before the quiet period)
- [x] Send only if the chat is still unread after 3 minutes; at most one email per conversation per 30 minutes
- [x] Email on/off switch on the Profile page (`profiles.email_notifications`)
- [ ] Later: web push (another ~2 days; iPhone needs the site installed as an app)

## 4. Account deletion (~1 day)

- [ ] Edge function with admin rights that deletes the auth user
- [ ] Remove the user's avatar and listing photos from storage
- [ ] Confirmation dialog on the Profile page
- [ ] Mention deletion in the Privacy page

## 5. Error handling and faster loading (~0.5 day)

- [ ] Route-level error page with a reload button, plus an app-wide fallback
- [ ] Lazy-load pages (admin pages and the posting wizard first) with a light loading state

## 6. Spam protection (~1 day)

- [ ] Captcha (Cloudflare Turnstile or hCaptcha) on Supabase signup
- [ ] Database limits: listings per day, new conversations per hour, reports per day per user

## 7. Tests and housekeeping (1–2 days, alongside the above)

- [ ] E2E for messaging, posting, editing listings, admin pages
- [x] `.gitignore`: ignore `apps/*/dist*.zip`, `apps/*/playwright-report/`, `apps/*/test-results/`

## Needs you

- Resend API key, verified `housemates.ng` domain, and function secrets (item 3). Apply migration `20261011_180500000`.
- Captcha site key (item 6)
- Applying new migrations to the Supabase project
