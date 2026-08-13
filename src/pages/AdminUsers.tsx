import { useEffect, useState } from "react";
import { Loader2, RefreshCw, ShieldCheck, ShieldOff, Ban, Undo2, Users } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export default function AdminUsers() {
  const { currentUser, fetchAllUsers, setUserAdmin, setUserSuspended, getSchool } = useApp();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setUsers(await fetchAllUsers());
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleAdmin = async (user: Profile) => {
    const next = !user.isAdmin;
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isAdmin: next } : u)));
    await setUserAdmin(user.id, next);
  };

  const toggleSuspended = async (user: Profile) => {
    const next = !user.isSuspended;
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isSuspended: next } : u)));
    await setUserSuspended(user.id, next);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-6 flex items-center justify-between gap-3 sm:mb-8">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? "Loading…" : `${users.length} registered`}
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={() => void load()} disabled={loading} aria-label="Refresh">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-20 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No users yet</h3>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((user) => {
            const isSelf = user.id === currentUser?.id;
            const school = user.schoolId ? getSchool(user.schoolId) : undefined;
            return (
              <div
                key={user.id}
                className={cn(
                  "flex flex-wrap items-center gap-4 rounded-2xl bg-card p-4 shadow-card",
                  user.isSuspended && "opacity-60",
                )}
              >
                <Avatar className="h-11 w-11 shrink-0">
                  <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                  <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                    {initials(user.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="truncate font-semibold">{user.fullName}</p>
                    {user.isAdmin && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">
                        Admin
                      </span>
                    )}
                    {user.isSuspended && (
                      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-destructive">
                        Suspended
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email ?? "No email on file"}
                    {school && ` · ${school.name}`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isSelf}
                    onClick={() => void toggleAdmin(user)}
                    title={isSelf ? "You can't change your own admin access" : undefined}
                  >
                    {user.isAdmin ? (
                      <>
                        <ShieldOff className="h-3.5 w-3.5" />
                        Revoke admin
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Make admin
                      </>
                    )}
                  </Button>
                  <Button
                    variant={user.isSuspended ? "outline" : "destructive"}
                    size="sm"
                    disabled={isSelf}
                    onClick={() => void toggleSuspended(user)}
                    title={isSelf ? "You can't suspend your own account" : undefined}
                  >
                    {user.isSuspended ? (
                      <>
                        <Undo2 className="h-3.5 w-3.5" />
                        Unsuspend
                      </>
                    ) : (
                      <>
                        <Ban className="h-3.5 w-3.5" />
                        Suspend
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
