import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/housemate/Logo";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let finished = false;

    const go = (ok: boolean, message?: string) => {
      if (cancelled || finished) return;
      finished = true;
      if (ok) navigate("/dashboard", { replace: true });
      else setError(message ?? "Could not complete social login.");
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        if (cancelled || finished) return;
        finished = true;
        navigate("/reset-password", { replace: true });
        return;
      }
      if (session && (event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        go(true);
      }
    });

    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (sessionError) go(false, sessionError.message);
      else if (data.session) go(true);
    });

    const timeout = window.setTimeout(() => {
      if (!cancelled && !finished) setError((prev) => prev ?? "Sign-in timed out. Try again.");
    }, 15000);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-hero px-4 py-10">
      <div className="relative w-full max-w-md text-center">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <div className="rounded-3xl glass-strong p-7 sm:p-10">
          {error ? (
            <>
              <h1 className="text-2xl font-bold">Couldn’t finish sign-in</h1>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              <p className="mt-5 text-sm">
                <Link to="/login" className="font-semibold text-primary">Back to log in</Link>
              </p>
            </>
          ) : (
            <>
              <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">Finishing sign-in…</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
