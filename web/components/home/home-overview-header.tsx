"use client";

import { PortfolioExportToolbar } from "@/components/portfolio-export-toolbar";
import type { ProjectRow } from "@/lib/types";

function parseDate(s: unknown): Date | null {
  if (s == null || String(s).trim() === "") return null;
  const d = new Date(String(s));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function portfolioDateRangeLabel(projects: ProjectRow[]): string {
  const ts: number[] = [];
  for (const p of projects) {
    const s = parseDate(p.start_date);
    const e = parseDate(p.end_date);
    if (s) ts.push(s.getTime());
    if (e) ts.push(e.getTime());
  }
  if (ts.length === 0) return "No date range";
  const min = new Date(Math.min(...ts));
  const max = new Date(Math.max(...ts));
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  return `${fmt(min)} – ${fmt(max)}`;
}

export function HomeOverviewHeader({ projects }: { projects: ProjectRow[] }) {
  return (
    <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
          Strategy execution
        </p>
        <h1 className="mt-1 font-[family-name:var(--font-instrument)] text-2xl font-normal tracking-tight text-white md:text-3xl">
          Portfolio overview
        </h1>
        <p className="mt-1 max-w-xl text-sm text-zinc-500">
          Widgets mirror programme data in this browser. Use filters to focus the grid; export for offline analysis.
        </p>
      </div>
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2 text-center sm:text-left">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Date range</p>
          <p className="mt-0.5 text-sm font-medium tabular-nums text-zinc-200">
            {portfolioDateRangeLabel(projects)}
          </p>
        </div>
        <PortfolioExportToolbar />
      </div>
    </div>
  );
}
