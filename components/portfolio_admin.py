"""Home-page portfolio CRUD: create, edit, and delete projects (session state)."""

from __future__ import annotations

from datetime import date, timedelta

import pandas as pd
import streamlit as st

from utils.data_loader import get_active_data_bundle, reset_session_to_sample_bundle
from utils.project_admin import (
    _COMPUTED_DROP,
    add_project,
    delete_projects,
    replace_milestones_for_project,
    replace_projects_from_editor,
    replace_resources_for_project,
)

_EDIT_ORDER = [
    "project_id",
    "project_name",
    "project_manager",
    "sponsor",
    "business_unit",
    "start_date",
    "end_date",
    "planned_progress",
    "actual_progress",
    "status",
    "budget",
    "actual_cost",
    "priority",
    "strategic_alignment_score",
    "roi_score",
    "urgency_score",
    "risk_probability",
    "risk_impact",
    "open_risks_count",
    "overdue_milestones",
    "resource_utilization_percent",
    "comments",
]

_STATUS_OPTIONS = ["On Track", "At Risk", "Delayed"]
_PRIORITY_OPTIONS = ["High", "Medium", "Low"]

_RESOURCE_ROLES = [
    "Business Analyst",
    "Project Analyst",
    "Project Support Officer",
    "PMO Analyst",
    "Delivery Manager",
    "Data Analyst",
    "Change Manager",
]

_MILESTONE_STATUS = ["Upcoming", "Overdue", "Completed"]


def _spread_milestone_due(start: date, end: date, i: int, n: int) -> date:
    if n <= 0:
        return start
    span = max((end - start).days, 1)
    step = span / (n + 1)
    return start + timedelta(days=int(step * (i + 1)))


def render_portfolio_admin_section() -> None:
    bundle = get_active_data_bundle()
    projects = bundle["projects"]
    milestones = bundle.get("milestones", pd.DataFrame())
    resources = bundle.get("resources", pd.DataFrame())

    st.markdown("##### Portfolio data")
    h1, h2 = st.columns([4, 1])
    with h1:
        st.caption(
            "Create projects, edit the portfolio table, or remove projects. "
            "Session-only until you upload a file — or reset to the built-in sample portfolio."
        )
    with h2:
        if st.button("Reset sample data", help="Restore the default demo portfolio (discards in-session edits)."):
            reset_session_to_sample_bundle()
            st.rerun()

    t_create, t_edit, t_delete, t_linked = st.tabs(
        ["Create project", "Edit & save", "Delete projects", "Milestones & resources"]
    )

    with t_create:
        with st.form("create_project_form", clear_on_submit=True):
            c1, c2 = st.columns(2)
            with c1:
                project_name = st.text_input("Project name", placeholder="e.g. Customer portal phase 2")
                project_manager = st.text_input("Project manager")
                sponsor = st.text_input("Sponsor")
                business_unit = st.text_input("Business unit")
            with c2:
                start_date = st.date_input("Start date")
                end_date = st.date_input("End date")
                status = st.selectbox("Status", _STATUS_OPTIONS, index=0)
                priority = st.selectbox("Priority", _PRIORITY_OPTIONS, index=1)

            c3, c4 = st.columns(2)
            with c3:
                planned_progress = st.slider("Planned progress %", 0.0, 100.0, 25.0, 0.5)
                actual_progress = st.slider("Actual progress %", 0.0, 100.0, 20.0, 0.5)
                budget = st.number_input("Budget (£)", min_value=0.0, value=500_000.0, step=10_000.0)
                actual_cost = st.number_input("Actual cost (£)", min_value=0.0, value=400_000.0, step=10_000.0)
            with c4:
                strategic_alignment_score = st.slider("Strategic alignment (50–100)", 50, 100, 75)
                roi_score = st.slider("ROI score (45–100)", 45, 100, 70)
                urgency_score = st.slider("Urgency score (40–100)", 40, 100, 65)
                resource_utilization_percent = st.slider("Resource utilisation %", 0.0, 150.0, 85.0, 0.5)

            st.markdown("**Risk & delivery signals**")
            r1, r2, r3 = st.columns(3)
            with r1:
                risk_probability = st.slider("Risk probability (1–5)", 1, 5, 3)
                risk_impact = st.slider("Risk impact (1–5)", 1, 5, 3)
            with r2:
                open_risks_count = st.number_input("Open risks count", min_value=0, value=2, step=1)
                overdue_milestones = st.number_input("Overdue milestones", min_value=0, value=0, step=1)
            with r3:
                comments = st.text_area("Comments", placeholder="Short status note", height=80)

            st.markdown("**Initial milestones**")
            st.caption("Creates milestone rows linked to this project (Portfolio / Risk views).")
            n_milestones = st.number_input("Number of milestones to add", min_value=0, max_value=12, value=2, step=1)
            initial_milestones: list[dict] = []
            for mi in range(n_milestones):
                d1, d2 = st.columns(2)
                default_due = _spread_milestone_due(start_date, end_date, mi, n_milestones)
                with d1:
                    mn = st.text_input(
                        f"Milestone {mi + 1} name",
                        value=f"Gate {mi + 1}",
                        key=f"create_m_name_{mi}",
                    )
                with d2:
                    md = st.date_input(
                        f"Milestone {mi + 1} due date",
                        value=default_due,
                        key=f"create_m_due_{mi}",
                    )
                initial_milestones.append({"milestone_name": mn, "due_date": md})

            st.markdown("**Initial resources**")
            st.caption("Named people and allocation % for Resource Allocation views.")
            n_resources = st.number_input("Number of resources to add", min_value=0, max_value=12, value=2, step=1)
            initial_resources: list[dict] = []
            for ri in range(n_resources):
                a1, a2, a3 = st.columns(3)
                with a1:
                    rn = st.text_input(f"Resource {ri + 1} name", key=f"create_r_name_{ri}")
                with a2:
                    rr = st.selectbox(
                        f"Resource {ri + 1} role",
                        _RESOURCE_ROLES,
                        index=min(ri, len(_RESOURCE_ROLES) - 1),
                        key=f"create_r_role_{ri}",
                    )
                with a3:
                    ra = st.slider(
                        f"Allocation % ({ri + 1})",
                        0.0,
                        150.0,
                        50.0 + ri * 5.0,
                        1.0,
                        key=f"create_r_alloc_{ri}",
                    )
                initial_resources.append(
                    {"resource_name": rn, "role": rr, "allocation_percent": ra}
                )

            submitted = st.form_submit_button("Create project", type="primary")
            if submitted:
                if not project_name or not project_manager.strip():
                    st.error("Project name and project manager are required.")
                else:
                    # Only include resources with a name (skip empty rows)
                    res_payload = [r for r in initial_resources if str(r.get("resource_name", "")).strip()]
                    ok, msg = add_project(
                        bundle,
                        project_name=project_name,
                        project_manager=project_manager,
                        sponsor=sponsor or "TBD",
                        business_unit=business_unit or "General",
                        start_date=start_date,
                        end_date=end_date,
                        planned_progress=planned_progress,
                        actual_progress=actual_progress,
                        status=status,
                        budget=budget,
                        actual_cost=actual_cost,
                        priority=priority,
                        strategic_alignment_score=strategic_alignment_score,
                        roi_score=roi_score,
                        urgency_score=urgency_score,
                        risk_probability=risk_probability,
                        risk_impact=risk_impact,
                        open_risks_count=open_risks_count,
                        overdue_milestones=overdue_milestones,
                        resource_utilization_percent=resource_utilization_percent,
                        comments=comments,
                        initial_milestones=initial_milestones,
                        initial_resources=res_payload,
                    )
                    if ok:
                        st.success(msg)
                        st.rerun()
                    else:
                        st.error(msg)

    with t_edit:
        cols = [c for c in _EDIT_ORDER if c in projects.columns and c not in _COMPUTED_DROP]
        extra = [c for c in projects.columns if c not in cols and c not in _COMPUTED_DROP]
        display_cols = cols + [c for c in extra if c == "comments"]
        edit_df = projects[display_cols].copy()

        st.caption("Edit cells below, then click **Save portfolio changes**. Project ID cannot be changed here.")

        column_config = {
            "project_id": st.column_config.TextColumn("Project ID", disabled=True, width="small"),
            "project_name": st.column_config.TextColumn("Name", width="medium"),
            "status": st.column_config.SelectboxColumn("Status", options=_STATUS_OPTIONS),
            "priority": st.column_config.SelectboxColumn("Priority", options=_PRIORITY_OPTIONS),
            "comments": st.column_config.TextColumn("Comments", width="large"),
        }

        edited = st.data_editor(
            edit_df,
            column_config=column_config,
            num_rows="fixed",
            use_container_width=True,
            hide_index=True,
            height=420,
            key="portfolio_projects_editor",
        )

        if st.button("Save portfolio changes", type="primary", key="save_portfolio_editor"):
            ok, msg = replace_projects_from_editor(bundle, edited)
            if ok:
                st.success(msg)
                st.rerun()
            else:
                st.error(msg)

    with t_delete:
        ids = projects["project_id"].astype(str).tolist()
        chosen = st.multiselect(
            "Projects to remove",
            options=ids,
            default=[],
            help="Removes matching milestones, resource rows, and weekly updates for those projects.",
        )
        st.warning("This cannot be undone in the session except by reloading the app (restores sample data).")
        if st.button("Delete selected projects", type="primary", disabled=not chosen, key="delete_projects_btn"):
            ok, msg = delete_projects(bundle, chosen)
            if ok:
                st.success(msg)
                st.rerun()
            else:
                st.error(msg)

    with t_linked:
        st.caption("Edit milestones and named resources for one project. Add rows with **+** in the table; new IDs are assigned on save.")
        pid_options = projects["project_id"].astype(str).tolist()
        if not pid_options:
            st.info("No projects in the portfolio yet.")
        else:
            project_sel = st.selectbox("Project", options=pid_options, key="manage_linked_project")
            ms_tab, rs_tab = st.tabs(["Milestones", "Resources"])

            base_m = [
                "milestone_id",
                "project_id",
                "milestone_name",
                "due_date",
                "completed_date",
                "status",
            ]
            with ms_tab:
                if milestones.empty:
                    ms_df = pd.DataFrame(columns=base_m)
                    cols_m = base_m
                else:
                    cols_m = [c for c in base_m if c in milestones.columns]
                    ms_df = milestones.loc[milestones["project_id"].astype(str) == project_sel, cols_m].copy()

                st.markdown("**Milestones**")
                if milestones.empty:
                    st.info("No milestone data in this portfolio yet. Create a project with milestones, or add rows below.")
                elif ms_df.empty:
                    st.info("No milestones for this project yet. Add rows with the **+** button below.")

                ms_cfg = {
                    "milestone_id": st.column_config.TextColumn("ID", help="Leave blank on new rows to auto-assign."),
                    "project_id": st.column_config.TextColumn("Project", disabled=True),
                    "status": st.column_config.SelectboxColumn("Status", options=_MILESTONE_STATUS),
                    "due_date": st.column_config.DateColumn("Due"),
                    "completed_date": st.column_config.DateColumn("Completed"),
                }
                edited_ms = st.data_editor(
                    ms_df,
                    column_config=ms_cfg,
                    num_rows="dynamic",
                    use_container_width=True,
                    hide_index=True,
                    height=320,
                    key=f"editor_ms_{project_sel}",
                )
                if st.button("Save milestones", type="primary", key=f"save_ms_{project_sel}"):
                    ok, msg = replace_milestones_for_project(bundle, project_sel, edited_ms)
                    if ok:
                        st.success(msg)
                        st.rerun()
                    else:
                        st.error(msg)

            base_r = [
                "resource_id",
                "project_id",
                "resource_name",
                "role",
                "allocation_percent",
                "available_capacity_percent",
            ]
            with rs_tab:
                if resources.empty:
                    rs_df = pd.DataFrame(columns=base_r)
                else:
                    cols_r = [c for c in base_r if c in resources.columns]
                    rs_df = resources.loc[resources["project_id"].astype(str) == project_sel, cols_r].copy()

                st.markdown("**Resources**")
                if resources.empty:
                    st.info("No resource data in this portfolio yet. Create a project with resources, or add rows below.")
                elif rs_df.empty:
                    st.info("No resources for this project yet. Add rows with the **+** button below.")

                rs_cfg = {
                    "resource_id": st.column_config.TextColumn("ID", help="Leave blank on new rows to auto-assign."),
                    "project_id": st.column_config.TextColumn("Project", disabled=True),
                    "role": st.column_config.SelectboxColumn("Role", options=_RESOURCE_ROLES),
                    "allocation_percent": st.column_config.NumberColumn("Allocation %", min_value=0.0, max_value=200.0, format="%.1f"),
                    "available_capacity_percent": st.column_config.NumberColumn("Available %", disabled=True, format="%.1f"),
                }
                edited_rs = st.data_editor(
                    rs_df,
                    column_config=rs_cfg,
                    num_rows="dynamic",
                    use_container_width=True,
                    hide_index=True,
                    height=320,
                    key=f"editor_rs_{project_sel}",
                )
                if st.button("Save resources", type="primary", key=f"save_rs_{project_sel}"):
                    ok, msg = replace_resources_for_project(bundle, project_sel, edited_rs)
                    if ok:
                        st.success(msg)
                        st.rerun()
                    else:
                        st.error(msg)
