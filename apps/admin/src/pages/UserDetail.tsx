import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Ban,
  Building2,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchUserDetail,
  setUserAdmin,
  setUserSuspended,
  type AdminUserDetail,
} from "@housemates/shared-supabase";
import { getSchool } from "@housemates/shared-data";
import { formatPrice, initials, roomTypeLabel, statusLabel, timeAgo } from "@housemates/shared-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@housemates/shared-ui/avatar";
import { Button } from "@housemates/shared-ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { PageHeader } from "@/components/PageHeader";

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/5">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 leading-tight">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate font-medium text-foreground">{value}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border/60 bg-black/[0.02] px-3 py-3 text-center">
      <p className="text-lg font-semibold text-foreground">{value.toLocaleString()}</p>
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      setDetail(await fetchUserDetail(id));
    } catch {
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const applyToggle = async (
    fn: (userId: string, value: boolean) => Promise<void>,
    value: boolean,
    patch: Partial<AdminUserDetail>,
    message: string,
  ) => {
    if (!detail) return;
    setBusy(true);
    try {
      await fn(detail.id, value);
      setDetail((prev) => (prev ? { ...prev, ...patch } : prev));
      toast.success(message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[20rem] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div>
        <PageHeader
          title="User profile"
          description="Couldn't find this user, or you don't have access."
          actions={
            <Button variant="outline" size="sm" onClick={() => navigate("/users")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to users
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={detail.fullName || "User profile"}
        description={`Profile and listings for ${detail.email || "this user"}`}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => navigate("/users")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </>
        }
      />

      <div className="rounded-3xl border border-border/60 bg-card/40 p-6 shadow-card">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Avatar className="h-16 w-16">
            {detail.avatarUrl ? <AvatarImage src={detail.avatarUrl} alt={detail.fullName} /> : null}
            <AvatarFallback className="bg-gradient-to-br from-teal-500 to-coral-deep text-lg text-white">
              {initials(detail.fullName) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold text-foreground">{detail.fullName || "—"}</h2>
              {detail.isAdmin ? <StatusBadge tone="admin">Admin</StatusBadge> : null}
              {detail.isSuspended ? (
                <StatusBadge tone="suspended">Suspended</StatusBadge>
              ) : (
                <StatusBadge tone="available">Active</StatusBadge>
              )}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Joined {timeAgo(detail.joinedAt)}</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoRow icon={Mail} label="Email" value={detail.email || "No email on file"} />
              <InfoRow icon={Phone} label="Phone" value={detail.phone || "—"} />
              <InfoRow icon={MessageSquare} label="WhatsApp" value={detail.whatsapp || "—"} />
              <InfoRow
                icon={MapPin}
                label="School"
                value={detail.schoolId ? getSchool(detail.schoolId)?.name ?? detail.schoolId : "—"}
              />
            </div>
            {detail.bio ? (
              <p className="mt-4 rounded-xl bg-black/[0.02] px-3 py-2.5 text-sm text-muted-foreground">
                {detail.bio}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <StatCard label="Listings" value={detail.listingCount} />
          <StatCard label="Chats" value={detail.conversationsCount} />
          <StatCard label="Saved" value={detail.savedCount} />
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-border/60 pt-5 sm:flex-row sm:justify-end">
          {detail.isAdmin ? (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void applyToggle(setUserAdmin, false, { isAdmin: false }, `Admin rights removed from ${detail.fullName}`)}
            >
              <ShieldOff className="mr-2 h-4 w-4 text-amber-600" />
              Remove admin
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void applyToggle(setUserAdmin, true, { isAdmin: true }, `${detail.fullName} is now an admin`)}
            >
              <ShieldCheck className="mr-2 h-4 w-4 text-teal-600" />
              Grant admin
            </Button>
          )}
          {detail.isSuspended ? (
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void applyToggle(setUserSuspended, false, { isSuspended: false }, `${detail.fullName} reinstated`)}
            >
              <Undo2 className="mr-2 h-4 w-4 text-emerald-600" />
              Reinstate user
            </Button>
          ) : (
            <Button
              variant="destructive"
              disabled={busy}
              onClick={() => void applyToggle(setUserSuspended, true, { isSuspended: true }, `${detail.fullName} suspended`)}
            >
              <Ban className="mr-2 h-4 w-4" />
              Suspend user
            </Button>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Listings <span className="text-sm font-normal text-muted-foreground">({detail.listings.length})</span>
        </h2>
        {detail.listings.length === 0 ? (
          <div className="glass flex min-h-[10rem] items-center justify-center rounded-2xl text-sm text-muted-foreground">
            This user hasn't posted any listings yet.
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {detail.listings.map((l) => {
              const photo = l.photos[0]?.url;
              return (
                <li
                  key={l.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-white transition-colors shadow-card hover:border-teal-500/40"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {photo ? (
                      <img src={photo} alt={l.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-teal-500/10 to-coral/10">
                        <Building2 className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="absolute right-2 top-2">
                      <StatusBadge tone={l.status}>{statusLabel(l.status)}</StatusBadge>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="line-clamp-1 font-medium text-foreground">{l.title}</h3>
                      <a
                        href={`https://housemates.ng/listings/${l.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="shrink-0 text-muted-foreground transition-colors hover:text-teal-600"
                        title="View on the public site"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                    <p className="text-sm font-semibold text-teal-700">{formatPrice(l.price, l.pricePeriod)}</p>
                    <p className="text-xs text-muted-foreground">
                      {roomTypeLabel(l.roomType)} · {getSchool(l.schoolId)?.name ?? l.schoolId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {l.area || l.lga}, {l.state} · posted {timeAgo(l.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
