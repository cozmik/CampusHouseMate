import { NavLink } from "react-router-dom";
import { Home, Plus, Search, MessageSquare, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/browse", label: "Browse", icon: Search, end: false },
  { to: "/post", label: "Post", icon: Plus, end: false, center: true },
  { to: "/messages", label: "Chats", icon: MessageSquare, end: false },
  { to: "/dashboard", label: "You", icon: LayoutDashboard, end: false },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-md items-end justify-around px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5">
        {items.map((item) => {
          const content = (
            <span className="flex flex-col items-center gap-0.5">
              <span className={cn(
                "grid h-7 w-7 place-items-center rounded-lg transition-colors",
                item.center ? "bg-gradient-primary text-primary-foreground shadow-glow" : "text-muted-foreground",
              )}>
                <item.icon className="h-5 w-5" />
              </span>
              <span className="text-[10px] font-medium text-muted-foreground">{item.label}</span>
            </span>
          );
          if (item.center) {
            return <NavLink key={item.to} to={item.to} className="-mt-4">{content}</NavLink>;
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn("flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1 transition-colors",
                  isActive && "[&>span>span:first-child]:text-primary [&>span>span:last-child]:text-primary")
              }
            >
              {content}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
