import type { DataBundle, ExecutiveKpis, MilestoneRow, ProjectRow, ResourceRow } from "./types";

function num(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  return fallback;
}

function emptyKpis(): ExecutiveKpis {
  return {
    n_projects: 0,
    on_track: 0,
    at_risk: 0,
    delayed: 0,
    avg_pct_complete: 0,
    budget_weighted_pct_complete: 0,
    avg_schedule_variance_pp: 0,
    spi: NaN,
    on_schedule_rate_pct: 0,
    total_budget_gbp: 0,
    total_spend_gbp: 0,
    variance_gbp: 0,
    budget_utilisation_pct: 0,
    budget_variance_pct: 0,
    cpi: NaN,
    avg_health: 0,
    total_open_risks: 0,
    overdue_milestones: 0,
    exception_rate_pct: 0,
    avg_resource_utilization_pct: 0,
    pct_projects_overallocated: 0,
    named_resources_overallocated_count: 0,
    avg_named_resource_load_pct: NaN,
    named_resources_count: 0,
    avg_resource_overrun_pp: 0,
  };
}

/** Mirrors utils/metrics.py compute_portfolio_executive_kpis */
export function computePortfolioExecutiveKpis(
  projects: ProjectRow[],
  milestones: MilestoneRow[] | null | undefined,
  resources: ResourceRow[] | null | undefined
): ExecutiveKpis {
  const n = projects.length;
  if (n === 0) return emptyKpis();

  let totalBudget = 0;
  let totalSpend = 0;
  let sumScheduleVar = 0;
  let sumSpiTerm = 0;
  let onScheduleCount = 0;
  let sumActualProgress = 0;
  let budgetWeightedNumerator = 0;
  let evGbp = 0;
  let sumHealth = 0;
  let sumOpenRisks = 0;
  let onTrack = 0;
  let atRisk = 0;
  let delayed = 0;
  let sumResUtil = 0;
  let over100Count = 0;
  let sumOverrun = 0;

  for (const p of projects) {
    const budget = num(p.budget);
    const actualCost = num(p.actual_cost);
    const planned = num(p.planned_progress);
    const actual = num(p.actual_progress);
    totalBudget += budget;
    totalSpend += actualCost;
    const schedVar = num(p.schedule_variance, actual - planned);
    sumScheduleVar += schedVar;
    const plannedSafe = Math.max(planned, 0.1);
    sumSpiTerm += actual / plannedSafe;
    if (schedVar >= -2) onScheduleCount += 1;
    sumActualProgress += actual;
    budgetWeightedNumerator += (budget * actual) / 100;
    evGbp += (budget * actual) / 100;
    sumHealth += num(p.health_score);
    sumOpenRisks += num(p.open_risks_count);
    const st = p.status;
    if (st === "On Track") onTrack += 1;
    else if (st === "At Risk") atRisk += 1;
    else if (st === "Delayed") delayed += 1;
    const ru = num(p.resource_utilization_percent);
    sumResUtil += ru;
    if (ru > 100) over100Count += 1;
    sumOverrun += Math.max(ru - 100, 0);
  }

  const varianceGbp = totalSpend - totalBudget;
  const avgScheduleVariancePp = sumScheduleVar / n;
  const spi = sumSpiTerm / n;
  const onScheduleRatePct = (onScheduleCount / n) * 100;
  const avgPctComplete = sumActualProgress / n;
  const budgetWeightedPctComplete =
    totalBudget > 0 ? (budgetWeightedNumerator / totalBudget) * 100 : avgPctComplete;
  const budgetUtilisationPct = totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0;
  const budgetVariancePct = totalBudget > 0 ? (varianceGbp / totalBudget) * 100 : 0;
  const cpi = totalSpend > 0 ? evGbp / totalSpend : NaN;
  const avgHealth = sumHealth / n;
  const exceptionRatePct = ((n - onTrack) / n) * 100;
  const avgResourceUtilizationPct = sumResUtil / n;
  const pctProjectsOverallocated = (over100Count / n) * 100;
  const avgResourceOverrunPp = sumOverrun / n;

  let overdueMilestones = 0;
  if (milestones && milestones.length > 0) {
    overdueMilestones = milestones.reduce((acc, m) => acc + (num(m.overdue_flag) ? 1 : 0), 0);
  }

  let namedResourcesOverallocatedCount = 0;
  let namedResourcesCount = 0;
  let avgNamedResourceLoadPct = NaN;
  if (resources && resources.length > 0) {
    const byPerson = new Map<string, number>();
    for (const r of resources) {
      const name = r.resource_name;
      const alloc = num(r.allocation_percent);
      if (typeof name !== "string" || !name) continue;
      byPerson.set(name, (byPerson.get(name) ?? 0) + alloc);
    }
    namedResourcesCount = byPerson.size;
    if (namedResourcesCount > 0) {
      let sumAlloc = 0;
      let overAlloc = 0;
      for (const v of Array.from(byPerson.values())) {
        sumAlloc += v;
        if (v > 100) overAlloc += 1;
      }
      namedResourcesOverallocatedCount = overAlloc;
      avgNamedResourceLoadPct = sumAlloc / namedResourcesCount;
    }
  }

  return {
    n_projects: n,
    on_track: onTrack,
    at_risk: atRisk,
    delayed: delayed,
    avg_pct_complete: avgPctComplete,
    budget_weighted_pct_complete: budgetWeightedPctComplete,
    avg_schedule_variance_pp: avgScheduleVariancePp,
    spi,
    on_schedule_rate_pct: onScheduleRatePct,
    total_budget_gbp: totalBudget,
    total_spend_gbp: totalSpend,
    variance_gbp: varianceGbp,
    budget_utilisation_pct: budgetUtilisationPct,
    budget_variance_pct: budgetVariancePct,
    cpi,
    avg_health: avgHealth,
    total_open_risks: Math.round(sumOpenRisks),
    overdue_milestones: overdueMilestones,
    exception_rate_pct: exceptionRatePct,
    avg_resource_utilization_pct: avgResourceUtilizationPct,
    pct_projects_overallocated: pctProjectsOverallocated,
    named_resources_overallocated_count: namedResourcesOverallocatedCount,
    avg_named_resource_load_pct: avgNamedResourceLoadPct,
    named_resources_count: namedResourcesCount,
    avg_resource_overrun_pp: avgResourceOverrunPp,
  };
}

export function getBundleKpis(bundle: DataBundle) {
  return computePortfolioExecutiveKpis(bundle.projects, bundle.milestones, bundle.resources);
}
