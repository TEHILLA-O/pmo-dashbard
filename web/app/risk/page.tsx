"use client";

import { RiskScatter } from "@/components/charts/risk-scatter";
import { usePortfolio } from "@/contexts/portfolio-context";

export default function RiskPage() {
  const { bundle } = usePortfolio();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-instrument)] text-3xl text-white">Risk & Health Analysis</h1>
        <p className="mt-1 text-sm text-zinc-500">Probability × impact exposure by project</p>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <RiskScatter projects={bundle.projects} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {bundle.projects.slice(0, 6).map((p) => (
          <div key={p.project_id} className="glass-card rounded-xl p-4 text-sm">
            <p className="font-mono text-xs text-teal-400">{p.project_id}</p>
            <p className="mt-1 line-clamp-2 text-zinc-300">{p.project_name}</p>
            <p className="mt-2 text-zinc-500">
              Health {Number(p.health_score).toFixed(1)} · Risks {p.open_risks_count}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
