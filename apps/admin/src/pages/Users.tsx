import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Ban,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldOff,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchAllUsers,
  setUserAdmin,
  setUserSuspended,
  type AdminUser,
} from "@housemates/shared-supabase";
import { getSchool } from "@housemates/shared-data";
import { initials, timeAgo } from "@housemates/shared-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@housemates/shared-ui/avatar";
import { Button } from "@housemates/shared-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@housemates/shared-ui/dropdown-menu";
import { Input } from "@housemates/shared-ui/input";
import { DataTable, type Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setUsers(await fetchAllUsers());
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => {
      const haystack = [u.fullName, u.email, u.firstName, u.lastName].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(q);
    });
  }, [users, query]);

  const toggleAdmin = async (user: AdminUser) => {
    const next = !user.isAdmin;
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isAdmin: next } : u)));
    await setUserAdmin(user.id, next);
    toast.success(next ? `${user.fullName} is now an admin` : `Admin rights removed from ${user.fullName}`);
  };

  const toggleSuspended = async (user: AdminUser) => {
    const next = !user.isSuspended;
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isSuspended: next } : u)));
    await setUserSuspended(user.id, next);
    toast.success(next ? `${user.fullName} suspended` : `${user.fullName} reinstated`);
  };

  const columns: Column<AdminUser>[] = [
    {
      key: "user",
      header: "User",
      render: (u) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {u.avatarUrl ? <AvatarImage src={u.avatarUrl} alt={u.fullName} /> : null}
            <AvatarFallback className="bg-black/5 text-xs">{initials(u.fullName) || "U"}</AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => navigate(`/users/${u.id}`)}
            className="min-w-0 text-left leading-tight hover:underline"
            title="View profile"
          >
            <p className="truncate font-medium text-foreground">{u.fullName || "—"}</p>
            <p className="truncate text-xs text-muted-foreground">{u.email || "no email"}</p>
          </button>
        </div>
      ),
    },
    {
      key: "school",
      header: "School",
      render: (u) => <span className="text-muted-foreground">{u.schoolId ? getSchool(u.schoolId)?.name ?? u.schoolId : "—"}</span>,
    },
    {
      key: "listings",
      header: "Listings",
      className: "text-center",
      render: (u) => <span className="font-medium">{u.listingCount}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (u) => (
        <div className="flex flex-wrap gap-1.5">
          {u.isSuspended ? (
            <StatusBadge tone="suspended">Suspended</StatusBadge>
          ) : (
            <StatusBadge tone="available">Active</StatusBadge>
          )}
          {u.isAdmin ? <StatusBadge tone="admin">Admin</StatusBadge> : null}
        </div>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      render: (u) => <span className="text-muted-foreground">{timeAgo(u.joinedAt)}</span>,
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "w-12 text-right",
      render: (u) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <span className="sr-only">Actions</span>
              <span className="text-muted-foreground">···</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem onClick={() => navigate(`/users/${u.id}`)}>
              <Eye className="mr-2 h-4 w-4 text-sky-600" />
              View profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {u.isAdmin ? (
              <DropdownMenuItem onClick={() => void toggleAdmin(u)}>
                <ShieldOff className="mr-2 h-4 w-4 text-amber-600" />
                Remove admin
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => void toggleAdmin(u)}>
                <ShieldCheck className="mr-2 h-4 w-4 text-teal-600" />
                Grant admin
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {u.isSuspended ? (
              <DropdownMenuItem onClick={() => void toggleSuspended(u)}>
                <Undo2 className="mr-2 h-4 w-4 text-emerald-600" />
                Reinstate user
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => void toggleSuspended(u)} className="focus:text-rose-600">
                <Ban className="mr-2 h-4 w-4 text-rose-600" />
                Suspend user
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage accounts and admin access"
        actions={
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 bg-black/[0.03] pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="glass flex min-h-[16rem] items-center justify-center rounded-2xl">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          loading={false}
          empty={`No users match${query ? ` "${query}"` : ""}.`}
        />
      )}
    </div>
  );
}
