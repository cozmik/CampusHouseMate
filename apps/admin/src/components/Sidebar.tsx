import { NavLink } from "react-router-dom";
import {
  Building2,
  Flag,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { cn } from "@housemates/shared-utils";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/users", label: "Users", icon: Users },
  { to: "/listings", label: "Listings", icon: Building2 },
  { to: "/reports", label: "Reports", icon: Flag },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border/60 bg-card/40 backdrop-blur-xl md:flex">
      <div className="flex h-16 items-center gap-3 border-b border-border/60 px-6">
        <img
          src="/brand/hmf-circle.png"
          alt="Housemates Finder"
          className="h-9 w-9 rounded-full ring-1 ring-white/10"
        />
        <div className="leading-tight">
          <p className="font-display text-sm font-semibold tracking-tight">Housemates</p>
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
            Back office
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-gradient-to-r from-teal-500/15 to-coral/10 text-foreground"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-gradient-to-b from-teal-400 to-coral-deep" />
                )}
                <Icon className={cn("h-4 w-4", isActive ? "text-teal-400" : "text-muted-foreground group-hover:text-foreground")} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-3 border-t border-border/60 px-6 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10">
          <ShieldCheck className="h-4 w-4 text-teal-400" />
        </div>
        <div className="leading-tight">
          <p className="text-xs font-medium text-foreground">Admin access</p>
          <p className="text-[11px] text-muted-foreground">Full control</p>
        </div>
      </div>
    </aside>
  );
}
