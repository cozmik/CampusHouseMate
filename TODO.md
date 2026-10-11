# TODO

## 1. Unread counts and a live inbox (~1.5 days)

- [ ] Migration: add `seeker_last_read_at` and `lister_last_read_at` to `conversations`
- [ ] Migration: add `last_message_at` to `conversations`, kept current by a trigger on `messages` insert; sort the inbox by it
- [ ] Store: one realtime subscription for new messages across all of the user's conversations (replaces the per-chat subscription)
- [ ] Store: mark a conversation read when it is opened and when new messages arrive while it is open
- [ ] Store: on login, load only the latest message per conversation instead of every message
- [ ] UI: unread badge on the Chats tab (`BottomNav`) and the desktop Messages link
- [ ] UI: bold / highlighted unread rows in `ConversationListItem`
- [ ] E2E: unread badge appears and clears after opening the chat

## 2. Edit and delete listings (~1.5 days)

- [ ] `ListingWizard`: accept an existing listing and save changes instead of creating
- [ ] Store: `updateListing` (fields + photos: add, remove, reorder)
- [ ] Remove deleted photos from the `listing-photos` storage bucket
- [ ] Route `/listings/:id/edit`, owner-only
- [ ] Edit and Delete buttons on the listing page and Dashboard
- [ ] Soft delete (`archived_at`) so existing conversations survive; hide archived listings from browse and search
- [ ] E2E: edit a listing, delete a listing

## 3. Email notifications (1.5–2 days)

- [ ] Pick a transactional email provider (Resend / Postmark), verify the `housemates.ng` sending domain
- [ ] Supabase edge function that sends "new message" emails
- [ ] Database webhook on `messages` insert calls the function
- [ ] Only email if the recipient hasn't read the conversation for a few minutes; at most one email per conversation per window (depends on item 1)
- [ ] Email on/off switch on the Profile page
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

- Email provider account and sending domain (item 3)
- Captcha site key (item 6)
- Applying new migrations to the Supabase project
