export const SITE_NAME = "Housemates Finder";

export function siteOrigin() {
  const fromEnv = import.meta.env.VITE_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return window.location.origin;
  return "https://housemates.ng";
}

export const DEFAULT_TITLE = "Housemates Finder — Find student hostels in Nigeria";

export const DEFAULT_DESCRIPTION =
  "Find or hand over a student hostel near Nigerian campuses. Search by school or area, chat privately — free, no in-app payments.";

export const DEFAULT_IMAGE = `${siteOrigin()}/og.png`;

export const DEFAULT_IMAGE_WIDTH = "644";
export const DEFAULT_IMAGE_HEIGHT = "645";

export const TITLE_SUFFIX = "Housemates Finder";

const PRIVATE_PREFIXES = [
  "/dashboard",
  "/messages",
  "/profile",
  "/admin",
  "/verify-email",
  "/auth/",
  "/reset-password",
];

export type SeoInput = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  robots?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    document.head.appendChild(el);
  }
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function upsertJsonLd(data: Record<string, unknown> | Record<string, unknown>[] | undefined) {
  let el = document.getElementById("json-ld-seo") as HTMLScriptElement | null;
  if (!data) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement("script");
    el.id = "json-ld-seo";
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

export function applySeo({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  type = "website",
  robots = "index,follow",
  jsonLd,
}: SeoInput) {
  const url = `${siteOrigin()}${path ?? "/"}`;
  document.title = title;
  upsertMeta('meta[name="description"]', { name: "description", content: description });
  upsertMeta('meta[name="robots"]', { name: "robots", content: robots });
  upsertMeta('meta[property="og:title"]', { property: "og:title", content: title });
  upsertMeta('meta[property="og:description"]', { property: "og:description", content: description });
  upsertMeta('meta[property="og:url"]', { property: "og:url", content: url });
  upsertMeta('meta[property="og:image"]', { property: "og:image", content: image });
  upsertMeta('meta[property="og:image:width"]', { property: "og:image:width", content: DEFAULT_IMAGE_WIDTH });
  upsertMeta('meta[property="og:image:height"]', { property: "og:image:height", content: DEFAULT_IMAGE_HEIGHT });
  upsertMeta('meta[property="og:image:alt"]', { property: "og:image:alt", content: SITE_NAME });
  upsertMeta('meta[property="og:type"]', { property: "og:type", content: type });
  upsertMeta('meta[property="og:site_name"]', { property: "og:site_name", content: SITE_NAME });
  upsertMeta('meta[property="og:locale"]', { property: "og:locale", content: "en_NG" });
  upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
  upsertMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
  upsertMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
  upsertMeta('meta[name="twitter:image"]', { name: "twitter:image", content: image });
  upsertLink("canonical", url);
  upsertJsonLd(jsonLd);
}

export function isPrivatePath(pathname: string) {
  return PRIVATE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));
}

export function withSuffix(page: string) {
  return `${page} · ${TITLE_SUFFIX}`;
}

