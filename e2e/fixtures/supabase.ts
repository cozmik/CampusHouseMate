import type { Page, Route } from "@playwright/test";
import { makeListings, sessionPayload, TEST_USER, type RawListing } from "./data";

const SUPABASE_HOST = /supabase\.co/;

type MockOptions = {
  listings?: RawListing[];
  authenticated?: boolean;
};

function parseEq(value: string | null): string | undefined {
  if (!value) return undefined;
  if (value.startsWith("eq.")) return value.slice(3);
  return value;
}

function parseIn(value: string | null): string[] | undefined {
  if (!value?.startsWith("in.(") || !value.endsWith(")")) return undefined;
  return value.slice(4, -1).split(",").filter(Boolean);
}

function applyListingFilters(rows: RawListing[], url: URL): RawListing[] {
  let next = [...rows];
  const status = parseEq(url.searchParams.get("status"));
  if (status) next = next.filter((r) => r.status === status);
  const schoolId = parseEq(url.searchParams.get("school_id"));
  if (schoolId) next = next.filter((r) => r.school_id === schoolId);
  const ownerId = parseEq(url.searchParams.get("owner_id"));
  if (ownerId) next = next.filter((r) => r.owner_id === ownerId);
  const id = parseEq(url.searchParams.get("id"));
  if (id) next = next.filter((r) => r.id === id);
  const ids = parseIn(url.searchParams.get("id"));
  if (ids) next = next.filter((r) => ids.includes(r.id));
  const state = parseEq(url.searchParams.get("state"));
  if (state) next = next.filter((r) => r.state === state);

  const order = url.searchParams.get("order");
  if (order?.startsWith("created_at")) {
    const desc = order.includes("desc");
    next.sort((a, b) =>
      desc
        ? b.created_at.localeCompare(a.created_at)
        : a.created_at.localeCompare(b.created_at),
    );
  }

  const or = url.searchParams.get("or");
  if (or) {
    const terms = [...or.matchAll(/ilike\.%([^%]+)%/g)].map((m) => m[1].toLowerCase());
    if (terms.length) {
      next = next.filter((r) =>
        terms.some(
          (t) =>
            r.title.toLowerCase().includes(t) ||
            r.description.toLowerCase().includes(t) ||
            (r.area ?? "").toLowerCase().includes(t) ||
            r.lga.toLowerCase().includes(t),
        ),
      );
    }
  }
  return next;
}

function rangeSlice(rows: RawListing[], url: URL, header: string | undefined) {
  const offsetParam = url.searchParams.get("offset");
  const limitParam = url.searchParams.get("limit");
  let from = 0;
  let to = rows.length - 1;
  if (offsetParam || limitParam) {
    from = Number(offsetParam ?? 0);
    const limit = Number(limitParam ?? rows.length);
    to = from + limit - 1;
  } else if (header && /^\d+-\d+$/.test(header)) {
    const [a, b] = header.split("-").map(Number);
    from = a;
    to = b;
  }
  const slice = rows.slice(from, to + 1);
  return { slice, from, to, total: rows.length };
}

async function json(route: Route, body: unknown, extra: Record<string, string> = {}, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-headers": "*",
      "access-control-expose-headers": "content-range,content-profile",
      ...extra,
    },
    body: JSON.stringify(body),
  });
}

export async function mockSupabase(page: Page, options: MockOptions = {}) {
  const listings = options.listings ?? makeListings(6);
  if (!Array.isArray(listings)) {
    throw new Error("mockSupabase listings must be an array");
  }
  const session = options.authenticated ? sessionPayload() : null;

  if (session) {
    await page.addInitScript(
      ({ key, value }) => {
        localStorage.setItem(key, JSON.stringify(value));
      },
      {
        key: "sb-mdewakadxwgxigijmcxe-auth-token",
        value: session,
      },
    );
  }

  await page.route(SUPABASE_HOST, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const method = request.method();
    const path = url.pathname;

    if (method === "OPTIONS") {
      await route.fulfill({
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-headers": "*",
          "access-control-allow-methods": "GET,POST,PATCH,PUT,DELETE,OPTIONS",
        },
      });
      return;
    }

    if (path.includes("/realtime/")) {
      await route.abort();
      return;
    }

    if (path.startsWith("/auth/v1/token") && method === "POST") {
      const grant = url.searchParams.get("grant_type");
      const body = request.postDataJSON() as { email?: string; password?: string } | null;
      if (grant === "password") {
        if (body?.email === TEST_USER.email && body?.password === TEST_USER.password) {
          await json(route, sessionPayload());
          return;
        }
        await json(route, { error: "invalid_grant", error_description: "Invalid login credentials" }, {}, 400);
        return;
      }
      if (grant === "refresh_token" && session) {
        await json(route, session);
        return;
      }
      await json(route, { error: "invalid_grant" }, {}, 400);
      return;
    }

    if (path.startsWith("/auth/v1/signup") && method === "POST") {
      await json(route, sessionPayload());
      return;
    }

    if (path.startsWith("/auth/v1/recover") && method === "POST") {
      await json(route, {});
      return;
    }

    if (path.startsWith("/auth/v1/resend") && method === "POST") {
      await json(route, {});
      return;
    }

    if (path.startsWith("/auth/v1/logout")) {
      await json(route, {});
      return;
    }

    if (path.startsWith("/auth/v1/user") && method === "GET") {
      if (session) {
        await json(route, session.user);
        return;
      }
      await json(route, { message: "Unauthorized" }, {}, 401);
      return;
    }

    if (path.startsWith("/auth/v1/authorize")) {
      await json(route, { url: `${url.origin}/auth/v1/callback` });
      return;
    }

    if (path.startsWith("/auth/v1/settings")) {
      await json(route, { disable_signup: false, external: { google: true, facebook: false } });
      return;
    }

    if (!path.startsWith("/rest/v1/")) {
      await json(route, {});
      return;
    }

    const table = path.replace("/rest/v1/", "").split("/")[0];
    const accept = request.headers()["accept"] ?? "";
    const wantsObject = accept.includes("vnd.pgrst.object+json");

    if (table === "listings") {
      const filtered = applyListingFilters(listings, url);
      const range = rangeSlice(filtered, url, request.headers()["range"]);
      const payload = wantsObject
        ? (range.slice[0] ?? null)
        : url.searchParams.get("select") === "school_id"
          ? range.slice.map((r) => ({ school_id: r.school_id }))
          : range.slice;

      if (wantsObject && !range.slice[0]) {
        await json(route, { code: "PGRST116", message: "Cannot coerce the result to a single JSON object" }, {}, 406);
        return;
      }

      const end = range.total === 0 ? 0 : range.from + range.slice.length - 1;
      await json(route, payload, {
        "content-range": range.total === 0 ? "*/0" : `${range.from}-${Math.max(end, 0)}/${range.total}`,
      });
      return;
    }

    if (table === "profiles") {
      if (method === "POST") {
        await json(route, [{ id: TEST_USER.id, full_name: TEST_USER.fullName }]);
        return;
      }
      const id = parseEq(url.searchParams.get("id"));
      const rows = [
        {
          id: TEST_USER.id,
          full_name: TEST_USER.fullName,
          avatar_url: null,
          school_id: "university-of-lagos",
          bio: null,
          is_admin: false,
          is_suspended: false,
        },
        {
          id: "user-lister-1",
          full_name: "Ada Lister",
          avatar_url: null,
          school_id: "university-of-lagos",
          bio: null,
          is_admin: false,
          is_suspended: false,
        },
      ].filter((r) => !id || r.id === id);
      if (wantsObject) {
        if (!rows[0]) {
          await json(route, { code: "PGRST116", message: "not found" }, {}, 406);
          return;
        }
        await json(route, rows[0]);
        return;
      }
      await json(route, rows);
      return;
    }

    if (wantsObject) {
      await json(route, { code: "PGRST116", message: "not found" }, {}, 406);
      return;
    }

    await json(route, []);
  });
}
