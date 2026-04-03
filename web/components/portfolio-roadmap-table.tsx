"use client";

import type { ProjectRow } from "@/lib/types";
import { useMemo } from "react";

function phaseOf(p: ProjectRow): string {
  const a = Number(p.actual_progress);
  if (a >= 99.5) return "Close";
  if (a >= 50) return "Execute";
  if (a >= 25) return "Plan";
  return "Initiate";
}

function priorityStyle(priority: string | undefined): string {
  const x = String(priority ?? "").toLowerCase();
  if (x.includes("high") || x.includes("critical")) return "bg-red-500/25 text-red-200 ring-1 ring-red-500/30";
  if (x.includes("medium")) return "bg-amber-500/20 text-amber-100 ring-1 ring-amber-500/25";
  if (x.includes("low")) return "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-500/25";
  return "bg-white/5 text-zinc-300 ring-1 ring-white/10";
}

export function PortfolioRoadmapTable({ projects }: { projects: ProjectRow[] }) {
  const rows = useMemo(
    () =>
      [...projects].sort((a, b) =>
        String(a.project_name ?? "").localeCompare(String(b.project_name ?? ""))
      ),
    [projects]
  );

  return (
    <div className="max-h-[min(480px,62vh)] overflow-auto">
      <table className="w-full min-w-[520px] text-left text-xs">
        <thead>
          <tr className="sticky top-0 border-b border-white/10 bg-zinc-950/95 text-[10px] uppercase tracking-wide text-zinc-500 backdrop-blur-sm">
            <th className="whitespace-nowrap p-2.5 font-semibold">Title</th>
            <th className="p-2.5 font-semibold">Owner</th>
            <th className="p-2.5 font-semibold">Status</th>
            <th className="p-2.5 font-semibold">Phase</th>
            <th className="p-2.5 text-right font-semibold">% Done</th>
            <th className="p-2.5 font-semibold">Priority</th>
            <th className="p-2.5 font-semibold">Workspace</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.project_id} className="border-b border-white/[0.06] hover:bg-white/[0.03]">
              <td className="max-w-[200px] p-2.5">
                <span className="font-medium leading-snug text-zinc-100" title={p.project_name}>
                  {p.project_name}
                </span>
              </td>
              <td className="p-2.5 text-zinc-400">{p.project_manager ?? "—"}</td>
              <td className="p-2.5 text-zinc-300">{p.status}</td>
              <td className="p-2.5 text-zinc-400">{phaseOf(p)}</td>
              <td className="p-2.5 text-right tabular-nums text-zinc-200">
                {Number(p.actual_progress).toFixed(0)}%
              </td>
              <td className="p-2.5">
                <span
                  className={`inline-block rounded px-2 py-0.5 text-[10px] font-medium ${priorityStyle(p.priority)}`}
                >
                  {p.priority ?? "—"}
                </span>
              </td>
              <td className="p-2.5 font-mono text-[10px] text-violet-300/90">{p.project_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
