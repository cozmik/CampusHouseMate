import { useEffect, useRef } from "react";
import { usePostHog } from "@posthog/react";
import { useApp } from "@/lib/store";
import { POSTHOG_KEY } from "@/lib/posthog";

function PostHogIdentifyInner() {
  const { authReady, currentUser } = useApp();
  const posthog = usePostHog();
  const identified = useRef(false);

  useEffect(() => {
    if (!authReady || !posthog) return;
    if (currentUser) {
      posthog.identify(currentUser.id, {
        email: currentUser.email,
        name: currentUser.fullName,
        first_name: currentUser.firstName,
        last_name: currentUser.lastName,
        school_id: currentUser.schoolId,
      });
      identified.current = true;
      return;
    }
    if (identified.current) {
      posthog.reset();
      identified.current = false;
    }
  }, [authReady, currentUser, posthog]);

  return null;
}

export function PostHogIdentify() {
  if (!POSTHOG_KEY) return null;
  return <PostHogIdentifyInner />;
}
