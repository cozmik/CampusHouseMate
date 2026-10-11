import { test, expect } from "./fixtures/test";
import { makeListing, TEST_USER } from "./fixtures/data";

test.describe("Listing detail", () => {
  test.use({
    mockOptions: {
      listings: [
        makeListing(1, {
          id: "listing-deep",
          title: "Ensuite room in Akoka",
          description: "Fetched by id, not from the browse cache.",
        }),
      ],
    },
  });

  test("loads a listing by URL even if it was never browsed", async ({ page }) => {
    await page.goto("/listings/listing-deep");
    await expect(page.getByRole("heading", { name: "Ensuite room in Akoka" })).toBeVisible();
    await expect(page).toHaveTitle(/Ensuite room in Akoka/);
    await expect(page.getByText("Fetched by id, not from the browse cache.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Listing not found" })).toHaveCount(0);
  });

  test("shows not found for a missing listing", async ({ page }) => {
    await page.goto("/listings/does-not-exist");
    await expect(page.getByRole("heading", { name: "Listing not found" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to browse" })).toBeVisible();
  });
});

test.describe("Own listing", () => {
  test.use({
    mockOptions: {
      authenticated: true,
      listings: [
        makeListing(1, {
          id: "listing-mine",
          owner_id: TEST_USER.id,
          title: "My room in Yaba",
        }),
      ],
    },
  });

  test("hides express interest when the signed-in user owns the listing", async ({ page }) => {
    await page.goto("/listings/listing-mine");
    await expect(page.getByRole("heading", { name: "My room in Yaba" })).toBeVisible();
    await expect(page.getByText("This is your listing")).toBeVisible();
    await expect(page.getByRole("button", { name: "Express interest" })).toHaveCount(0);
  });
});
