import type { ExecutiveKpis } from "@/lib/types";

function fmt(n: number, digits = 1): string {
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(digits);
}

export function KpiGrid({ k }: { k: ExecutiveKpis }) {
  const cpi =
    k.total_spend_gbp > 0 && Number.isFinite(k.cpi) ? fmt(k.cpi, 2) : "—";

  const rows: [string, string][][] = [
    [
      ["Budget-weighted % complete", `${fmt(k.budget_weighted_pct_complete)}%`],
      ["Avg schedule variance", `${k.avg_schedule_variance_pp >= 0 ? "+" : ""}${fmt(k.avg_schedule_variance_pp)} pp`],
      ["Budget utilisation", `${fmt(k.budget_utilisation_pct)}%`],
      ["SPI (schedule)", fmt(k.spi, 2)],
    ],
    [
      ["Active projects", `${k.n_projects.toLocaleString()}`],
      ["On track", `${k.on_track.toLocaleString()}`],
      ["CPI (cost)", cpi],
      ["Avg resource utilisation", `${fmt(k.avg_resource_utilization_pct)}%`],
    ],
    [
      ["Avg health score", fmt(k.avg_health)],
      ["Projects over 100% utilisation", `${fmt(k.pct_projects_overallocated, 0)}%`],
      ["Named resources overallocated", `${k.named_resources_overallocated_count.toLocaleString()}`],
      ["Avg capacity overrun", `${fmt(k.avg_resource_overrun_pp)} pp`],
    ],
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
        Portfolio manager KPIs
      </h2>
      {rows.map((row, i) => (
        <div key={i} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {row.map(([label, val]) => (
            <div key={label} className="glass-card glass-tile rounded-xl p-4">
              <p className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</p>
              <p className="mt-1 font-[family-name:var(--font-instrument)] text-2xl text-zinc-100">{val}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
