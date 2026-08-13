import { useState } from "react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.7-5.5 3.7-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.1 14.6 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12S6.6 21.8 12 21.8c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
    </svg>
  );
}

export function SocialAuth({ label = "Continue with" }: { label?: string }) {
  const { loginWithOAuth } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const onGoogle = async () => {
    setError("");
    setBusy(true);
    const res = await loginWithOAuth("google");
    if (!res.ok) {
      setBusy(false);
      setError(res.error ?? "Could not start Google login.");
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/70" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wide">
          <span className="bg-card px-2 text-muted-foreground">or {label.toLowerCase()}</span>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={busy}
        onClick={() => void onGoogle()}
      >
        <GoogleIcon />
        {busy ? "Redirecting…" : `${label} Google`}
      </Button>
      {error && <p className="text-center text-sm text-destructive">{error}</p>}
    </div>
  );
}

