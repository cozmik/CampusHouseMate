import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/housemate/Logo";

export default function ResetPassword() {
  const { updatePassword } = useApp();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [canReset, setCanReset] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const markReady = (ok: boolean) => {
      if (cancelled) return;
      setCanReset(ok);
      setReady(true);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) markReady(true);
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) markReady(true);
      else {
        window.setTimeout(() => {
          if (!cancelled) setReady((prev) => {
            if (!prev) markReady(false);
            return true;
          });
        }, 1200);
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    const res = await updatePassword(password);
    setLoading(false);
    if (res.ok) navigate("/dashboard", { replace: true });
    else setError(res.error ?? "Could not update your password.");
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-hero px-4 py-10">
      <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-coral/20 blur-3xl" />
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <div className="rounded-3xl glass-strong p-7 sm:p-10">
          {!ready ? (
            <div className="flex flex-col items-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">Checking reset link…</p>
            </div>
          ) : !canReset ? (
            <>
              <h1 className="text-2xl font-bold">Link expired</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                This reset link is invalid or has already been used. Request a new one.
              </p>
              <p className="mt-5 text-sm">
                <Link to="/forgot-password" className="font-semibold text-primary">Send a new link</Link>
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold">Set a new password</h1>
              <p className="mt-1 text-sm text-muted-foreground">Choose something you’ll remember. At least 6 characters.</p>
              <form onSubmit={onSubmit} className="mt-7 space-y-5">
                <div className="space-y-1.5">
                  <Label htmlFor="password">New password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm">Confirm password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="confirm" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="pl-9" />
                  </div>
                </div>
                {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full bg-gradient-primary shadow-glow" disabled={loading}>
                  {loading ? "Saving…" : "Update password"}<ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
