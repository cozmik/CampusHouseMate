import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Loader2, Mail, ShieldCheck } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function VerifyEmail() {
  const { currentUser, resendEmailVerification } = useApp();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const prefillEmail = params.get("email") ?? "";

  const [email, setEmail] = useState(prefillEmail || currentUser?.email || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (prefillEmail) setEmail(prefillEmail);
  }, [prefillEmail]);

  useEffect(() => {
    if (!prefillEmail && currentUser?.email) setEmail(currentUser.email);
  }, [currentUser?.email, prefillEmail]);

  const emailVerified = Boolean(currentUser?.emailConfirmedAt);

  const onResend = async () => {
    setError(null);
    setSubmitting(true);
    const res = await resendEmailVerification(email);
    setSubmitting(false);
    if (res.ok) setSent(true);
    else setError(res.error ?? "Could not send the confirmation link.");
  };

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:px-6 sm:py-12">
      <div className="rounded-3xl glass-strong p-7 sm:p-10">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
            {emailVerified ? <ShieldCheck className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold">
              {emailVerified ? "Email confirmed" : "Confirm your email"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {emailVerified
                ? "Thanks — you're all set. Keep browsing, posting, and chatting as usual."
                : "Optional, but recommended. It helps other students trust your profile and makes account recovery easier. You can keep using HouseMate without it."}
            </p>
          </div>
        </div>

        {!emailVerified && (
          <>
            <div className="mt-6 rounded-xl bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Why confirm?</p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs sm:text-sm">
                <li>Shows your account is reachable at this address</li>
                <li>Makes it easier to recover access if you forget your password</li>
                <li>Builds a little extra trust when you message about a space</li>
              </ul>
            </div>

            <div className="mt-6 space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            {sent && (
              <p className="mt-4 rounded-lg bg-primary/10 px-3 py-2 text-sm text-primary">
                Link sent — check your inbox (and spam folder). You can close this page and come back anytime.
              </p>
            )}

            {error && (
              <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-col gap-3">
              <Button
                type="button"
                className="w-full bg-gradient-primary shadow-glow"
                onClick={() => void onResend()}
                disabled={submitting}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {submitting ? "Sending…" : sent ? "Send again" : "Send confirmation link"}
                {!submitting && <ArrowRight className="h-4 w-4" />}
              </Button>

              {currentUser ? (
                <Button type="button" variant="ghost" className="w-full text-muted-foreground" onClick={() => navigate("/dashboard")}>
                  Continue without confirming
                </Button>
              ) : (
                <p className="text-center text-sm text-muted-foreground">
                  Already confirmed?{" "}
                  <Link to="/login" className="font-semibold text-primary">
                    Log in
                  </Link>
                </p>
              )}
            </div>
          </>
        )}

        {emailVerified && (
          <div className="mt-6">
            <Button asChild className="w-full bg-gradient-primary shadow-glow">
              <Link to="/dashboard">Back to dashboard</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
