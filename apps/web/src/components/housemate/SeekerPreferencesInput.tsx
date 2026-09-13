import { Check, Sparkles } from "lucide-react";
import { Textarea } from "@housemates/shared-ui/textarea";
import { Label } from "@housemates/shared-ui/label";
import { cn } from "@housemates/shared-utils";
import type { SeekerPreferences } from "@housemates/shared-types";

const PREFERENCE_TAGS = [
  "Non-smoker", "No pets", "Tidy", "Quiet hours", "Serious student",
  "Same religion", "No overnight guests", "Vegetarian", "Early riser", "Party-friendly",
];

export function SeekerPreferencesInput({ value, onChange }: { value: SeekerPreferences; onChange: (value: SeekerPreferences) => void }) {
  const tags = value.tags ?? [];
  const note = value.note ?? "";
  const toggle = (tag: string) => {
    const next = tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag];
    onChange({ tags: next, note: note || undefined });
  };
  return (
    <div className="space-y-3 rounded-2xl border border-border bg-secondary/40 p-4">
      <div className="flex items-start gap-2">
        <span className="mt-0.5 grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary"><Sparkles className="h-4 w-4" /></span>
        <div>
          <Label className="text-sm font-semibold">Preferences for seekers</Label>
          <p className="text-xs text-muted-foreground">Optional — let seekers know what you'd prefer in a handover.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {PREFERENCE_TAGS.map((tag) => {
          const active = tags.includes(tag);
          return (
            <button key={tag} type="button" onClick={() => toggle(tag)} className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors", active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground")}>
              {active && <Check className="h-3 w-3" />}{tag}
            </button>
          );
        })}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="pref-note" className="text-xs text-muted-foreground">Additional note (optional)</Label>
        <Textarea id="pref-note" rows={2} placeholder="e.g. I'd prefer a final-year student who is calm and tidy." value={note} onChange={(e) => onChange({ tags, note: e.target.value || undefined })} />
      </div>
    </div>
  );
}
