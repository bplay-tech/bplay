"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  header: string;
  key: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  pageSize?: number;
}

export function Table<T>({
  data,
  columns,
  keyExtractor,
  emptyMessage = "No data found.",
  pageSize = 10,
}: TableProps<T>) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const slice = data.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-xl border border-card-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-card-border bg-card/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn("px-4 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider", col.className)}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {slice.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              slice.map((row) => (
                <tr key={keyExtractor(row)} className="bg-card hover:bg-card/70 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className={cn("px-4 py-3 text-foreground", col.className)}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-md hover:bg-card disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-md hover:bg-card disabled:opacity-40 disabled:pointer-events-none"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
