import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useApp } from "@/lib/store";
import { formatPrice } from "@housemates/shared-utils";
import {
  applySeo,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  isPrivatePath,
  SITE_NAME,
  siteOrigin,
  withSuffix,
} from "@/lib/seo";

function canonicalSearch(search: string) {
  const params = new URLSearchParams(search);
  const keep = new URLSearchParams();
  for (const key of ["school", "state", "lga", "q"]) {
    const value = params.get(key);
    if (value) keep.set(key, value);
  }
  const qs = keep.toString();
  return qs ? `?${qs}` : "";
}

export function DocumentSeo() {
  const location = useLocation();
  const { getListing, getSchool } = useApp();
  const listing = location.pathname.startsWith("/listings/")
    ? getListing(location.pathname.split("/")[2] ?? "")
    : undefined;
  const schoolId = new URLSearchParams(location.search).get("school") ?? "";
  const school = schoolId ? getSchool(schoolId) : undefined;

  useEffect(() => {
    const { pathname, search } = location;

    if (isPrivatePath(pathname)) {
      applySeo({
        title: withSuffix(
          pathname.startsWith("/messages")
            ? "Messages"
            : pathname.startsWith("/dashboard")
              ? "Dashboard"
              : pathname.startsWith("/profile")
                ? "Profile"
                : pathname.startsWith("/admin")
                  ? "Admin"
                  : "Account",
        ),
        description: DEFAULT_DESCRIPTION,
        path: pathname,
        robots: "noindex,nofollow",
      });
      return;
    }

    if (pathname === "/") {
      applySeo({
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        path: "/",
        jsonLd: [
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            url: siteOrigin(),
            description: DEFAULT_DESCRIPTION,
            potentialAction: {
              "@type": "SearchAction",
              target: `${siteOrigin()}/browse?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: SITE_NAME,
            url: siteOrigin(),
            logo: `${siteOrigin()}/web-app-manifest-512x512.png`,
            description: "Student hostel handover marketplace for Nigerian campuses.",
          },
        ],
      });
      return;
    }

    if (pathname === "/browse") {
      const state = new URLSearchParams(search).get("state");
      const lga = new URLSearchParams(search).get("lga");
      const q = new URLSearchParams(search).get("q");
      const where = school?.name || lga || state || q;
      const title = where
        ? withSuffix(`Student hostels near ${where}`)
        : withSuffix("Browse student hostels");
      const description = where
        ? `Available hostel handovers near ${where}. Chat with the current occupant on Housemates Finder — free, no in-app payments.`
        : "Browse student hostel handovers across Nigerian campuses. Filter by school, state, or LGA and message the current occupant.";
      applySeo({
        title,
        description,
        path: `${pathname}${canonicalSearch(search)}`,
      });
      return;
    }

    if (pathname.startsWith("/listings/")) {
      if (!listing) {
        applySeo({
          title: withSuffix("Student hostel listing"),
          description: DEFAULT_DESCRIPTION,
          path: pathname,
        });
        return;
      }
      const listingSchool = getSchool(listing.schoolId);
      const place = [listing.area, listing.lga, listing.state].filter(Boolean).join(", ");
      const snippet = listing.description.replace(/\s+/g, " ").slice(0, 140);
      const description = `${listing.title} — ${formatPrice(listing.price, listing.pricePeriod)} near ${listingSchool?.name ?? "campus"} in ${place}. ${snippet}`.trim();
      applySeo({
        title: withSuffix(listing.title),
        description,
        path: pathname,
        image: listing.photos[0]?.url,
        type: "article",
        jsonLd: {
          "@context": "https://schema.org",
          "@type": "Accommodation",
          name: listing.title,
          description: listing.description || description,
          url: `${siteOrigin()}${pathname}`,
          image: listing.photos[0]?.url,
          address: {
            "@type": "PostalAddress",
            addressLocality: listing.lga,
            addressRegion: listing.state,
            addressCountry: "NG",
          },
          offers: {
            "@type": "Offer",
            price: listing.price,
            priceCurrency: "NGN",
            availability:
              listing.status === "available"
                ? "https://schema.org/InStock"
                : "https://schema.org/SoldOut",
            url: `${siteOrigin()}${pathname}`,
          },
        },
      });
      return;
    }

    if (pathname === "/login") {
      applySeo({
        title: withSuffix("Log in"),
        description: "Log in to Housemates Finder to post a space, save listings, and message other students.",
        path: pathname,
      });
      return;
    }

    if (pathname === "/signup") {
      applySeo({
        title: withSuffix("Create an account"),
        description: "Join Housemates Finder to hand over your lodge or find a student hostel near your campus. Free to use.",
        path: pathname,
      });
      return;
    }

    if (pathname === "/forgot-password") {
      applySeo({
        title: withSuffix("Forgot password"),
        description: "Reset your Housemates Finder password.",
        path: pathname,
        robots: "noindex,follow",
      });
      return;
    }

    if (pathname === "/post") {
      applySeo({
        title: withSuffix("Post a space"),
        description: "Hand over your student lodge to the next occupant. Post a listing on Housemates Finder in a few minutes — free.",
        path: pathname,
      });
      return;
    }

    applySeo({
      title: withSuffix("Page not found"),
      description: "This page does not exist on Housemates Finder.",
      path: pathname,
      robots: "noindex,follow",
    });
  }, [getSchool, listing, location, school]);

  return null;
}
