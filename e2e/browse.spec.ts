import { test, expect } from "./fixtures/test";
import { makeListings } from "./fixtures/data";

test.describe("Browse", () => {
  test.use({ mockOptions: { listings: makeListings(15) } });

  test("lists a page of spaces and paginates from the server", async ({ page }) => {
    const offsets: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes("/rest/v1/listings")) {
        const offset = new URL(req.url()).searchParams.get("offset");
        if (offset) offsets.push(offset);
      }
    });

    await page.goto("/browse");
    await expect(page.getByRole("heading", { name: "Browse spaces" })).toBeVisible();
    await expect(page.getByText("15 spaces")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Self-contained near UNILAG gate 1", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Self-contained near UNILAG gate 13", exact: true })).toHaveCount(0);
    await expect(page.getByText("Page 1 of 2")).toBeVisible();

    await page.getByRole("button", { name: "Next" }).click();
    await expect(page).toHaveURL(/page=2/);
    await expect(page.getByText("Page 2 of 2")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Self-contained near UNILAG gate 13", exact: true })).toBeVisible();
    expect(offsets).toContain("12");
  });

  test("opens a listing from browse", async ({ page }) => {
    await page.goto("/browse");
    await page.getByRole("heading", { name: "Self-contained near UNILAG gate 1", exact: true }).click();
    await expect(page).toHaveURL(/\/listings\/listing-1/);
    await expect(page.getByRole("heading", { name: "Self-contained near UNILAG gate 1", exact: true })).toBeVisible();
  });

  test("shows an empty state when nothing matches", async ({ page }) => {
    await page.goto("/browse?q=zzzz-no-such-lodge");
    await expect(page.getByRole("heading", { name: "No spaces found" })).toBeVisible();
  });
});
