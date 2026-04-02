"use client";

import { HealthRankLine } from "@/components/charts/health-rank-line";
import { PriorityMixBars } from "@/components/charts/priority-mix-bars";
import { StatusDonut } from "@/components/charts/status-donut";
import { usePortfolio } from "@/contexts/portfolio-context";
import { getBundleKpis } from "@/lib/metrics";

export default function PredictivePage() {
  const { bundle } = usePortfolio();
  const k = getBundleKpis(bundle);
  const avgHealth =
    bundle.projects.reduce((s, p) => s + Number(p.health_score), 0) /
    Math.max(bundle.projects.length, 1);
  const atRisk = bundle.projects.filter((p) => p.status !== "On Track").length;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-instrument)] text-3xl text-white">Predictive Analytics</h1>
        <p className="mt-1 text-sm text-zinc-500">Signals and distribution views (illustrative)</p>
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

      <div className="glass-card rounded-2xl p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Health curve (lowest → highest)
        </p>
        <HealthRankLine projects={bundle.projects} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-2xl p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Status mix</p>
          <StatusDonut onTrack={k.on_track} atRisk={k.at_risk} delayed={k.delayed} />
        </div>
        <div className="glass-card rounded-2xl p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Priority mix</p>
          <PriorityMixBars projects={bundle.projects} />
        </div>
      </div>
    </div>
  );
}
