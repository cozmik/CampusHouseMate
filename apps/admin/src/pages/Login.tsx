import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@housemates/shared-ui/button";
import { Input } from "@housemates/shared-ui/input";
import { Label } from "@housemates/shared-ui/label";
import { useAuth } from "@/lib/auth";

export default function Login() {
  const { sessionReady, isAdmin, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (sessionReady && isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const signInError = await signIn(email.trim(), password);
      if (signInError) {
        setError(signInError);
        return;
      }
      toast.success("Signed in");
      navigate("/dashboard", { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="glass w-full max-w-sm animate-pop-in rounded-2xl p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <img
            src="/brand/hmf-circle.png"
            alt="Housemates Finder"
            className="mb-4 h-12 w-12 rounded-2xl ring-1 ring-black/10"
          />
          <h1 className="font-display text-xl font-semibold tracking-tight">Housemates Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Back office access only</p>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Email
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="admin@housemates.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-black/[0.03] pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-black/[0.03] pl-10"
              />
            </div>
          </div>

          {error ? (
            <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-600">{error}</p>
          ) : null}

          <Button type="submit" disabled={submitting} className="h-11 w-full font-medium">
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
