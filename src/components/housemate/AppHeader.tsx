import { NavLink, useNavigate } from "react-router-dom";
import { Flag, LayoutDashboard, LogOut, MessageSquare, Plus, Search, ShieldCheck, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useApp } from "@/lib/store";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { ReportDialog } from "./ReportDialog";

const navItems = [
  { to: "/browse", label: "Browse", icon: Search },
  { to: "/post", label: "Post a space", icon: Plus },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function AppHeader() {
  const { currentUser, logout } = useApp();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 glass-nav">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-accent text-accent-foreground",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-white/50 bg-card/70 p-1 pr-3 shadow-card backdrop-blur-md transition-shadow hover:shadow-elevated">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatarUrl} alt={currentUser.fullName} />
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {initials(currentUser.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium sm:block">
                    {currentUser.fullName.split(" ")[0]}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-medium">{currentUser.fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">{currentUser.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <UserIcon className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/messages")}>
                  <MessageSquare className="mr-2 h-4 w-4" /> Messages
                </DropdownMenuItem>
                {currentUser.isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/admin/reports")}>
                    <ShieldCheck className="mr-2 h-4 w-4" /> Review reports
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <ReportDialog
                  targetType="general"
                  trigger={
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Flag className="mr-2 h-4 w-4" /> Report an issue
                    </DropdownMenuItem>
                  }
                />
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => { void logout().then(() => navigate("/")); }}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="hidden sm:inline-flex">
                Log in
              </Button>
              <Button size="sm" onClick={() => navigate("/signup")} className="shadow-glow">
                Get started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
