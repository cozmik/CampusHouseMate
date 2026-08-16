import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@housemates/shared-utils";

export interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  delta?: number;
  deltaLabel?: string;
  hint?: string;
  accent?: "teal" | "coral" | "emerald" | "amber" | "rose" | "sky";
}

const ACCENTS: Record<NonNullable<KpiCardProps["accent"]>, { bg: string; icon: string }> = {
  teal: { bg: "from-teal-500/20 to-teal-500/0", icon: "text-teal-700" },
  coral: { bg: "from-coral/25 to-coral/0", icon: "text-coral-deep" },
  emerald: { bg: "from-emerald-500/25 to-emerald-500/0", icon: "text-emerald-600" },
  amber: { bg: "from-amber-500/25 to-amber-500/0", icon: "text-amber-600" },
  rose: { bg: "from-rose-500/25 to-rose-500/0", icon: "text-rose-600" },
  sky: { bg: "from-sky-500/25 to-sky-500/0", icon: "text-sky-600" },
};

const DELTA_STYLES = {
  up: "bg-emerald-500/10 text-emerald-600",
  down: "bg-rose-500/10 text-rose-600",
};

export function KpiCard({ label, value, icon: Icon, delta, deltaLabel, hint, accent = "teal" }: KpiCardProps) {
  const positive = delta === undefined ? true : delta >= 0;
  const showDelta = delta !== undefined && deltaLabel !== undefined;

  return (
    <div className="glass card-glow group relative rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-0.5">
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-2xl bg-gradient-to-b",
          ACCENTS[accent].bg,
        )}
      />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl bg-black/5 transition-transform duration-300 group-hover:scale-110",
              ACCENTS[accent].icon,
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <p className="mt-4 font-display text-3xl font-semibold tracking-tight">{value}</p>
        <div className="mt-3 flex items-center gap-2">
          {showDelta ? (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
                DELTA_STYLES[positive ? "up" : "down"],
              )}
            >
              {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(delta)}%
            </span>
          ) : null}
          {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
        </div>
      </div>
    </div>
  );
}
