import { test, expect } from "./fixtures/test";
import { makeConversation, makeListing, OWNER_ID, TEST_USER } from "./fixtures/data";

const productListings = [
  makeListing(1, { owner_id: TEST_USER.id, title: "My lodge in Yaba" }),
  makeListing(2, { owner_id: OWNER_ID, title: "Ensuite room in Akoka" }),
];

test.describe("Legal", () => {
  test("terms and privacy pages load", async ({ page }) => {
    await page.goto("/terms");
    await expect(page.getByRole("heading", { name: "Terms and Conditions" })).toBeVisible();
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
  });
});

test.describe("Dashboard", () => {
  test.use({
    mockOptions: {
      authenticated: true,
      listings: productListings,
      conversations: [makeConversation({ listing_id: "listing-2" })],
    },
  });

  test("shows my listings, interests, and saved tabs", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: TEST_USER.fullName })).toBeVisible();
    await expect(page.getByRole("tab", { name: /my listings/i })).toBeVisible();
    await expect(page.getByText("My lodge in Yaba")).toBeVisible();

    await page.getByRole("tab", { name: /interests/i }).click();
    await expect(page.getByText("Ada Lister")).toBeVisible();

    await page.getByRole("tab", { name: /saved/i }).click();
    await expect(page.getByRole("heading", { name: "No saved listings" })).toBeVisible();
  });
});

test.describe("Post a space", () => {
  test.use({ mockOptions: { authenticated: true, listings: productListings } });

  test("walks through the listing wizard and publishes", async ({ page }) => {
    await page.goto("/post");
    await expect(page.getByRole("heading", { name: "Post a space" })).toBeVisible();
    await expect(page.getByText("School & location")).toBeVisible();

    await page.getByPlaceholder(/search your school/i).fill("UNILAG");
    await page.getByRole("option", { name: /university of lagos/i }).click();
    await page.getByRole("combobox").filter({ hasText: /select lga/i }).click();
    await page.getByRole("option", { name: "Lagos Mainland" }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByRole("heading", { name: "Tell us about the room" })).toBeVisible();
    await page.getByPlaceholder(/bright self-con/i).fill("Sunny self-con near gate");
    await page.getByRole("combobox").filter({ hasText: /select room type/i }).click();
    await page.getByRole("option", { name: "Self-contained" }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByRole("heading", { name: "Add photos" })).toBeVisible();
    await page.getByPlaceholder(/paste an image url/i).fill("https://example.com/room.jpg");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByRole("heading", { name: "Price & availability" })).toBeVisible();
    await page.getByPlaceholder("e.g. 150000").fill("180000");
    await page.locator('input[type="date"]').first().fill("2026-09-01");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByRole("heading", { name: "Review your listing" })).toBeVisible();
    await expect(page.getByText("Sunny self-con near gate")).toBeVisible();
    await page.getByRole("button", { name: "Post listing" }).click();
    await expect(page).toHaveURL(/\/listings\/listing-created-/);
    await expect(page.getByRole("heading", { name: "Sunny self-con near gate" })).toBeVisible();
  });
});

test.describe("Messages", () => {
  test.use({
    mockOptions: {
      authenticated: true,
      listings: productListings,
      conversations: [makeConversation({ listing_id: "listing-2" })],
    },
  });

  test("opens an existing chat and sends a message", async ({ page }) => {
    await page.goto("/messages");
    await expect(page.getByRole("heading", { name: "Messages" })).toBeVisible();
    await page.getByText("Ada Lister").click();
    await expect(page).toHaveURL(/\/messages\/conv-1/);
    await expect(page.getByPlaceholder("Type a message…")).toBeVisible();
    await page.getByPlaceholder("Type a message…").fill("Is the room still free?");
    await page.getByPlaceholder("Type a message…").press("Enter");
    await expect(page.getByText("Is the room still free?", { exact: true })).toBeVisible();
  });
});

test.describe("Profile, save, and interest", () => {
  test.use({ mockOptions: { authenticated: true, listings: productListings } });

  test("profile page loads and saves", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: "Edit profile" })).toBeVisible();
    await expect(page.getByText(TEST_USER.email)).toBeVisible();
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("saves a listing from browse and shows it on the dashboard", async ({ page }) => {
    await page.goto("/browse");
    await page.getByRole("button", { name: "Save listing" }).first().click();
    await page.goto("/dashboard");
    await page.getByRole("tab", { name: /saved/i }).click();
    await expect(page.getByRole("heading", { name: /lodge in yaba|ensuite room in akoka/i })).toBeVisible();
  });

  test("express interest starts a chat from a listing", async ({ page }) => {
    await page.goto("/listings/listing-2");
    await expect(page.getByRole("heading", { name: "Ensuite room in Akoka" })).toBeVisible();
    await page.getByRole("button", { name: "Express interest" }).click();
    await expect(page).toHaveURL(/\/messages\/conv-/);
    await expect(page.getByPlaceholder("Type a message…")).toBeVisible();
  });
});
