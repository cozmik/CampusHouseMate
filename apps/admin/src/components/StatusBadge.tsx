import { cn } from "@housemates/shared-utils";

export type StatusTone =
  | "available"
  | "pending"
  | "taken"
  | "open"
  | "reviewing"
  | "resolved"
  | "admin"
  | "user"
  | "suspended"
  | "muted";

const TONES: Record<StatusTone, string> = {
  available: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25",
  pending: "bg-amber-500/10 text-amber-700 ring-amber-500/25",
  taken: "bg-slate-500/10 text-slate-600 ring-slate-500/25",
  open: "bg-rose-500/10 text-rose-700 ring-rose-500/25",
  reviewing: "bg-amber-500/10 text-amber-700 ring-amber-500/25",
  resolved: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25",
  admin: "bg-teal-500/10 text-teal-700 ring-teal-500/25",
  user: "bg-zinc-500/10 text-zinc-600 ring-zinc-500/25",
  suspended: "bg-rose-500/10 text-rose-700 ring-rose-500/25",
  muted: "bg-zinc-500/10 text-zinc-600 ring-zinc-500/25",
};

export function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: StatusTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        TONES[tone],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {children}
    </span>
  );
}
