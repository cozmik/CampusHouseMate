import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background pb-24 md:pb-0">
      <AppHeader />
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
