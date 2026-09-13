import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, School as SchoolIcon, MapPin, ChevronRight } from "lucide-react";
import { Button } from "@housemates/shared-ui/button";
import { Input } from "@housemates/shared-ui/input";
import { Label } from "@housemates/shared-ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@housemates/shared-ui/select";
import { searchSchools } from "@housemates/shared-data";
import { lgasForState, stateNames } from "@housemates/shared-data";
import { cn } from "@housemates/shared-utils";
import type { School } from "@housemates/shared-types";

type Mode = "school" | "location";

export function SchoolStateSearch() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("school");
  const [schoolQuery, setSchoolQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [open, setOpen] = useState(false);
  const matches = useMemo(() => (open ? searchSchools(schoolQuery, 8) : []), [schoolQuery, open]);
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");

  const submitSchool = () => {
    if (!selectedSchool) return;
    navigate(`/browse?school=${encodeURIComponent(selectedSchool.id)}`);
  };
  const submitLocation = () => {
    const params = new URLSearchParams();
    if (state) params.set("state", state);
    if (lga) params.set("lga", lga);
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <div className="w-full rounded-3xl glass-strong p-2">
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1">
        {([
          { id: "school", label: "By School", icon: SchoolIcon },
          { id: "location", label: "By State & LGA", icon: MapPin },
        ] as const).map((tab) => (
          <button key={tab.id} type="button" onClick={() => setMode(tab.id)} className={cn("inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all", mode === tab.id ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground")}>
            <tab.icon className="h-4 w-4" />{tab.label}
          </button>
        ))}
      </div>
      <div className="p-3">
        {mode === "school" ? (
          <div className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={selectedSchool ? selectedSchool.name : schoolQuery}
                placeholder="Search your school — e.g. UNILAG, OAU…"
                className="h-12 rounded-xl border-border bg-background pl-9 pr-3"
                onChange={(e) => { setSchoolQuery(e.target.value); setSelectedSchool(null); setOpen(true); }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                onKeyDown={(e) => { if (e.key === "Enter") submitSchool(); }}
              />
              {open && matches.length > 0 && (
                <div role="listbox" aria-label="School matches" className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-border bg-popover p-1 shadow-elevated">
                  {matches.map((s) => (
                    <button key={s.id} type="button" role="option" aria-selected={selectedSchool?.id === s.id} onMouseDown={(e) => { e.preventDefault(); setSelectedSchool(s); setSchoolQuery(s.name); setOpen(false); }} className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-accent">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{s.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{s.state}</span>
                      </span>
                      <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase text-secondary-foreground">{s.acronym}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button size="lg" className="h-12 w-full bg-gradient-primary text-base shadow-glow" onClick={submitSchool} disabled={!selectedSchool}>
              Find spaces<ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">State</Label>
                <Select value={state} onValueChange={(v) => { setState(v); setLga(""); }}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select state" /></SelectTrigger>
                  <SelectContent className="max-h-72">{stateNames.map((s) => (<SelectItem key={s} value={s}>{s}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">LGA</Label>
                <Select value={lga} onValueChange={setLga} disabled={!state}>
                  <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder={state ? "Select LGA" : "Pick a state first"} /></SelectTrigger>
                  <SelectContent className="max-h-72">{lgasForState(state).map((l) => (<SelectItem key={l} value={l}>{l}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
            <Button size="lg" className="h-12 w-full bg-gradient-primary text-base shadow-glow" onClick={submitLocation} disabled={!state}>
              Find spaces<ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
        <button type="button" onClick={() => navigate("/browse")} className="mt-2 w-full text-center text-xs font-medium text-muted-foreground hover:text-primary">
          Or browse all available spaces →
        </button>
      </div>
    </div>
  );
}
