"use client";

import type { ProjectRow } from "@/lib/types";
import { useMemo } from "react";

function fmtM(n: number): string {
  const a = Math.abs(n);
  if (a >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (a >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(0);
}

function variancePct(p: ProjectRow): number {
  const b = Number(p.budget);
  const v = Number(p.actual_cost) - b;
  if (!Number.isFinite(b) || b === 0) return 0;
  return (v / b) * 100;
}

function cellMoneyClass(variancePct: number): string {
  if (variancePct > 5) return "bg-red-500/25 text-red-100 ring-1 ring-red-500/25";
  if (variancePct < -2) return "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-500/20";
  return "bg-sky-600/25 text-sky-100 ring-1 ring-sky-500/20";
}

/** Funding view: budget vs actual vs variance — heat-style cells. */
export function FundingMatrix({ projects }: { projects: ProjectRow[] }) {
  const rows = useMemo(
    () =>
      [...projects]
        .sort((a, b) => Number(b.budget) - Number(a.budget))
        .slice(0, 14),
    [projects]
  );

  return (
    <div className="max-h-[340px] overflow-auto">
      <table className="w-full min-w-[520px] border-collapse text-left text-[11px]">
        <thead>
          <tr className="border-b border-white/10 bg-white/[0.04]">
            <th className="sticky left-0 z-10 min-w-[140px] bg-zinc-950/95 px-2 py-2 font-semibold text-zinc-400">
              Programme
            </th>
            <th className="min-w-[88px] px-2 py-2 text-center font-semibold text-zinc-400">Budget</th>
            <th className="min-w-[88px] px-2 py-2 text-center font-semibold text-zinc-400">Actual</th>
            <th className="min-w-[88px] px-2 py-2 text-center font-semibold text-zinc-400">Var %</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const b = Number(p.budget);
            const a = Number(p.actual_cost);
            const vp = variancePct(p);
            return (
              <tr key={p.project_id} className="border-b border-white/[0.06] hover:bg-white/[0.02]">
                <td className="sticky left-0 z-10 max-w-[200px] bg-zinc-950/90 px-2 py-1.5 font-medium text-zinc-200 backdrop-blur-sm">
                  <span className="line-clamp-2" title={p.project_name}>
                    {p.project_name}
                  </span>
                </td>
                <td className="px-2 py-1.5 text-center tabular-nums text-sky-200/90">£{fmtM(b)}</td>
                <td className="px-2 py-1.5 text-center tabular-nums text-emerald-200/90">£{fmtM(a)}</td>
                <td className="px-2 py-1.5 text-center">
                  <span
                    className={`inline-flex min-w-[3rem] justify-center rounded px-1.5 py-1 text-[10px] font-semibold tabular-nums ${cellMoneyClass(vp)}`}
                  >
                    {vp >= 0 ? "+" : ""}
                    {vp.toFixed(1)}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
