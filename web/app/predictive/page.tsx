"use client";

import { usePortfolio } from "@/contexts/portfolio-context";

export default function PredictivePage() {
  const { bundle } = usePortfolio();
  const avgHealth =
    bundle.projects.reduce((s, p) => s + Number(p.health_score), 0) /
    Math.max(bundle.projects.length, 1);
  const atRisk = bundle.projects.filter((p) => p.status !== "On Track").length;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-instrument)] text-3xl text-white">Predictive Analytics</h1>
        <p className="mt-1 text-sm text-zinc-500">Lightweight portfolio signals</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="glass-card rounded-2xl p-6">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Portfolio mean health</p>
          <p className="mt-2 font-[family-name:var(--font-instrument)] text-4xl text-teal-300">
            {avgHealth.toFixed(1)}
          </p>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <p className="text-xs uppercase tracking-wider text-zinc-500">Projects needing attention</p>
          <p className="mt-2 font-[family-name:var(--font-instrument)] text-4xl text-amber-300">
            {atRisk}
          </p>
          <p className="mt-1 text-xs text-zinc-500">Not on track</p>
        </div>
      </div>
    </div>
  );
}
