"""
Portfolio-level KPI calculations for executive dashboards.

Uses standard PMO interpretations:
- SPI: schedule performance vs baseline pace (simplified index).
- CPI: cost performance (earned value style using % complete × budget / actual cost).
- Budget-weighted % complete: spend-weighted view of physical progress.
- Resource utilisation: project-level intensity plus named-resource allocation rollups.
"""

from __future__ import annotations

import numpy as np
import pandas as pd


def compute_portfolio_executive_kpis(
    projects: pd.DataFrame,
    milestones: pd.DataFrame | None = None,
    resources: pd.DataFrame | None = None,
) -> dict[str, float | int]:
    """Return a dict of display-ready portfolio KPIs. Projects must include core metric columns."""
    p = projects.copy()
    n = int(p.shape[0])
    if n == 0:
        return _empty_kpis()

    total_budget = float(p["budget"].sum())
    total_spend = float(p["actual_cost"].sum())
    variance_gbp = total_spend - total_budget

    # --- Time / schedule ---
    avg_schedule_variance_pp = float(p["schedule_variance"].mean())
    # SPI: average ratio of actual pace to planned pace (1.0 = on baseline)
    planned_safe = p["planned_progress"].replace(0, np.nan).clip(lower=0.1)
    spi = float((p["actual_progress"] / planned_safe).mean())

    # % of projects within ~1 week of planned pace (schedule_variance >= -2 pp)
    on_schedule_rate = float((p["schedule_variance"] >= -2.0).sum() / n * 100.0)

    # --- % work done ---
    avg_pct_complete = float(p["actual_progress"].mean())
    if total_budget > 0:
        budget_weighted_pct_complete = float((p["budget"] * p["actual_progress"] / 100.0).sum() / total_budget * 100.0)
    else:
        budget_weighted_pct_complete = avg_pct_complete

    # --- Budget / cost ---
    budget_utilisation_pct = float(total_spend / total_budget * 100.0) if total_budget > 0 else 0.0
    budget_variance_pct = float(variance_gbp / total_budget * 100.0) if total_budget > 0 else 0.0

    # CPI = EV / AC where EV ≈ budget × % complete (sum across projects)
    ev_gbp = float((p["budget"] * p["actual_progress"] / 100.0).sum())
    cpi = float(ev_gbp / total_spend) if total_spend > 0 else float("nan")

    # --- Risk & governance ---
    avg_health = float(p["health_score"].mean())
    total_open_risks = int(p["open_risks_count"].sum())
    overdue_milestones = int(milestones["overdue_flag"].sum()) if milestones is not None and not milestones.empty else 0

    on_track = int((p["status"] == "On Track").sum())
    at_risk = int((p["status"] == "At Risk").sum())
    delayed = int((p["status"] == "Delayed").sum())
    exception_rate_pct = float((p["status"] != "On Track").sum() / n * 100.0)

    # --- Resource & capacity (project-level util + named-resource allocation) ---
    avg_resource_utilization_pct = float(p["resource_utilization_percent"].mean())
    pct_projects_overallocated = float((p["resource_utilization_percent"] > 100).sum() / n * 100.0)
    avg_resource_overrun_pp = float((p["resource_utilization_percent"] - 100).clip(lower=0).mean())

    named_resources_overallocated_count = 0
    avg_named_resource_load_pct = float("nan")
    named_resources_count = 0
    if resources is not None and not resources.empty and "resource_name" in resources.columns and "allocation_percent" in resources.columns:
        by_person = resources.groupby("resource_name", as_index=False)["allocation_percent"].sum()
        named_resources_count = int(by_person.shape[0])
        named_resources_overallocated_count = int((by_person["allocation_percent"] > 100).sum())
        avg_named_resource_load_pct = float(by_person["allocation_percent"].mean())

    return {
        "n_projects": n,
        "on_track": on_track,
        "at_risk": at_risk,
        "delayed": delayed,
        "avg_pct_complete": avg_pct_complete,
        "budget_weighted_pct_complete": budget_weighted_pct_complete,
        "avg_schedule_variance_pp": avg_schedule_variance_pp,
        "spi": spi,
        "on_schedule_rate_pct": on_schedule_rate,
        "total_budget_gbp": total_budget,
        "total_spend_gbp": total_spend,
        "variance_gbp": variance_gbp,
        "budget_utilisation_pct": budget_utilisation_pct,
        "budget_variance_pct": budget_variance_pct,
        "cpi": cpi,
        "avg_health": avg_health,
        "total_open_risks": total_open_risks,
        "overdue_milestones": overdue_milestones,
        "exception_rate_pct": exception_rate_pct,
        "avg_resource_utilization_pct": avg_resource_utilization_pct,
        "pct_projects_overallocated": pct_projects_overallocated,
        "named_resources_overallocated_count": named_resources_overallocated_count,
        "avg_named_resource_load_pct": avg_named_resource_load_pct,
        "named_resources_count": named_resources_count,
        "avg_resource_overrun_pp": avg_resource_overrun_pp,
    }


def _empty_kpis() -> dict[str, float | int]:
    return {
        "n_projects": 0,
        "on_track": 0,
        "at_risk": 0,
        "delayed": 0,
        "avg_pct_complete": 0.0,
        "budget_weighted_pct_complete": 0.0,
        "avg_schedule_variance_pp": 0.0,
        "spi": float("nan"),
        "on_schedule_rate_pct": 0.0,
        "total_budget_gbp": 0.0,
        "total_spend_gbp": 0.0,
        "variance_gbp": 0.0,
        "budget_utilisation_pct": 0.0,
        "budget_variance_pct": 0.0,
        "cpi": float("nan"),
        "avg_health": 0.0,
        "total_open_risks": 0,
        "overdue_milestones": 0,
        "exception_rate_pct": 0.0,
        "avg_resource_utilization_pct": 0.0,
        "pct_projects_overallocated": 0.0,
        "named_resources_overallocated_count": 0,
        "avg_named_resource_load_pct": float("nan"),
        "named_resources_count": 0,
        "avg_resource_overrun_pp": 0.0,
    }
