import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@housemates/shared-ui/button";
import { useApp } from "@/lib/store";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";

export function AppLayout({ children }: { children: ReactNode }) {
  const { currentUser } = useApp();
  const location = useLocation();
  const needsConfirm = Boolean(currentUser?.email && !currentUser.emailConfirmedAt);
  const onVerifyPage = location.pathname === "/verify-email";

  return (
    <div className="flex min-h-screen flex-col bg-background pb-24 md:pb-0">
      <AppHeader />
      {needsConfirm && !onVerifyPage && (
        <div className="border-b border-primary/20 bg-primary/5">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <Mail className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Confirm your email</p>
                <p className="text-sm text-muted-foreground">
                  Optional, but recommended. It helps other students trust your profile and makes account recovery easier.
                </p>
              </div>
            </div>
            <Button asChild className="shrink-0 bg-gradient-primary shadow-glow">
              <Link to={`/verify-email?email=${encodeURIComponent(currentUser?.email ?? "")}`}>
                Confirm email<ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-secondary/20">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6 lg:px-8">
          <div className="max-w-sm space-y-2">
            <p className="text-sm font-semibold">Housemates Finder</p>
            <p className="text-sm text-muted-foreground">
              Find and hand over student hostels near Nigerian campuses. Free to use — no payments in the app.
            </p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link to="/browse" className="text-muted-foreground hover:text-foreground">Browse spaces</Link>
            <Link to="/post" className="text-muted-foreground hover:text-foreground">Post a space</Link>
            <Link to="/login" className="text-muted-foreground hover:text-foreground">Log in</Link>
            <Link to="/signup" className="text-muted-foreground hover:text-foreground">Sign up</Link>
            <Link to="/terms" className="text-muted-foreground hover:text-foreground">Terms</Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground">Privacy</Link>
          </nav>
        </div>
      </footer>
      <BottomNav />
    </div>
  );
}
