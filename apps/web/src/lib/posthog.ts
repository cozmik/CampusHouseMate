import posthog from "posthog-js";

export const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN ?? "";
export const POSTHOG_HOST =
  import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com";

export const posthogOptions = {
  api_host: POSTHOG_HOST,
  defaults: "2026-05-30" as const,
  person_profiles: "identified_only" as const,
};

export function captureEvent(
  event: string,
  properties?: Record<string, unknown>,
) {
  if (!POSTHOG_KEY) return;
  posthog.capture(event, properties);
}
