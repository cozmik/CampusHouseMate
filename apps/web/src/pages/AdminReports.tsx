import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flag, Loader2, ExternalLink, RefreshCw, Check, Undo2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@housemates/shared-ui/button";
import { timeAgo } from "@housemates/shared-utils";
import { cn } from "@housemates/shared-utils";
import type { Report, ReportTargetType } from "@housemates/shared-types";

const TARGET_LABELS: Record<ReportTargetType, string> = {
  listing: "Listing",
  user: "User",
  conversation: "Conversation",
  general: "General",
};

export default function AdminReports() {
  const { fetchAllReports, updateReportStatus } = useApp();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setReports(await fetchAllReports());
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleResolved = async (report: Report) => {
    const next = report.status === "resolved" ? "open" : "resolved";
    setReports((prev) => prev.map((r) => (r.id === report.id ? { ...r, status: next } : r)));
    await updateReportStatus(report.id, next);
  };

  const sorted = [...reports].sort((a, b) => {
    const aResolved = a.status === "resolved" ? 1 : 0;
    const bResolved = b.status === "resolved" ? 1 : 0;
    if (aResolved !== bResolved) return aResolved - bResolved;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const openCount = reports.filter((r) => r.status !== "resolved").length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3 sm:mb-8">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loading ? "Loading…" : `${openCount} unresolved · ${reports.length} total`}
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={() => void load()} disabled={loading} aria-label="Refresh">
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      {loading ? (
        <div className="grid place-items-center py-20 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-20 text-center">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
            <Flag className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No reports yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">Submitted reports will show up here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((r) => (
            <ReportRow key={r.id} report={r} onToggle={toggleResolved} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReportRow({
  report,
  onToggle,
}: {
  report: Report;
  onToggle: (report: Report) => void;
}) {
  const { getProfile, getListing, fetchListingById } = useApp();
  const reporter = getProfile(report.reporterId);
  const resolved = report.status === "resolved";
  const targetListing =
    report.targetType === "listing" && report.targetId ? getListing(report.targetId) : undefined;
  const targetUser =
    report.targetType === "user" && report.targetId ? getProfile(report.targetId) : undefined;

  useEffect(() => {
    if (report.targetType !== "listing" || !report.targetId || targetListing) return;
    void fetchListingById(report.targetId);
  }, [report.targetId, report.targetType, targetListing, fetchListingById]);

  return (
    <div className={cn("rounded-2xl bg-card p-5 shadow-card transition-opacity", resolved && "opacity-60")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
            {TARGET_LABELS[report.targetType]}
          </span>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {report.category}
          </span>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(report.createdAt)}</span>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{report.message}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
        <div className="text-xs text-muted-foreground">
          By <span className="font-medium text-foreground">{reporter?.fullName ?? "Unknown"}</span>
          {targetListing && (
            <>
              {" "}
              ·{" "}
              <Link
                to={`/listings/${targetListing.id}`}
                className="inline-flex items-center gap-0.5 font-medium text-primary hover:underline"
              >
                {targetListing.title}
                <ExternalLink className="h-3 w-3" />
              </Link>
            </>
          )}
          {targetUser && (
            <>
              {" "}
              · about <span className="font-medium text-foreground">{targetUser.fullName}</span>
            </>
          )}
        </div>
        <Button size="sm" variant={resolved ? "outline" : "default"} onClick={() => onToggle(report)}>
          {resolved ? (
            <>
              <Undo2 className="h-3.5 w-3.5" />
              Reopen
            </>
          ) : (
            <>
              <Check className="h-3.5 w-3.5" />
              Resolve
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
