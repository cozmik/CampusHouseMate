import { test, expect } from "./fixtures/test";
import { makeListing, OWNER_ID, TEST_USER } from "./fixtures/data";

const myListing = makeListing(1, {
  owner_id: TEST_USER.id,
  title: "My lodge in Yaba",
  lga: "Lagos Mainland",
  listing_photos: [{ id: "photo-1", url: "https://example.com/room.jpg", position: 0 }],
});
const someoneElses = makeListing(2, { owner_id: OWNER_ID, title: "Ensuite room in Akoka" });

test.describe("Edit a listing", () => {
  test.use({ mockOptions: { authenticated: true, listings: [myListing, someoneElses] } });

  test("owner edits the title and sees the change", async ({ page }) => {
    await page.goto("/listings/listing-1");
    await page.getByRole("link", { name: "Edit" }).click();
    await expect(page).toHaveURL(/\/listings\/listing-1\/edit$/);
    await expect(page.getByRole("heading", { name: "Edit listing" })).toBeVisible();

    await page.getByRole("button", { name: "Room details" }).click();
    const title = page.getByPlaceholder("Short title for the room");
    await expect(title).toHaveValue("My lodge in Yaba");
    await title.fill("Renovated lodge in Yaba");

    await page.getByRole("button", { name: "Review" }).click();
    await expect(page.getByText("Renovated lodge in Yaba")).toBeVisible();
    await page.getByRole("button", { name: "Save changes" }).click();

    await expect(page).toHaveURL(/\/listings\/listing-1$/);
    await expect(page.getByRole("heading", { name: "Renovated lodge in Yaba" })).toBeVisible();
  });

  test("dashboard links to the edit page", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: "Edit My lodge in Yaba" }).click();
    await expect(page.getByRole("heading", { name: "Edit listing" })).toBeVisible();
  });

  test("other people's listings can't be edited", async ({ page }) => {
    await page.goto("/listings/listing-2/edit");
    await expect(page.getByRole("heading", { name: "Listing not found" })).toBeVisible();
  });
});

test.describe("Delete a listing", () => {
  test.use({ mockOptions: { authenticated: true, listings: [myListing, someoneElses] } });

  test("owner deletes a listing after confirming", async ({ page }) => {
    await page.goto("/listings/listing-1");
    await page.getByRole("button", { name: "Delete" }).click();
    await expect(page.getByRole("alertdialog", { name: "Delete this listing?" })).toBeVisible();
    await page.getByRole("button", { name: "Delete listing" }).click();

    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: "No listings yet" })).toBeVisible();
  });

  test("cancelling keeps the listing", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Delete My lodge in Yaba" }).click();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("alertdialog")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Edit My lodge in Yaba" })).toBeVisible();
  });
});

test.describe("Edit a listing with a stale LGA", () => {
  test.use({
    mockOptions: {
      authenticated: true,
      listings: [makeListing(9, { ...myListing, id: "listing-9", lga: "Mainland" })],
    },
  });

  test("asks the owner to pick the LGA again", async ({ page }) => {
    await page.goto("/listings/listing-9/edit");
    await page.getByRole("button", { name: "Review" }).click();
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Select an LGA.")).toBeVisible();
  });
});
