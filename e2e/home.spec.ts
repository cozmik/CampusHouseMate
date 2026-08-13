import { test, expect } from "./fixtures/test";

test.describe("Home", () => {
  test("renders the hero, search, and trending sections", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /find your next hostel/i })).toBeVisible();
    await expect(page.getByPlaceholder(/search your school/i)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Trending schools" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "How HouseMate works" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Fresh on the block" })).toBeVisible();
  });

  test("shows recent listings from the server", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Self-contained near UNILAG gate 1", exact: true })).toBeVisible();
  });

  test("searches schools by acronym and shows UNILAG, not Univ", async ({ page }) => {
    await page.goto("/");
    const search = page.getByPlaceholder(/search your school/i);
    await search.fill("UNILAG");

    const option = page.getByRole("option", { name: /university of lagos/i });
    await expect(option).toBeVisible();
    await expect(option.getByText("UNILAG", { exact: true })).toBeVisible();
    await expect(option.getByText("Univ", { exact: true })).toHaveCount(0);

    await option.click();
    await page.getByRole("button", { name: /find spaces/i }).click();
    await expect(page).toHaveURL(/\/browse\?school=university-of-lagos/);
  });

  test("school dropdown stays in front of trending schools", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder(/search your school/i).fill("OAU");

    const option = page.getByRole("option", { name: /obafemi awolowo university/i });
    await expect(option).toBeVisible();
    await expect(option.getByText("OAU", { exact: true })).toBeVisible();

    const box = await option.boundingBox();
    expect(box).toBeTruthy();
    const hitDropdown = await page.evaluate(({ x, y }) => {
      const el = document.elementFromPoint(x, y);
      return Boolean(el?.closest('[role="listbox"]'));
    }, { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 });
    expect(hitDropdown).toBe(true);
  });

  test("browse-all link goes to /browse", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /or browse all available spaces/i }).click();
    await expect(page).toHaveURL(/\/browse$/);
  });
});
