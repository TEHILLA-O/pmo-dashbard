"use client";

import type { ProjectRow } from "@/lib/types";
import { useMemo } from "react";
import { uniqueSorted } from "@/lib/home-filters";

function scoreCell(p: ProjectRow): number {
  const raw = (p as Record<string, unknown>).strategic_alignment_score;
  const n = Number(raw ?? NaN);
  return Number.isFinite(n) ? n : NaN;
}

function cellClass(score: number): string {
  if (!Number.isFinite(score)) return "bg-zinc-800/50 text-zinc-500";
  if (score >= 80) return "bg-emerald-600/35 text-emerald-50 ring-1 ring-emerald-500/20";
  if (score >= 60) return "bg-amber-500/30 text-amber-50 ring-1 ring-amber-500/20";
  return "bg-red-500/25 text-red-100 ring-1 ring-red-500/20";
}

/** Heatmap: projects × business unit — shows alignment % in the matching column. */
export function StrategyAlignmentMatrix({ projects }: { projects: ProjectRow[] }) {
  const { columns, rows } = useMemo(() => {
    let cols = uniqueSorted(
      projects.map((p) => String(p.business_unit ?? "").trim() || "Unassigned")
    );
    if (cols.length === 0) cols = ["Portfolio"];
    const sorted = [...projects].sort((a, b) =>
      String(a.project_name ?? "").localeCompare(String(b.project_name ?? ""))
    );
    return { columns: cols, rows: sorted.slice(0, 14) };
  }, [projects]);

  return (
    <div className="max-h-[340px] overflow-auto">
      <table className="w-full min-w-[480px] border-collapse text-left text-[11px]">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.04]">
            <th className="sticky left-0 z-10 min-w-[140px] bg-zinc-950/95 px-2 py-2 font-semibold text-zinc-400">
              Programme
            </th>
            {columns.map((c) => (
              <th
                key={c}
                className="min-w-[76px] max-w-[104px] px-1 py-2 text-center text-[10px] font-semibold leading-tight text-zinc-400"
                title={c}
              >
                <span className="line-clamp-3">{c}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.project_id} className="border-b border-white/[0.06] hover:bg-white/[0.02]">
              <td className="sticky left-0 z-10 max-w-[200px] bg-zinc-950/90 px-2 py-1.5 font-medium text-zinc-200 backdrop-blur-sm">
                <span className="line-clamp-2" title={p.project_name}>
                  {p.project_name}
                </span>
              </td>
              {columns.map((col) => {
                const unit = String(p.business_unit ?? "").trim() || "Unassigned";
                const match = unit === col;
                const sc = scoreCell(p);
                const show = match && Number.isFinite(sc);
                return (
                  <td key={col} className="px-1 py-1 text-center">
                    {show ? (
                      <span
                        className={`inline-flex min-w-[2.5rem] justify-center rounded px-1.5 py-1 text-[10px] font-semibold tabular-nums ${cellClass(sc)}`}
                      >
                        {sc.toFixed(0)}%
                      </span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
