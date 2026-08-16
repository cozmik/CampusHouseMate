import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, Loader2, RefreshCw, Search } from "lucide-react";
import { toast } from "sonner";
import {
  fetchAllListings,
  updateListingStatus,
  type AdminListing,
} from "@housemates/shared-supabase";
import { getSchool } from "@housemates/shared-data";
import { formatPrice, timeAgo } from "@housemates/shared-utils";
import type { ListingStatus } from "@housemates/shared-types";
import { Button } from "@housemates/shared-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@housemates/shared-ui/dropdown-menu";
import { Input } from "@housemates/shared-ui/input";
import { DataTable, type Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";

const STATUS_OPTIONS: { value: ListingStatus; label: string; tone: Parameters<typeof StatusBadge>[0]["tone"] }[] = [
  { value: "available", label: "Available", tone: "available" },
  { value: "pending", label: "Pending", tone: "pending" },
  { value: "taken", label: "Taken", tone: "taken" },
];

function statusTone(status: ListingStatus) {
  return STATUS_OPTIONS.find((s) => s.value === status)?.tone ?? "muted";
}

export default function Listings() {
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setListings(await fetchAllListings());
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return listings;
    return listings.filter((l) => {
      const haystack = [l.title, l.owner?.fullName, getSchool(l.schoolId)?.name]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [listings, query]);

  const setStatus = async (listing: AdminListing, status: ListingStatus) => {
    setListings((prev) => prev.map((l) => (l.id === listing.id ? { ...l, status } : l)));
    await updateListingStatus(listing.id, status);
    toast.success(`Listing marked as ${status}`);
  };

  const columns: Column<AdminListing>[] = [
    {
      key: "listing",
      header: "Listing",
      render: (l) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-black/5">
            {l.photos[0] ? (
              <img src={l.photos[0].url} alt="" className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 leading-tight">
            <p className="max-w-[20rem] truncate font-medium text-foreground">{l.title}</p>
            <p className="text-xs text-muted-foreground">
              by {l.owner?.fullName || "unknown"}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "school",
      header: "School",
      render: (l) => (
        <span className="text-muted-foreground">{getSchool(l.schoolId)?.name ?? l.schoolId}</span>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (l) => <span className="font-medium">{formatPrice(l.price, l.pricePeriod)}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (l) => <StatusBadge tone={statusTone(l.status)}>{l.status}</StatusBadge>,
    },
    {
      key: "created",
      header: "Created",
      render: (l) => <span className="text-muted-foreground">{timeAgo(l.createdAt)}</span>,
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "w-12 text-right",
      render: (l) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <span className="sr-only">Actions</span>
              <span className="text-muted-foreground">···</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              Change status
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {STATUS_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => void setStatus(l, opt.value)}
                disabled={l.status === opt.value}
              >
                <span className="mr-2 h-2 w-2 rounded-full bg-current" />
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Listings"
        description="Review and moderate hostel listings"
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
            placeholder="Search listings"
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
          empty={`No listings match${query ? ` "${query}"` : ""}.`}
        />
      )}
    </div>
  );
}
