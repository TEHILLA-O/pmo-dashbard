"""Tests for project_admin session mutations (mocked Streamlit state)."""

from __future__ import annotations

from datetime import date
from unittest.mock import patch

from utils.risk_logic import calculate_health_score
from utils.sample_data_generator import generate_sample_data


@patch("utils.project_admin.st")
def test_add_project_appends_weekly_updates(mock_st):
    mock_st.session_state = {}
    from utils import project_admin

    bundle = generate_sample_data(n_projects=2, seed=21)
    bundle["projects"] = calculate_health_score(bundle["projects"])
    before_projects = len(bundle["projects"])
    before_wu = len(bundle["weekly_updates"])

    ok, msg = project_admin.add_project(
        bundle,
        project_name="New initiative",
        project_manager="Alex Case",
        sponsor="COO",
        business_unit="Technology",
        start_date=date(2025, 3, 1),
        end_date=date(2026, 6, 1),
        planned_progress=15.0,
        actual_progress=10.0,
        status="On Track",
        budget=250_000.0,
        actual_cost=100_000.0,
        priority="High",
        strategic_alignment_score=72,
        roi_score=68,
        urgency_score=65,
        risk_probability=2,
        risk_impact=2,
        open_risks_count=1,
        overdue_milestones=0,
        resource_utilization_percent=75.0,
        comments="Test create",
        initial_milestones=[],
        initial_resources=[],
    )
    assert ok
    assert "weekly" in msg.lower() or "created" in msg.lower()
    saved = mock_st.session_state["data_bundle"]
    assert len(saved["weekly_updates"]) == before_wu + 2
    assert len(saved["projects"]) == before_projects + 1


@patch("utils.project_admin.st")
def test_replace_milestones_for_project(mock_st):
    mock_st.session_state = {}
    from utils import project_admin

    bundle = generate_sample_data(n_projects=2, seed=22)
    bundle["projects"] = calculate_health_score(bundle["projects"])
    pid = str(bundle["projects"].iloc[0]["project_id"])
    ms = bundle["milestones"][bundle["milestones"]["project_id"].astype(str) == pid].copy()

    ok, msg = project_admin.replace_milestones_for_project(bundle, pid, ms)
    assert ok
    assert mock_st.session_state["data_bundle"]["milestones"] is not None
