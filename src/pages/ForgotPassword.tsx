import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/housemate/Logo";

export default function ForgotPassword() {
  const { requestPasswordReset } = useApp();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmedEmail = email.trim();
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
    if (!okEmail) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    const res = await requestPasswordReset(trimmedEmail);
    setLoading(false);
    if (res.ok) setSent(true);
    else setError(res.error ?? "Could not send the reset link.");
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-hero px-4 py-10">
      <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-coral/20 blur-3xl" />
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <div className="rounded-3xl glass-strong p-7 sm:p-10">
          <h1 className="text-2xl font-bold">Forgot password?</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter the email on your account and we’ll send a reset link.
          </p>
          {sent ? (
            <div className="mt-7 space-y-5">
              <p className="rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
                Check your inbox (and spam) for a reset link. You can close this page.
              </p>
              <p className="text-center text-sm text-muted-foreground">
                <Link to="/login" className="font-semibold text-primary">Back to log in</Link>
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-7 space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-9" />
                </div>
              </div>
              {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full bg-gradient-primary shadow-glow" disabled={loading}>
                {loading ? "Sending…" : "Send reset link"}<ArrowRight className="h-4 w-4" />
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Remembered it? <Link to="/login" className="font-semibold text-primary">Log in</Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
