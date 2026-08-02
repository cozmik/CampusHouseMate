import { cn } from "@/lib/utils";
import { statusLabel } from "@/lib/format";
import type { ListingStatus } from "@/lib/types";

const styles: Record<ListingStatus, { dot: string; pill: string }> = {
  available: { dot: "bg-status-available", pill: "bg-status-available-soft text-status-available-foreground" },
  pending: { dot: "bg-status-pending", pill: "bg-status-pending-soft text-status-pending-foreground" },
  taken: { dot: "bg-status-taken", pill: "bg-status-taken-soft text-status-taken-foreground" },
};

export function StatusBadge({ status, className }: { status: ListingStatus; className?: string }) {
  const s = styles[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", s.pill, className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {statusLabel(status)}
    </span>
  );
}
