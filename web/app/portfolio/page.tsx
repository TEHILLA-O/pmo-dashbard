"use client";

import { ExportProjectCsvButton, PortfolioExportToolbar } from "@/components/portfolio-export-toolbar";
import { usePortfolio } from "@/contexts/portfolio-context";

export default function PortfolioPage() {
  const { bundle } = usePortfolio();
  const rows = bundle.projects;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-instrument)] text-3xl text-white">Portfolio View</h1>
          <p className="mt-1 text-sm text-zinc-500">Project register and delivery snapshot</p>
        </div>
        <PortfolioExportToolbar />
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-zinc-500">
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Status</th>
              <th className="p-3">Health</th>
              <th className="p-3 text-right">% complete</th>
              <th className="p-3 text-right">Budget</th>
              <th className="p-3 text-right">Spend</th>
              <th className="p-3 text-right">Export</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.project_id} className="border-b border-white/5 hover:bg-white/[0.03]">
                <td className="p-3 font-mono text-xs text-zinc-400">{p.project_id}</td>
                <td className="p-3 text-zinc-200">{p.project_name}</td>
                <td className="p-3 text-zinc-400">{p.status}</td>
                <td className="p-3">{Number(p.health_score).toFixed(1)}</td>
                <td className="p-3 text-right">{Number(p.actual_progress).toFixed(1)}%</td>
                <td className="p-3 text-right text-zinc-400">
                  {Number(p.budget).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
                <td className="p-3 text-right text-zinc-400">
                  {Number(p.actual_cost).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </td>
                <td className="p-3 text-right">
                  <ExportProjectCsvButton projectId={p.project_id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
