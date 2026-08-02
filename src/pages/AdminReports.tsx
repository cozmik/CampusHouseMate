import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Flag, Loader2, ExternalLink, RefreshCw } from "lucide-react";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Report, ReportStatus, ReportTargetType } from "@/lib/types";

const STATUS_STYLES: Record<ReportStatus, string> = {
  open: "bg-warning/15 text-warning",
  reviewing: "bg-info/15 text-info",
  resolved: "bg-success/15 text-success",
};

const TARGET_LABELS: Record<ReportTargetType, string> = {
  listing: "Listing",
  user: "User",
  conversation: "Conversation",
  general: "General",
};

type TabValue = "all" | ReportStatus;

export default function AdminReports() {
  const { fetchAllReports, updateReportStatus } = useApp();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabValue>("all");

  const load = async () => {
    setLoading(true);
    const data = await fetchAllReports();
    setReports(data);
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onStatusChange = async (id: string, status: ReportStatus) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    await updateReportStatus(id, status);
  };

  const filtered = tab === "all" ? reports : reports.filter((r) => r.status === tab);
  const counts = {
    all: reports.length,
    open: reports.filter((r) => r.status === "open").length,
    reviewing: reports.filter((r) => r.status === "reviewing").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-3 sm:mb-8">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review complaints and issues submitted by users.</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="text-xs sm:text-sm">All<span className="ml-1 text-muted-foreground">{counts.all}</span></TabsTrigger>
          <TabsTrigger value="open" className="text-xs sm:text-sm">Open<span className="ml-1 text-muted-foreground">{counts.open}</span></TabsTrigger>
          <TabsTrigger value="reviewing" className="text-xs sm:text-sm">Reviewing<span className="ml-1 text-muted-foreground">{counts.reviewing}</span></TabsTrigger>
          <TabsTrigger value="resolved" className="text-xs sm:text-sm">Resolved<span className="ml-1 text-muted-foreground">{counts.resolved}</span></TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-6">
          {loading ? (
            <div className="grid place-items-center py-20 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-20 text-center">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground"><Flag className="h-6 w-6" /></div>
              <h3 className="mt-4 text-lg font-semibold">No reports here</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">Nothing to review in this category.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((r) => (
                <ReportRow key={r.id} report={r} onStatusChange={onStatusChange} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReportRow({
  report,
  onStatusChange,
}: {
  report: Report;
  onStatusChange: (id: string, status: ReportStatus) => void;
}) {
  const { getProfile, getListing } = useApp();
  const reporter = getProfile(report.reporterId);
  const targetListing =
    report.targetType === "listing" && report.targetId ? getListing(report.targetId) : undefined;
  const targetUser =
    report.targetType === "user" && report.targetId ? getProfile(report.targetId) : undefined;

  return (
    <div className="rounded-2xl bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
            {TARGET_LABELS[report.targetType]}
          </span>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {report.category}
          </span>
          <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold capitalize", STATUS_STYLES[report.status])}>
            {report.status}
          </span>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(report.createdAt)}</span>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{report.message}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-3">
        <div className="text-xs text-muted-foreground">
          Reported by <span className="font-medium text-foreground">{reporter?.fullName ?? "Unknown"}</span>
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
        <Select value={report.status} onValueChange={(v) => onStatusChange(report.id, v as ReportStatus)}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="reviewing">Reviewing</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
