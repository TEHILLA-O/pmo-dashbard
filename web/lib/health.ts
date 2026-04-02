import type { ProjectRow } from "./types";

/** Mirrors utils/risk_logic.py for client-side recomputation after edits. */
export function recalculateProjectMetrics(p: ProjectRow): ProjectRow {
  const budget = Number(p.budget);
  const actualCost = Number(p.actual_cost);
  const planned = Number(p.planned_progress);
  const actual = Number(p.actual_progress);
  const budget_variance = actualCost - budget;
  const budget_variance_pct = budget > 0 ? budget_variance / budget : 0;
  const schedule_variance = actual - planned;
  const progress_lag = Math.max(planned - actual, 0);
  const riskProb = Number(p.risk_probability ?? 0);
  const riskImp = Number(p.risk_impact ?? 0);
  const risk_score = riskProb * riskImp;
  const todayISO = new Date().toISOString().slice(0, 10);
  const endRaw = String(p.end_date ?? "").slice(0, 10);
  const overdueM = Number(p.overdue_milestones ?? 0);
  const delayed_flag =
    overdueM > 0 || (endRaw.length >= 10 && endRaw < todayISO && actual < 100) ? 1 : 0;

  const schedule_penalty = (Math.min(Math.max(progress_lag, 0), 30) / 30) * 25;
  const budget_penalty = (Math.min(Math.max(budget_variance_pct, 0), 0.5) / 0.5) * 25;
  const milestone_penalty = (Math.min(Math.max(overdueM, 0), 5) / 5) * 15;
  const resUtil = Number(p.resource_utilization_percent ?? 0);
  const resource_penalty = (Math.min(Math.max(resUtil - 100, 0), 40) / 40) * 15;
  const openRisks = Number(p.open_risks_count ?? 0);
  const risks_penalty = (Math.min(Math.max(openRisks, 0), 12) / 12) * 10;
  const lag_penalty = (Math.min(Math.max(progress_lag, 0), 40) / 40) * 10;
  const total =
    schedule_penalty +
    budget_penalty +
    milestone_penalty +
    resource_penalty +
    risks_penalty +
    lag_penalty;
  const health_score = Math.round(Math.min(Math.max(100 - total, 0), 100) * 10) / 10;
  let rag_health = "Green";
  if (health_score <= 59) rag_health = "Red";
  else if (health_score <= 79) rag_health = "Amber";

  return {
    ...p,
    budget_variance,
    budget_variance_pct,
    schedule_variance,
    progress_lag,
    risk_score,
    delayed_flag,
    health_score,
    rag_health,
  };
}

export function recalculateAllProjects(projects: ProjectRow[]): ProjectRow[] {
  return projects.map(recalculateProjectMetrics);
}
