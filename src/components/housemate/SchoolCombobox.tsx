import { useState } from "react";
import { Search, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchSchools, getSchool, schoolsForState } from "@/data/schools";
import { schoolTypeLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

export function SchoolCombobox({
  value,
  onChange,
  error,
  stateFilter,
}: {
  value: string;
  onChange: (id: string) => void;
  error?: string;
  /** When provided, only schools in this state are shown/searched. */
  stateFilter?: string;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const selected = getSchool(value);
  const disabled = stateFilter !== undefined && !stateFilter;
  const pool = stateFilter ? schoolsForState(stateFilter) : undefined;
  const matches = open && !disabled
    ? query.trim()
      ? searchSchools(query, 10, pool)
      : (pool ?? []).slice(0, 10)
    : [];

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={selected ? selected.name : query}
        placeholder={disabled ? "Pick a state first" : "Search your school…"}
        disabled={disabled}
        className={cn("pl-9", error && "border-destructive")}
        onChange={(e) => { setQuery(e.target.value); onChange(""); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
      />
      {open && matches.length > 0 && (
        <div className="absolute z-20 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-border bg-popover p-1 shadow-elevated">
          {matches.map((s) => (
            <button key={s.id} type="button" onMouseDown={(e) => { e.preventDefault(); onChange(s.id); setQuery(""); setOpen(false); }} className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-accent">
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{s.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{s.state} · {schoolTypeLabel(s.type)}</span>
              </span>
              {s.id === value && <Check className="h-4 w-4 shrink-0 text-primary" />}
            </button>
          ))}
        </div>
      )}
      {open && !disabled && query.trim() === "" && pool && pool.length === 0 && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-border bg-popover p-3 text-xs text-muted-foreground shadow-elevated">
          No schools listed in {stateFilter} yet.
        </div>
      )}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
