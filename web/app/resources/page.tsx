"use client";

import { usePortfolio } from "@/contexts/portfolio-context";

export default function ResourcesPage() {
  const { bundle } = usePortfolio();
  const rows = bundle.resources;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-instrument)] text-3xl text-white">Resource Allocation</h1>
        <p className="mt-1 text-sm text-zinc-500">Named resource allocations (sample data; add projects in Admin)</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-zinc-500">
              <th className="p-3">Resource</th>
              <th className="p-3">Project</th>
              <th className="p-3">Role</th>
              <th className="p-3 text-right">Allocation %</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, 80).map((r, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03]">
                <td className="p-3 text-zinc-200">{String(r.resource_name ?? "")}</td>
                <td className="p-3 font-mono text-xs text-zinc-500">{String(r.project_id ?? "")}</td>
                <td className="p-3 text-zinc-400">{String(r.role ?? "")}</td>
                <td className="p-3 text-right">{Number(r.allocation_percent ?? 0).toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
