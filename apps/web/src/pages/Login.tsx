import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Mail, ArrowRight } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@housemates/shared-ui/button";
import { Input } from "@housemates/shared-ui/input";
import { Label } from "@housemates/shared-ui/label";
import { Logo } from "@/components/housemate/Logo";
import { PasswordField } from "@/components/housemate/PasswordField";
import { SocialAuth } from "@/components/housemate/SocialAuth";

export default function Login() {
  const { login, currentUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string; email?: string } | null)?.from ?? "/dashboard";
  const prefillEmail = (location.state as { email?: string } | null)?.email ?? "";

  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const trimmedEmail = email.trim();
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
    if (!okEmail) {
      setLoading(false);
      setError("Please enter a valid email address.");
      return;
    }

    const res = await login(trimmedEmail, password);
    setLoading(false);
    if (res.ok) {
      navigate(from, { replace: true });
      return;
    }

    const msg = (res.error ?? "Could not log in.").toString();
    const lower = msg.toLowerCase();
    if (lower.includes("confirm") || lower.includes("not confirmed") || lower.includes("verification")) {
      setError("Couldn't start a session. Confirming your email is optional — try again in a moment.");
      return;
    }
    setError(msg);
  };

  if (currentUser) {
    return <Navigate to={from} replace />;
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-hero px-4 py-10">
      <div className="pointer-events-none absolute -left-20 top-0 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-coral/20 blur-3xl" />
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <div className="rounded-3xl glass-strong p-7 sm:p-10">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">Log in to continue to Housemates Finder.</p>
          <form onSubmit={onSubmit} className="mt-7 space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-9" />
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs font-semibold text-primary">
                  Forgot password?
                </Link>
              </div>
              <PasswordField
                id="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={setPassword}
                placeholder="••••••••"
              />
            </div>
            {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full bg-gradient-primary shadow-glow" disabled={loading}>
              {loading ? "Logging in…" : "Log in"}<ArrowRight className="h-4 w-4" />
            </Button>
          </form>
          <div className="mt-5">
            <SocialAuth label="Continue with" />
          </div>
          <p className="mt-5 text-center text-sm text-muted-foreground">New here? <Link to="/signup" className="font-semibold text-primary">Create an account</Link></p>
        </div>
      </div>
    </div>
  );
}
