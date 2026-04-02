"use client";

import { BudgetActualBars } from "@/components/charts/budget-actual-bars";
import { HealthBars } from "@/components/charts/health-bars";
import { ProgressBarsHorizontal } from "@/components/charts/progress-bars-h";
import { StatusDonut } from "@/components/charts/status-donut";
import { UtilizationBars } from "@/components/charts/utilization-bars";
import { usePortfolio } from "@/contexts/portfolio-context";
import { getBundleKpis } from "@/lib/metrics";

function fmt(n: number, digits = 1): string {
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(digits);
}

export default function ExecutivePage() {
  const { bundle } = usePortfolio();
  const k = getBundleKpis(bundle);
  const remWork = Math.max(0, 100 - k.budget_weighted_pct_complete);
  const cpiTxt =
    k.total_spend_gbp > 0 && Number.isFinite(k.cpi) ? fmt(k.cpi, 2) : "—";
  const namedLoad =
    k.named_resources_count > 0 && Number.isFinite(k.avg_named_resource_load_pct)
      ? `${fmt(k.avg_named_resource_load_pct)}%`
      : "—";

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-[family-name:var(--font-instrument)] text-3xl text-white">Executive Overview</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Current portfolio health, financial position, and governance exceptions
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="glass-card space-y-4 rounded-2xl p-5 lg:col-span-1">
          <Section title="Delivery & schedule" />
          <KpiLine label="Budget-weighted % complete" value={`${fmt(k.budget_weighted_pct_complete)}%`} />
          <KpiLine label="Avg % complete" value={`${fmt(k.avg_pct_complete)}%`} />
          <KpiLine label="Remaining work" value={`${fmt(remWork)}%`} />
          <KpiLine label="Avg schedule variance" value={`${k.avg_schedule_variance_pp >= 0 ? "+" : ""}${fmt(k.avg_schedule_variance_pp)} pp`} />
          <KpiLine label="SPI" value={fmt(k.spi, 2)} />
          <KpiLine label="On-schedule rate" value={`${fmt(k.on_schedule_rate_pct, 0)}%`} />
          <KpiLine label="Overdue milestones" value={`${k.overdue_milestones.toLocaleString()}`} />
          <KpiLine label="Exception rate" value={`${fmt(k.exception_rate_pct)}%`} />
        </div>

        <div className="glass-card rounded-2xl p-5 lg:col-span-1">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Status mix</p>
          <StatusDonut onTrack={k.on_track} atRisk={k.at_risk} delayed={k.delayed} />
        </div>

        <div className="glass-card rounded-2xl p-5 lg:col-span-1">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Health distribution</p>
          <HealthBars projects={bundle.projects} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-2xl p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Budget vs actual spend (£m)
          </p>
          <BudgetActualBars projects={bundle.projects} limit={12} />
        </div>
        <div className="glass-card rounded-2xl p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Resource utilisation by project (%)
          </p>
          <UtilizationBars projects={bundle.projects} limit={12} />
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Planned vs actual progress (%)
        </p>
        <ProgressBarsHorizontal projects={bundle.projects} limit={14} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card space-y-3 rounded-2xl p-5">
          <Section title="Budget & cost" />
          <KpiLine label="Total approved budget" value={`GBP ${k.total_budget_gbp.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
          <KpiLine label="Actual spend" value={`GBP ${k.total_spend_gbp.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} />
          <KpiLine label="Budget utilisation" value={`${fmt(k.budget_utilisation_pct)}%`} />
          <KpiLine label="Budget variance %" value={`${k.budget_variance_pct >= 0 ? "+" : ""}${fmt(k.budget_variance_pct)}%`} />
          <KpiLine label="CPI" value={cpiTxt} />
          <KpiLine label="Total open risks" value={`${k.total_open_risks.toLocaleString()}`} />
        </div>
        <div className="glass-card space-y-3 rounded-2xl p-5">
          <Section title="Resource & capacity" />
          <KpiLine label="Avg resource utilisation" value={`${fmt(k.avg_resource_utilization_pct)}%`} />
          <KpiLine label="% projects over 100% util" value={`${fmt(k.pct_projects_overallocated, 0)}%`} />
          <KpiLine label="Named resources (roster)" value={`${k.named_resources_count.toLocaleString()}`} />
          <KpiLine label="Avg allocation / person" value={namedLoad} />
          <KpiLine label="Named overallocated" value={`${k.named_resources_overallocated_count.toLocaleString()}`} />
          <KpiLine label="Avg capacity overrun" value={`${fmt(k.avg_resource_overrun_pp)} pp`} />
        </div>
      </div>
    </div>
  );
}

function Section({ title }: { title: string }) {
  return <p className="text-xs font-semibold uppercase tracking-wider text-teal-400/90">{title}</p>;
}

function KpiLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="text-right text-zinc-200">{value}</span>
    </div>
  );
}
