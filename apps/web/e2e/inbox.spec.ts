import { test, expect } from "./fixtures/test";
import { makeConversation, makeListing, makeMessage, OWNER_ID, TEST_USER } from "./fixtures/data";

const T0 = "2026-10-01T09:00:00.000Z";
const T1 = "2026-10-01T10:00:00.000Z";
const T2 = "2026-10-02T10:00:00.000Z";
const T3 = "2026-10-03T10:00:00.000Z";

const listings = [
  makeListing(2, { owner_id: OWNER_ID, title: "Ensuite room in Akoka" }),
  makeListing(3, { owner_id: OWNER_ID, title: "Shared flat in Bariga" }),
];

const unreadConversation = makeConversation({
  id: "conv-1",
  listing_id: "listing-2",
  created_at: T0,
  last_message_at: T2,
  seeker_last_read_at: T1,
  lister_last_read_at: T2,
});

const unreadMessages = [
  makeMessage({ id: "m-1", conversation_id: "conv-1", sender_id: TEST_USER.id, type: "system", content: "You started a conversation about this listing.", created_at: T0 }),
  makeMessage({ id: "m-2", conversation_id: "conv-1", sender_id: OWNER_ID, content: "Yes, it's still free", created_at: T2 }),
];

test.describe("Inbox unread state", () => {
  test.use({
    mockOptions: {
      authenticated: true,
      listings,
      conversations: [unreadConversation],
      messages: unreadMessages,
    },
  });

  test("shows an unread badge until the chat is opened", async ({ page }) => {
    await page.goto("/messages");
    await expect(page.getByRole("link", { name: /1 unread conversation/ })).toBeVisible();
    await expect(page.getByText("Unread", { exact: true })).toBeAttached();
    await expect(page.getByText("Yes, it's still free")).toBeVisible();

    await page.getByRole("link", { name: /Ada Lister/ }).click();
    await expect(page).toHaveURL(/\/messages\/conv-1/);
    await expect(page.getByPlaceholder("Type a message…")).toBeVisible();
    await expect(page.getByRole("link", { name: /unread conversation/ })).toHaveCount(0);

    await page.getByRole("link", { name: "Messages", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Messages" })).toBeVisible();
    await expect(page.getByText("Unread", { exact: true })).toHaveCount(0);
  });
});

test.describe("Inbox read state", () => {
  test.use({
    mockOptions: {
      authenticated: true,
      listings,
      conversations: [{ ...unreadConversation, seeker_last_read_at: T2 }],
      messages: unreadMessages,
    },
  });

  test("does not badge conversations that are already read", async ({ page }) => {
    await page.goto("/messages");
    await expect(page.getByText("Yes, it's still free")).toBeVisible();
    await expect(page.getByRole("link", { name: /unread conversation/ })).toHaveCount(0);
    await expect(page.getByText("Unread", { exact: true })).toHaveCount(0);
  });
});

test.describe("Inbox ordering", () => {
  test.use({
    mockOptions: {
      authenticated: true,
      listings,
      conversations: [
        makeConversation({ id: "conv-old-busy", listing_id: "listing-2", created_at: T0, last_message_at: T3, seeker_last_read_at: T3 }),
        makeConversation({ id: "conv-new-quiet", listing_id: "listing-3", created_at: T1, last_message_at: T1, seeker_last_read_at: T1 }),
      ],
      messages: [
        makeMessage({ conversation_id: "conv-old-busy", content: "Latest reply", created_at: T3 }),
        makeMessage({ conversation_id: "conv-new-quiet", content: "Older reply", created_at: T1 }),
      ],
    },
  });

  test("lists the conversation with the newest message first", async ({ page }) => {
    await page.goto("/messages");
    const rows = page.getByRole("link", { name: /Ada Lister/ });
    await expect(rows).toHaveCount(2);
    await expect(rows.first()).toContainText("Latest reply");
    await expect(rows.nth(1)).toContainText("Older reply");
  });
});

test.describe("Mobile unread badge", () => {
  test.use({
    viewport: { width: 390, height: 844 },
    mockOptions: {
      authenticated: true,
      listings,
      conversations: [unreadConversation],
      messages: unreadMessages,
    },
  });

  test("shows the unread count on the Chats tab", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /Chats.*1 unread conversation|1 unread conversation.*Chats/ })).toBeVisible();
  });
});
