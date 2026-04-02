"""Unit tests for health scoring and portfolio KPIs."""

from __future__ import annotations

import pandas as pd

from utils.metrics import compute_portfolio_executive_kpis
from utils.risk_logic import calculate_health_score
from utils.sample_data_generator import generate_sample_data


def test_calculate_health_score_in_range():
    bundle = generate_sample_data(n_projects=8, seed=11)
    out = calculate_health_score(bundle["projects"])
    assert out["health_score"].between(0, 100).all()


def test_compute_portfolio_executive_kpis_empty_projects():
    empty = pd.DataFrame()
    k = compute_portfolio_executive_kpis(empty)
    assert k["n_projects"] == 0
    assert k["total_open_risks"] == 0


def test_compute_portfolio_executive_kpis_with_bundle():
    bundle = generate_sample_data(n_projects=4, seed=7)
    projects = calculate_health_score(bundle["projects"])
    k = compute_portfolio_executive_kpis(projects, bundle["milestones"], bundle["resources"])
    assert k["n_projects"] == 4
    assert k["total_budget_gbp"] > 0
