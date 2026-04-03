"use client";

import { BusinessUnitBars } from "@/components/charts/business-unit-bars";
import { FundingMatrix } from "@/components/charts/funding-matrix";
import { PortfolioRoadmapGantt } from "@/components/charts/portfolio-roadmap-gantt";
import { ProjectsByStatusDonut } from "@/components/charts/projects-by-status-donut";
import { StatusHorizontalBars } from "@/components/charts/status-horizontal-bars";
import { StrategyAlignmentMatrix } from "@/components/charts/strategy-alignment-matrix";
import { DashboardWidgetFrame } from "@/components/home/dashboard-widget-frame";
import { HomeOverviewFilters } from "@/components/home/home-overview-filters";
import { HomeOverviewHeader } from "@/components/home/home-overview-header";
import type { HomeViewTab } from "@/components/home/home-view-tabs";
import { HomeViewTabs } from "@/components/home/home-view-tabs";
import { KpiGrid } from "@/components/kpi-grid";
import { PortfolioRoadmapTable } from "@/components/portfolio-roadmap-table";
import { QuickLinks } from "@/components/quick-links";
import { usePortfolio } from "@/contexts/portfolio-context";
import { defaultHomeFilters, filterProjects, getKpisForProjectSubset } from "@/lib/home-filters";
import { useMemo, useState } from "react";

export default function HomePage() {
  const { bundle } = usePortfolio();
  const [filters, setFilters] = useState(defaultHomeFilters);
  const [tab, setTab] = useState<HomeViewTab>("widgets");

  const filtered = useMemo(() => filterProjects(bundle.projects, filters), [bundle.projects, filters]);

  const k = useMemo(() => getKpisForProjectSubset(bundle, filtered), [bundle, filtered]);

  const roadmapSection = (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
      <div className="flex flex-col overflow-hidden rounded-xl border border-white/12 bg-zinc-950/40 xl:col-span-5">
        <div className="border-b border-white/10 bg-white/[0.03] px-4 py-3">
          <h2 className="text-sm font-semibold text-zinc-100">Programme register</h2>
          <p className="mt-0.5 text-[11px] text-zinc-500">Owner, phase, priority, workspace id.</p>
        </div>
        <div className="min-h-[280px] flex-1 p-3">
          <PortfolioRoadmapTable projects={filtered} />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-white/12 bg-zinc-950/40 xl:col-span-7">
        <div className="border-b border-white/10 bg-white/[0.03] px-4 py-3">
          <h2 className="text-sm font-semibold text-zinc-100">Timeline</h2>
          <p className="mt-0.5 text-[11px] text-zinc-500">RAG bars; dashed line is today.</p>
        </div>
        <div className="p-3">
          <PortfolioRoadmapGantt projects={filtered} limit={12} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1680px] space-y-6 px-1 sm:px-2">
      <HomeOverviewHeader projects={bundle.projects} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <HomeViewTabs active={tab} onChange={setTab} />
        <p className="text-[11px] text-zinc-600 lg:text-right">
          View: <strong className="text-zinc-400">Widgets</strong> for charts &amp; matrices,{" "}
          <strong className="text-zinc-400">Roadmap</strong> for table + Gantt, <strong className="text-zinc-400">List</strong>{" "}
          for register only.
        </p>
      </div>

      <section aria-label="Shortcuts" className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">Jump to</p>
        <QuickLinks />
      </section>

      {tab === "widgets" && (
        <>
          <HomeOverviewFilters projects={bundle.projects} value={filters} onChange={setFilters} />

          <section aria-label="Widget row 1" className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Dashboard widgets</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <DashboardWidgetFrame
                title="Projects by status"
                subtitle="Delivery state mix for filtered programmes."
              >
                <ProjectsByStatusDonut
                  onTrack={k.on_track}
                  atRisk={k.at_risk}
                  delayed={k.delayed}
                  totalProjects={filtered.length}
                />
              </DashboardWidgetFrame>
              <DashboardWidgetFrame title="Status distribution" subtitle="Horizontal comparison by count.">
                <StatusHorizontalBars onTrack={k.on_track} atRisk={k.at_risk} delayed={k.delayed} />
              </DashboardWidgetFrame>
              <DashboardWidgetFrame
                title="Projects by business unit"
                subtitle="Volume per unit (filtered set)."
              >
                <BusinessUnitBars projects={filtered} />
              </DashboardWidgetFrame>
            </div>
          </section>

          <section aria-label="Widget row 2 matrices" className="space-y-3 pt-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Alignment &amp; funding
            </h2>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              <DashboardWidgetFrame
                title="Strategy alignment matrix"
                subtitle="Alignment % in each programme’s business unit column."
                bodyClassName="!p-0"
              >
                <div className="px-3 pb-3 pt-1">
                  <StrategyAlignmentMatrix projects={filtered} />
                </div>
              </DashboardWidgetFrame>
              <DashboardWidgetFrame
                title="Funding matrix"
                subtitle="Budget, actual spend, and variance % (top programmes by budget)."
                bodyClassName="!p-0"
              >
                <div className="px-3 pb-3 pt-1">
                  <FundingMatrix projects={filtered} />
                </div>
              </DashboardWidgetFrame>
            </div>
          </section>

          <section aria-label="Portfolio KPIs" className="pt-2">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Portfolio KPIs</h2>
            <KpiGrid k={k} />
          </section>
        </>
      )}

      {tab === "roadmap" && (
        <div className="space-y-4">
          <HomeOverviewFilters projects={bundle.projects} value={filters} onChange={setFilters} />
          {roadmapSection}
        </div>
      )}

      {tab === "list" && (
        <div className="space-y-4">
          <HomeOverviewFilters projects={bundle.projects} value={filters} onChange={setFilters} />
          <div className="overflow-hidden rounded-xl border border-white/12 bg-zinc-950/40">
            <div className="border-b border-white/10 bg-white/[0.03] px-4 py-3">
              <h2 className="text-sm font-semibold text-zinc-100">Programme list</h2>
              <p className="mt-0.5 text-[11px] text-zinc-500">Filtered register — same columns as roadmap.</p>
            </div>
            <div className="p-3">
              <PortfolioRoadmapTable projects={filtered} />
            </div>
          </div>
          <KpiGrid k={k} />
        </div>
      )}

      <p className="text-xs text-zinc-600">
        <strong className="text-zinc-500">Tip:</strong> Filters apply to the active tab. Data is stored in this browser;
        edit projects under <strong className="text-zinc-400">Data / Admin</strong>.
      </p>
    </div>
  );
}
