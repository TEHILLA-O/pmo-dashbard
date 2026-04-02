"use client";

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

      <KpiGrid k={k} />

      <p className="text-xs text-zinc-600">
        <strong className="text-zinc-500">Tip:</strong> open Executive Overview for the portfolio-wide
        health snapshot and charts.
      </p>
    </div>
  );
}
