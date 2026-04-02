"use client";

import { BudgetActualBars } from "@/components/charts/budget-actual-bars";
import { HealthBars } from "@/components/charts/health-bars";
import { StatusDonut } from "@/components/charts/status-donut";
import { HomeProjectList } from "@/components/home-project-list";
import { KpiGrid } from "@/components/kpi-grid";
import { QuickLinks } from "@/components/quick-links";
import { usePortfolio } from "@/contexts/portfolio-context";
import { getBundleKpis } from "@/lib/metrics";

export default function HomePage() {
  const { bundle } = usePortfolio();
  const k = getBundleKpis(bundle);

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header>
        <h1 className="font-[family-name:var(--font-instrument)] text-3xl font-normal tracking-tight text-white md:text-4xl">
          Project Portfolio Manager KPI
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Portfolio governance and key performance indicators — add or edit projects under{" "}
          <strong className="text-zinc-400">Data / Admin</strong> (saved in this browser).
        </p>
      </header>

      <p className="max-w-3xl text-sm leading-relaxed text-zinc-400">
        Integrated PMO view across portfolio health, delivery risk, resource capacity, strategic
        prioritisation, and weekly reporting. Use the sidebar or the shortcuts below to move between
        governance views.
      </p>

      <QuickLinks />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-2xl p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Delivery status mix</p>
          <StatusDonut onTrack={k.on_track} atRisk={k.at_risk} delayed={k.delayed} />
        </div>
        <div className="glass-card rounded-2xl p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Health score distribution</p>
          <HealthBars projects={bundle.projects} />
        </div>
      </div>

      <HomeProjectList />

      <div className="glass-card rounded-2xl p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Budget vs spend (largest programmes, £m)
        </p>
        <BudgetActualBars projects={bundle.projects} limit={10} />
      </div>

      <KpiGrid k={k} />

      <p className="text-xs text-zinc-600">
        <strong className="text-zinc-500">Tip:</strong> every section in the sidebar includes charts or
        tables — Executive Overview has the deepest delivery and cost views.
      </p>
    </div>
  );
}
