import { useNavigate } from "react-router-dom";
import { Home, LogOut, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { initials } from "@housemates/shared-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@housemates/shared-ui/avatar";
import { Button } from "@housemates/shared-ui/button";
import { useAuth } from "@/lib/auth";
import { PageHeader } from "@/components/PageHeader";

export default function Settings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/login", { replace: true });
  };

  const displayName = user?.fullName || user?.email || "Admin";

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Settings" description="Your back office account" />

      <div className="glass card-glow rounded-2xl p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <Avatar className="h-16 w-16">
            {user?.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={displayName} /> : null}
            <AvatarFallback className="bg-gradient-to-br from-teal-500 to-coral-deep text-lg text-white">
              {initials(displayName) || "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="font-display text-lg font-semibold tracking-tight">{displayName}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" />
              {user?.email ?? "no email"}
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-2.5 py-0.5 text-xs font-medium text-teal-700 ring-1 ring-inset ring-teal-500/25">
              <ShieldCheck className="h-3.5 w-3.5" />
              Administrator
            </span>
          </div>
        </div>
      </div>

      <div className="glass mt-4 rounded-2xl p-6">
        <h3 className="font-display text-sm font-semibold tracking-tight">Session</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Signing out ends your session on this device. You will need your credentials to sign back in.
        </p>
        <Button variant="outline" className="mt-4 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700" onClick={() => void handleSignOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>

      <div className="glass mt-4 rounded-2xl p-6">
        <h3 className="font-display text-sm font-semibold tracking-tight">About</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Housemates back office — monitoring platform activity for the Housemates Finder marketplace.
        </p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate("/dashboard")}>
          <Home className="mr-2 h-4 w-4" />
          Back to dashboard
        </Button>
      </div>
    </div>
  );
}
