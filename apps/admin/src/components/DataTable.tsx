import type { ReactNode } from "react";
import { Loader2, Inbox } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@housemates/shared-ui/table";
import { cn } from "@housemates/shared-utils";

export interface Column<T> {
  key: string;
  header: ReactNode;
  className?: string;
  render: (row: T) => ReactNode;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  loading,
  empty,
  rowClassName,
}: {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  empty?: ReactNode;
  rowClassName?: (row: T) => string;
}) {
  if (loading) {
    return (
      <div className="glass flex min-h-[16rem] items-center justify-center rounded-2xl">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="glass flex min-h-[16rem] flex-col items-center justify-center gap-2 rounded-2xl">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
          <Inbox className="h-5 w-5 text-muted-foreground" />
        </span>
        <p className="text-sm text-muted-foreground">{empty ?? "No records yet."}</p>
      </div>
    );
  }

  return (
    <div className="glass overflow-hidden rounded-2xl">
      <Table>
        <TableHeader>
          <TableRow className="border-border/60 bg-white/[0.02] hover:bg-white/[0.02]">
            {columns.map((col) => (
              <TableHead key={col.key} className={cn("h-11 text-xs font-medium uppercase tracking-wider text-muted-foreground", col.className)}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              className={cn("border-border/40 transition-colors hover:bg-white/[0.03]", rowClassName?.(row))}
            >
              {columns.map((col) => (
                <TableCell key={col.key} className={cn("py-3 text-sm", col.className)}>
                  {col.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
