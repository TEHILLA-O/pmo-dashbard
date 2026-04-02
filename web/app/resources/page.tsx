"use client";

import { ResourceRollupBars } from "@/components/charts/resource-rollup-bars";
import { UtilizationBars } from "@/components/charts/utilization-bars";
import { ResourceRosterPanel } from "@/components/resource-roster-panel";
import { usePortfolio } from "@/contexts/portfolio-context";

export default function ResourcesPage() {
  const { bundle } = usePortfolio();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-instrument)] text-3xl text-white">Resource Allocation</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Named allocations and project utilisation — edit the roster below (saved in this browser).
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-2xl p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Total allocation by person (%)
          </p>
          <ResourceRollupBars resources={bundle.resources} limit={14} />
        </div>
        <div className="glass-card rounded-2xl p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Project intensity (resource utilisation %)
          </p>
          <UtilizationBars projects={bundle.projects} limit={12} />
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <ResourceRosterPanel />
      </div>
    </div>
  );
}
