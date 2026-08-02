import { SlidersHorizontal, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { ROOM_TYPES, PRICE_PERIODS, roomTypeLabel, periodLabelLong } from "@/lib/format";
import { DEFAULT_FILTERS, countActiveFilters, type FilterValue } from "@/lib/filters";
import { cn } from "@/lib/utils";
import type { GenderPreference, ListingStatus, PricePeriod, RoomType } from "@/lib/types";

function FiltersForm({ value, onChange }: { value: FilterValue; onChange: (v: FilterValue) => void }) {
  const toggleRoom = (r: RoomType) => {
    const next = value.roomTypes.includes(r) ? value.roomTypes.filter((x) => x !== r) : [...value.roomTypes, r];
    onChange({ ...value, roomTypes: next });
  };
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Room type</Label>
        <div className="flex flex-wrap gap-2">
          {ROOM_TYPES.map((r) => {
            const active = value.roomTypes.includes(r);
            return (
              <button key={r} type="button" onClick={() => toggleRoom(r)} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors", active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground")}>
                {active && <Check className="h-3 w-3" />}{roomTypeLabel(r)}
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Gender</Label>
          <Select value={value.gender} onValueChange={(v) => onChange({ ...value, gender: v as GenderPreference | "any" })}>
            <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any gender</SelectItem>
              <SelectItem value="male">Male only</SelectItem>
              <SelectItem value="female">Female only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Billing</Label>
          <Select value={value.pricePeriod} onValueChange={(v) => onChange({ ...value, pricePeriod: v as PricePeriod | "any" })}>
            <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any period</SelectItem>
              {PRICE_PERIODS.map((p) => (<SelectItem key={p} value={p}>{periodLabelLong(p)}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Max price (₦)</Label>
        <Input type="number" inputMode="numeric" min={0} step={5000} placeholder="No limit" value={value.maxPrice ?? ""} onChange={(e) => onChange({ ...value, maxPrice: e.target.value ? Number(e.target.value) : undefined })} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Availability</Label>
        <Select value={value.status} onValueChange={(v) => onChange({ ...value, status: v as ListingStatus | "any" })}>
          <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="taken">Taken</SelectItem>
            <SelectItem value="any">Any status</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 px-3 py-3">
        <div>
          <p className="text-sm font-medium">Saved only</p>
          <p className="text-xs text-muted-foreground">Show listings you bookmarked</p>
        </div>
        <Switch checked={value.savedOnly} onCheckedChange={(c) => onChange({ ...value, savedOnly: c })} />
      </div>
    </div>
  );
}

export function FilterSheet({ open, onOpenChange, value, onChange }: { open: boolean; onOpenChange: (v: boolean) => void; value: FilterValue; onChange: (v: FilterValue) => void }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="flex max-h-[85vh] flex-col">
        <SheetHeader><SheetTitle>Filter spaces</SheetTitle></SheetHeader>
        <div className="flex-1 overflow-y-auto py-4"><FiltersForm value={value} onChange={onChange} /></div>
        <SheetFooter className="flex-row gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onChange({ ...DEFAULT_FILTERS })}>Reset</Button>
          <Button className="flex-1" onClick={() => onOpenChange(false)}>Show results</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function FilterBar({ value, onChange, onOpenSheet, resultCount }: { value: FilterValue; onChange: (v: FilterValue) => void; onOpenSheet: () => void; resultCount: number }) {
  const active = countActiveFilters(value);
  return (
    <div className="sticky top-16 z-30 -mx-4 mb-4 border-b border-border/70 bg-background/90 px-4 py-3 backdrop-blur-md md:mx-0 md:rounded-2xl md:border md:bg-card md:px-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold">{resultCount} {resultCount === 1 ? "space" : "spaces"}</p>
          {active > 0 && <Badge className="bg-primary/10 text-primary">{active} filters</Badge>}
        </div>
        <Button variant="outline" size="sm" onClick={onOpenSheet} className="md:hidden">
          <SlidersHorizontal className="h-4 w-4" />Filters
          {active > 0 && <span className="ml-1 grid h-4 w-4 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">{active}</span>}
        </Button>
      </div>
      <div className="mt-3 hidden gap-3 md:flex md:flex-wrap md:items-end">
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-muted-foreground">Room</Label>
          <Select value={value.roomTypes[0] ?? "any"} onValueChange={(v) => onChange({ ...value, roomTypes: v === "any" ? [] : [v as RoomType] })}>
            <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Any" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any room</SelectItem>
              {ROOM_TYPES.map((r) => (<SelectItem key={r} value={r}>{roomTypeLabel(r)}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-muted-foreground">Gender</Label>
          <Select value={value.gender} onValueChange={(v) => onChange({ ...value, gender: v as GenderPreference | "any" })}>
            <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="any">Any</SelectItem><SelectItem value="male">Male only</SelectItem><SelectItem value="female">Female only</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-muted-foreground">Billing</Label>
          <Select value={value.pricePeriod} onValueChange={(v) => onChange({ ...value, pricePeriod: v as PricePeriod | "any" })}>
            <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="any">Any</SelectItem>{PRICE_PERIODS.map((p) => (<SelectItem key={p} value={p}>{periodLabelLong(p)}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-muted-foreground">Status</Label>
          <Select value={value.status} onValueChange={(v) => onChange({ ...value, status: v as ListingStatus | "any" })}>
            <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="available">Available</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="taken">Taken</SelectItem><SelectItem value="any">Any</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase text-muted-foreground">Max ₦</Label>
          <Input type="number" min={0} step={5000} placeholder="No limit" value={value.maxPrice ?? ""} onChange={(e) => onChange({ ...value, maxPrice: e.target.value ? Number(e.target.value) : undefined })} className="h-9 w-32" />
        </div>
        <div className="flex items-center gap-2 pb-1.5">
          <Switch id="saved-only-desktop" checked={value.savedOnly} onCheckedChange={(c) => onChange({ ...value, savedOnly: c })} />
          <Label htmlFor="saved-only-desktop" className="text-xs">Saved</Label>
        </div>
        {active > 0 && (
          <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => onChange({ ...DEFAULT_FILTERS })}>
            <X className="h-4 w-4" />Clear
          </Button>
        )}
      </div>
    </div>
  );
}
