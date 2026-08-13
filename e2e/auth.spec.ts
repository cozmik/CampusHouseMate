import { test, expect } from "./fixtures/test";
import { TEST_USER } from "./fixtures/data";

test.describe("Auth and navigation", () => {
  test("login page has email login, Google, and no Facebook", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: /continue with google/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /facebook/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Forgot password?" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Create an account" })).toBeVisible();
  });

  test("rejects an invalid email without submitting", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("foo@bar");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page.getByText("Please enter a valid email address.")).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test("logs in and lands on the dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill(TEST_USER.email);
    await page.getByLabel("Password").fill(TEST_USER.password);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: TEST_USER.fullName })).toBeVisible();
  });

  test("signup collects first and last name and school acronym search", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByLabel("First name")).toBeVisible();
    await expect(page.getByLabel("Last name")).toBeVisible();
    await page.getByPlaceholder(/search your school/i).fill("UI");
    const option = page.getByRole("option", { name: /university of ibadan/i });
    await expect(option).toBeVisible();
    await expect(option.getByText("UI", { exact: true })).toBeVisible();
  });

  test("forgot-password sends a reset link", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill(TEST_USER.email);
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByText("Check your inbox (and spam) for a reset link.")).toBeVisible();
  });

  test("guest header hides Messages and protected routes redirect to login", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation").getByRole("link", { name: "Messages" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: "Browse" })).toBeVisible();

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/post");
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/messages");
    await expect(page).toHaveURL(/\/login/);

    await page.goto("/profile");
    await expect(page).toHaveURL(/\/login/);
  });

  test("admin routes send guests home", async ({ page }) => {
    await page.goto("/admin/users");
    await expect(page).toHaveURL(/\/$/);
  });

  test("unknown routes show 404", async ({ page }) => {
    await page.goto("/no-such-page");
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    await page.getByRole("link", { name: "Back home" }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});

test.describe("Logged-in navigation", () => {
  test.use({ mockOptions: { authenticated: true } });

  test("shows Messages once signed in", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation").getByRole("link", { name: "Messages" })).toBeVisible();
    await page.getByRole("navigation").getByRole("link", { name: "Dashboard" }).click();
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByRole("heading", { name: TEST_USER.fullName })).toBeVisible();
  });
});
