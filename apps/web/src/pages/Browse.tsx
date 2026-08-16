import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Search, X, MapPin, School as SchoolIcon } from "lucide-react";
import { LISTING_PAGE_SIZE, useApp } from "@/lib/store";
import { Input } from "@housemates/shared-ui/input";
import { Button } from "@housemates/shared-ui/button";
import { Skeleton } from "@housemates/shared-ui/skeleton";
import { ListingCard } from "@/components/housemate/ListingCard";
import { FilterBar, FilterSheet } from "@/components/housemate/FilterBar";
import { DEFAULT_FILTERS, type FilterValue } from "@housemates/shared-utils";
import type { GenderPreference, Listing, ListingFilters, ListingStatus, PricePeriod, RoomType } from "@housemates/shared-types";

export default function Browse() {
  const { fetchListings, getSchool, currentUser, authReady, listingsLoading, savedListings } = useApp();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [results, setResults] = useState<Listing[]>([]);
  const [total, setTotal] = useState(0);

  const schoolId = params.get("school") ?? "";
  const state = params.get("state") ?? "";
  const lga = params.get("lga") ?? "";
  const q = params.get("q") ?? "";
  const page = Math.max(1, Number(params.get("page") ?? "1") || 1);
  const roomsParam = params.get("rooms") ?? "";
  const roomTypes = roomsParam.split(",").filter(Boolean) as RoomType[];
  const gender = (params.get("gender") as GenderPreference | null) ?? "any";
  const pricePeriod = (params.get("period") as PricePeriod | null) ?? "any";
  const maxPrice = params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined;
  const statusParam = params.get("status");
  const status: ListingStatus | "any" = statusParam === null ? "available" : statusParam === "all" ? "any" : (statusParam as ListingStatus);
  const savedOnly = params.get("saved") === "1";

  const [qInput, setQInput] = useState(q);
  useEffect(() => {
    setQInput(q);
  }, [q]);

  const filterValue: FilterValue = { roomTypes, gender, pricePeriod, maxPrice, status, savedOnly };

  const setParamsResetPage = (next: URLSearchParams) => {
    next.delete("page");
    setParams(next, { replace: true });
  };

  const update = (v: FilterValue) => {
    if (v.savedOnly && !currentUser) { navigate("/login"); return; }
    const next = new URLSearchParams(params);
    const setOrDel = (key: string, val: string) => { if (val) next.set(key, val); else next.delete(key); };
    setOrDel("rooms", v.roomTypes.join(","));
    setOrDel("gender", v.gender === "any" ? "" : v.gender);
    setOrDel("period", v.pricePeriod === "any" ? "" : v.pricePeriod);
    setOrDel("maxPrice", v.maxPrice ? String(v.maxPrice) : "");
    next.set("status", v.status === "any" ? "all" : v.status);
    if (v.savedOnly) next.set("saved", "1"); else next.delete("saved");
    setParamsResetPage(next);
  };

  const setQ = (value: string) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set("q", value);
      else next.delete("q");
      next.delete("page");
      return next;
    }, { replace: true });
  };

  useEffect(() => {
    const t = window.setTimeout(() => {
      if (qInput !== q) setQ(qInput);
    }, 300);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qInput, q]);

  const clearParam = (key: string) => {
    const next = new URLSearchParams(params);
    next.delete(key);
    if (key === "state") next.delete("lga");
    setParamsResetPage(next);
  };
  const clearAll = () => setParams(new URLSearchParams(), { replace: true });

  const setPage = (nextPage: number) => {
    const next = new URLSearchParams(params);
    if (nextPage <= 1) next.delete("page");
    else next.set("page", String(nextPage));
    setParams(next, { replace: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filters = useMemo<ListingFilters>(
    () => ({
      q,
      schoolId,
      state,
      lga,
      roomTypes,
      gender,
      maxPrice,
      pricePeriod,
      status: status === "any" ? undefined : status,
      savedOnly,
    }),
    [q, schoolId, state, lga, roomTypes, gender, maxPrice, pricePeriod, status, savedOnly],
  );

  useEffect(() => {
    if (savedOnly && !authReady) return;
    let cancelled = false;
    void fetchListings(filters, page, LISTING_PAGE_SIZE).then((res) => {
      if (cancelled) return;
      setResults(res.items);
      setTotal(res.total);
    });
    return () => {
      cancelled = true;
    };
  }, [authReady, fetchListings, filters, page, savedOnly, savedListings]);

  const school = schoolId ? getSchool(schoolId) : undefined;
  const hasContext = Boolean(schoolId || state || lga || q);
  const totalPages = Math.max(1, Math.ceil(total / LISTING_PAGE_SIZE));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl font-bold sm:text-3xl">Browse spaces</h1>
        <p className="mt-1 text-sm text-muted-foreground">Find a lodge near your campus or in a specific area.</p>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={qInput} onChange={(e) => setQInput(e.target.value)} placeholder="Search by title, area, school…" className="h-11 pl-9" />
        </div>
        {hasContext && (<Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground"><X className="h-4 w-4" />Clear all</Button>)}
      </div>
      {(school || state || lga) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {school && (<ContextChip icon={<SchoolIcon className="h-3.5 w-3.5" />} label={school.name} onClear={() => clearParam("school")} />)}
          {state && (<ContextChip icon={<MapPin className="h-3.5 w-3.5" />} label={lga ? `${lga}, ${state}` : state} onClear={() => clearParam("state")} />)}
        </div>
      )}
      <FilterBar value={filterValue} onChange={update} onOpenSheet={() => setSheetOpen(true)} resultCount={total} />
      <FilterSheet open={sheetOpen} onOpenChange={setSheetOpen} value={filterValue} onChange={update} />
      {listingsLoading && results.length === 0 ? (
        <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ListingSkeleton key={i} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-20 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground"><Search className="h-6 w-6" /></div>
          <h3 className="mt-4 text-lg font-semibold">No spaces found</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Try adjusting your filters or broadening your search area.</p>
          <Button variant="outline" size="sm" className="mt-5" onClick={() => { update({ ...DEFAULT_FILTERS }); clearAll(); }}>Reset filters</Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((l) => (<ListingCard key={l.id} listing={l} showStatus />))}
          </div>
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" disabled={page <= 1 || listingsLoading} onClick={() => setPage(page - 1)}>
                <ChevronLeft className="h-4 w-4" />Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages || listingsLoading} onClick={() => setPage(page + 1)}>
                Next<ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ListingSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[4/3] rounded-2xl" />
      <Skeleton className="mt-3 h-4 w-3/4" />
      <Skeleton className="mt-2 h-3 w-1/2" />
    </div>
  );
}

function ContextChip({ icon, label, onClear }: { icon: React.ReactNode; label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary py-1.5 pl-3.5 pr-2 text-xs font-medium text-secondary-foreground">
      <span className="text-primary">{icon}</span>{label}
      <button type="button" onClick={onClear} className="grid h-5 w-5 place-items-center rounded-full hover:bg-foreground/10" aria-label="Remove filter"><X className="h-3 w-3" /></button>
    </span>
  );
}
