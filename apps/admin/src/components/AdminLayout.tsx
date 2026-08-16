import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { LogOut, Menu, User } from "lucide-react";
import { toast } from "sonner";
import { initials } from "@housemates/shared-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@housemates/shared-ui/avatar";
import { Button } from "@housemates/shared-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@housemates/shared-ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@housemates/shared-ui/sheet";
import { useAuth } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/login", { replace: true });
  };

  const displayName = user?.fullName || user?.email || "Admin";

  return (
    <div className="min-h-screen">
      <Sidebar />

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="fixed left-4 top-4 z-40 md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 border-r border-border/60 bg-card/90 p-0">
          <SheetTitle className="sr-only">Admin navigation</SheetTitle>
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div className="flex min-h-screen flex-col md:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/60 bg-background/70 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3 md:hidden">
            <img
              src="/brand/hmf-circle.png"
              alt="Housemates Finder"
              className="h-8 w-8 rounded-full ring-1 ring-white/10"
            />
            <span className="font-display text-sm font-semibold">Housemates Admin</span>
          </div>
          <div className="hidden text-sm text-muted-foreground md:block">
            Welcome back, <span className="font-medium text-foreground">{user?.firstName || "admin"}</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 rounded-full px-1.5 py-1.5">
                <Avatar className="h-8 w-8">
                  {user?.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={displayName} /> : null}
                  <AvatarFallback className="bg-gradient-to-br from-teal-500 to-coral-deep text-xs text-white">
                    {initials(displayName) || "A"}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[12rem] truncate text-sm font-medium lg:block">
                  {displayName}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="truncate text-sm font-medium">{displayName}</span>
                  {user?.email ? (
                    <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
                  ) : null}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <User className="mr-2 h-4 w-4" />
                Account settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => void handleSignOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 animate-fade-in px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
