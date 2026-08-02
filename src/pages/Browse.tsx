import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, X, MapPin, School as SchoolIcon } from "lucide-react";
import { useApp } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/housemate/ListingCard";
import { FilterBar, FilterSheet } from "@/components/housemate/FilterBar";
import { DEFAULT_FILTERS, type FilterValue } from "@/lib/filters";
import type { GenderPreference, ListingStatus, PricePeriod, RoomType } from "@/lib/types";

export default function Browse() {
  const { filterListings, getSchool, currentUser } = useApp();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);

  const schoolId = params.get("school") ?? "";
  const state = params.get("state") ?? "";
  const lga = params.get("lga") ?? "";
  const q = params.get("q") ?? "";
  const roomTypes = (params.get("rooms") ?? "").split(",").filter(Boolean) as RoomType[];
  const gender = (params.get("gender") as GenderPreference | null) ?? "any";
  const pricePeriod = (params.get("period") as PricePeriod | null) ?? "any";
  const maxPrice = params.get("maxPrice") ? Number(params.get("maxPrice")) : undefined;
  const statusParam = params.get("status");
  const status: ListingStatus | "any" = statusParam === null ? "available" : statusParam === "all" ? "any" : (statusParam as ListingStatus);
  const savedOnly = params.get("saved") === "1";

  const filterValue: FilterValue = { roomTypes, gender, pricePeriod, maxPrice, status, savedOnly };

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
    setParams(next, { replace: true });
  };

  const setQ = (value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set("q", value); else next.delete("q");
    setParams(next, { replace: true });
  };
  const clearParam = (key: string) => {
    const next = new URLSearchParams(params);
    next.delete(key);
    if (key === "state") next.delete("lga");
    setParams(next, { replace: true });
  };
  const clearAll = () => setParams(new URLSearchParams(), { replace: true });

  const results = filterListings({ q, schoolId, state, lga, roomTypes, gender, maxPrice, pricePeriod, status: status === "any" ? undefined : status, savedOnly }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const school = schoolId ? getSchool(schoolId) : undefined;
  const hasContext = Boolean(schoolId || state || lga || q);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Browse spaces</h1>
        <p className="text-sm text-muted-foreground">Find a lodge near your campus or in a specific area.</p>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, area, school…" className="h-10 pl-9" />
        </div>
        {hasContext && (<Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground"><X className="h-4 w-4" />Clear all</Button>)}
      </div>
      {(school || state || lga) && (
        <div className="mb-3 flex flex-wrap gap-2">
          {school && (<ContextChip icon={<SchoolIcon className="h-3.5 w-3.5" />} label={school.name} onClear={() => clearParam("school")} />)}
          {state && (<ContextChip icon={<MapPin className="h-3.5 w-3.5" />} label={lga ? `${lga}, ${state}` : state} onClear={() => clearParam("state")} />)}
        </div>
      )}
      <FilterBar value={filterValue} onChange={update} onOpenSheet={() => setSheetOpen(true)} resultCount={results.length} />
      <FilterSheet open={sheetOpen} onOpenChange={setSheetOpen} value={filterValue} onChange={update} />
      {results.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-16 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground"><Search className="h-6 w-6" /></div>
          <h3 className="mt-4 text-lg font-semibold">No spaces found</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Try adjusting your filters or broadening your search area.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => { update({ ...DEFAULT_FILTERS }); clearAll(); }}>Reset filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((l) => (<ListingCard key={l.id} listing={l} showStatus />))}
        </div>
      )}
    </div>
  );
}

function ContextChip({ icon, label, onClear }: { icon: React.ReactNode; label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card py-1 pl-3 pr-1.5 text-xs font-medium shadow-card">
      <span className="text-primary">{icon}</span>{label}
      <button type="button" onClick={onClear} className="grid h-5 w-5 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Remove filter"><X className="h-3 w-3" /></button>
    </span>
  );
}
