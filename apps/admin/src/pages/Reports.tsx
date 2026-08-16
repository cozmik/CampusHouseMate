import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { fetchAllReports, updateReportStatus } from "@housemates/shared-supabase";
import { timeAgo } from "@housemates/shared-utils";
import type { Report, ReportStatus } from "@housemates/shared-types";
import { Badge } from "@housemates/shared-ui/badge";
import { Button } from "@housemates/shared-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@housemates/shared-ui/dropdown-menu";
import { DataTable, type Column } from "@/components/DataTable";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";

const STATUS_OPTIONS: { value: ReportStatus; label: string; tone: Parameters<typeof StatusBadge>[0]["tone"] }[] = [
  { value: "open", label: "Open", tone: "open" },
  { value: "reviewing", label: "Reviewing", tone: "reviewing" },
  { value: "resolved", label: "Resolved", tone: "resolved" },
];

function statusTone(status: ReportStatus) {
  return STATUS_OPTIONS.find((s) => s.value === status)?.tone ?? "muted";
}

export default function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setReports(await fetchAllReports());
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = async (report: Report, status: ReportStatus) => {
    setReports((prev) => prev.map((r) => (r.id === report.id ? { ...r, status } : r)));
    await updateReportStatus(report.id, status);
    toast.success(`Report marked as ${status}`);
  };

  const columns: Column<Report>[] = [
    {
      key: "target",
      header: "Target",
      render: (r) => (
        <div className="leading-tight">
          <Badge variant="outline" className="mb-1 border-white/10 bg-white/5 text-xs capitalize text-muted-foreground">
            {r.targetType}
          </Badge>
          {r.targetId ? <p className="max-w-[16rem] truncate font-mono text-xs text-muted-foreground">{r.targetId}</p> : null}
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (r) => <span className="capitalize text-foreground">{r.category || "General"}</span>,
    },
    {
      key: "message",
      header: "Message",
      className: "max-w-md",
      render: (r) => <p className="line-clamp-2 text-muted-foreground">{r.message || "—"}</p>,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => <StatusBadge tone={statusTone(r.status)}>{r.status}</StatusBadge>,
    },
    {
      key: "reported",
      header: "Reported",
      render: (r) => <span className="text-muted-foreground">{timeAgo(r.createdAt)}</span>,
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      className: "w-12 text-right",
      render: (r) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <span className="sr-only">Actions</span>
              <span className="text-muted-foreground">···</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              Update status
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {STATUS_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => void setStatus(r, opt.value)}
                disabled={r.status === opt.value}
              >
                <span className="mr-2 h-2 w-2 rounded-full bg-current" />
                {opt.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Investigate and resolve user reports"
        actions={
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      {loading ? (
        <div className="glass flex min-h-[16rem] items-center justify-center rounded-2xl">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable columns={columns} rows={reports} loading={false} empty="No reports yet." />
      )}
    </div>
  );
}
