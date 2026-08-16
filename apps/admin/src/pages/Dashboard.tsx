import { useCallback, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Building2,
  Flag,
  PlusCircle,
  RefreshCw,
  Users,
} from "lucide-react";
import { fetchAdminOverview, type AdminOverview } from "@housemates/shared-supabase";
import { getSchool } from "@housemates/shared-data";
import { cn } from "@housemates/shared-utils";
import { Button } from "@housemates/shared-ui/button";
import { ChartCard } from "@/components/ChartCard";
import { KpiCard } from "@/components/KpiCard";
import { PageHeader } from "@/components/PageHeader";

function weekOverWeekDelta(series: { date: string; count: number }[]): number {
  if (series.length < 14) return 0;
  const last7 = series.slice(-7).reduce((s, d) => s + d.count, 0);
  const prev7 = series.slice(-14, -7).reduce((s, d) => s + d.count, 0);
  if (prev7 === 0) return last7 > 0 ? 100 : 0;
  return Math.round(((last7 - prev7) / prev7) * 100);
}

interface ChartTipProps {
  active?: boolean;
  payload?: { name?: string; value?: number | string }[];
  label?: string;
}

function ChartTip({ active, payload, label }: ChartTipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card/95 px-3 py-2 text-xs shadow-elevated backdrop-blur-xl">
      {label ? <p className="mb-1 font-medium text-muted-foreground">{label}</p> : null}
      {payload.map((entry, i) => (
        <p key={i} className="font-medium text-foreground">
          {entry.value?.toLocaleString()} {entry.name}
        </p>
      ))}
    </div>
  );
}

const STATUS_META = [
  { key: "available", label: "Available", bar: "bg-emerald-400", text: "text-emerald-400" },
  { key: "pending", label: "Pending", bar: "bg-amber-400", text: "text-amber-400" },
  { key: "taken", label: "Taken", bar: "bg-slate-400", text: "text-slate-400" },
] as const;

export default function Dashboard() {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setOverview(await fetchAdminOverview());
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const totalByStatus = overview
    ? STATUS_META.reduce((sum, s) => sum + (overview.listingsByStatus[s.key] ?? 0), 0)
    : 0;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Platform health at a glance"
        actions={
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total users"
          value={overview?.totalUsers ?? "—"}
          icon={Users}
          accent="teal"
          delta={overview ? weekOverWeekDelta(overview.usersPerDay) : undefined}
          deltaLabel="vs last week"
        />
        <KpiCard
          label="Total listings"
          value={overview?.totalListings ?? "—"}
          icon={Building2}
          accent="coral"
          delta={overview ? weekOverWeekDelta(overview.listingsPerDay) : undefined}
          deltaLabel="vs last week"
        />
        <KpiCard
          label="New listings this week"
          value={overview?.newListingsThisWeek ?? "—"}
          icon={PlusCircle}
          accent="emerald"
          hint="last 7 days"
        />
        <KpiCard
          label="Open reports"
          value={overview?.openReports ?? "—"}
          icon={Flag}
          accent="rose"
          hint="awaiting review"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ChartCard title="Listings created" subtitle="Last 30 days">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={overview?.listingsPerDay ?? []} margin={{ left: -24, right: 8, top: 4 }}>
              <defs>
                <linearGradient id="listingsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2bbdee" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2bbdee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(d: string) => d.slice(5)}
                minTickGap={28}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTip />} cursor={{ stroke: "hsl(var(--muted-foreground))", strokeOpacity: 0.3 }} />
              <Area
                type="monotone"
                dataKey="count"
                name="listings"
                stroke="#2bbdee"
                strokeWidth={2}
                fill="url(#listingsFill)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="User signups" subtitle="Last 30 days">
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={overview?.usersPerDay ?? []} margin={{ left: -24, right: 8, top: 4 }}>
              <defs>
                <linearGradient id="usersFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ed836e" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#ed836e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(d: string) => d.slice(5)}
                minTickGap={28}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTip />} cursor={{ stroke: "hsl(var(--muted-foreground))", strokeOpacity: 0.3 }} />
              <Area
                type="monotone"
                dataKey="count"
                name="signups"
                stroke="#ed836e"
                strokeWidth={2}
                fill="url(#usersFill)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <ChartCard title="Listings by school" subtitle="Top 8 institutions" className="lg:col-span-3">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={(overview?.listingsBySchool ?? []).map((s) => ({
                name: getSchool(s.schoolId)?.name ?? s.schoolId,
                count: s.count,
              }))}
              layout="vertical"
              margin={{ left: 8, right: 16, top: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={150}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<ChartTip />} cursor={{ fill: "hsl(var(--muted-foreground))", fillOpacity: 0.08 }} />
              <Bar dataKey="count" name="listings" fill="#2bbdee" radius={[0, 6, 6, 0]} barSize={14}>
                {overview?.listingsBySchool.map((_, i) => (
                  <Bar key={i} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Listings by status" subtitle="Current distribution" className="lg:col-span-2">
          <div className="flex h-[240px] flex-col justify-center gap-5">
            {STATUS_META.map(({ key, label, bar, text }) => {
              const count = overview?.listingsByStatus[key] ?? 0;
              const pct = totalByStatus ? Math.round((count / totalByStatus) * 100) : 0;
              return (
                <div key={key}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className={cn("font-medium", text)}>
                      {count}
                      <span className="ml-1 text-xs text-muted-foreground">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/5">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", bar)}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            <p className="pt-1 text-xs text-muted-foreground">
              {totalByStatus} total listings across all statuses
            </p>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
