"""
Create, update, and delete projects in the active session bundle (in-memory portfolio).
Recomputes governance metrics via calculate_health_score after changes.
"""

from __future__ import annotations

import re
from datetime import date, timedelta

import pandas as pd
import streamlit as st

from utils.data_loader import REQUIRED_PROJECT_COLUMNS
from utils.risk_logic import calculate_health_score

_COMPUTED_DROP = {
    "budget_variance",
    "budget_variance_pct",
    "schedule_variance",
    "progress_lag",
    "risk_score",
    "delayed_flag",
    "health_score",
    "rag_health",
}


def _parse_prj_index(project_id: str) -> int:
    m = re.match(r"PRJ-(\d+)$", str(project_id).strip(), re.I)
    return int(m.group(1)) if m else 0


def _milestone_record(
    project_id: str,
    proj_num: int,
    seq: int,
    milestone_name: str,
    due_date: date,
    *,
    today: date | None = None,
) -> dict:
    today = today or date.today()
    due_ts = pd.Timestamp(due_date)
    if due_ts.date() < today:
        status = "Overdue"
        overdue_flag = 1
    else:
        status = "Upcoming"
        overdue_flag = 0
    return {
        "milestone_id": f"MS-{proj_num:03d}-{seq:02d}",
        "project_id": project_id,
        "milestone_name": milestone_name.strip(),
        "due_date": due_ts,
        "completed_date": pd.NaT,
        "status": status,
        "overdue_flag": overdue_flag,
    }


def _resource_record(
    project_id: str,
    proj_num: int,
    seq: int,
    resource_name: str,
    role: str,
    allocation_percent: float,
) -> dict:
    alloc = round(float(allocation_percent), 1)
    avail = max(0.0, round(100.0 - alloc, 1))
    return {
        "resource_id": f"RES-{proj_num:03d}-{seq:02d}",
        "resource_name": resource_name.strip(),
        "role": role.strip(),
        "project_id": project_id,
        "allocation_percent": alloc,
        "available_capacity_percent": avail,
    }


def _placeholder_weekly_updates(project_id: str, proj_num: int, n: int = 2) -> list[dict]:
    """Seed weekly status rows so Weekly Reports has content for new projects."""
    today = date.today()
    achievements = [
        "Governance cadence established; baseline scope confirmed.",
        "Delivery plan aligned with steering committee expectations.",
    ]
    blockers = [
        "No major blockers this week.",
        "Awaiting dependency clarity on one external interface.",
    ]
    next_steps = [
        "Confirm RAID ownership and weekly reporting rhythm.",
        "Progress design decisions ahead of next phase gate.",
    ]
    status_notes = [
        "Delivery confidence moderate while team ramps.",
        "Scope and plan remain in control.",
    ]
    rows: list[dict] = []
    for w in range(n):
        week_date = today - timedelta(days=7 * w)
        rows.append(
            {
                "update_id": f"UPD-{proj_num:03d}-{w+1}",
                "project_id": project_id,
                "reporting_week": pd.Timestamp(week_date),
                "key_achievement": achievements[w % len(achievements)],
                "blocker": blockers[w % len(blockers)],
                "next_step": next_steps[w % len(next_steps)],
                "status_note": status_notes[w % len(status_notes)],
            }
        )
    return rows


def _persist_bundle_state(bundle: dict[str, pd.DataFrame]) -> None:
    st.session_state["data_bundle"] = bundle


def _next_project_id(projects: pd.DataFrame) -> str:
    nums: list[int] = []
    for pid in projects["project_id"].astype(str):
        m = re.match(r"PRJ-(\d+)$", pid.strip(), re.I)
        if m:
            nums.append(int(m.group(1)))
    n = max(nums) + 1 if nums else 1
    return f"PRJ-{n:03d}"


def _strip_computed_for_recompute(projects: pd.DataFrame) -> pd.DataFrame:
    df = projects.copy()
    for c in _COMPUTED_DROP:
        if c in df.columns:
            df = df.drop(columns=[c])
    return df


def persist_projects(bundle: dict[str, pd.DataFrame], projects: pd.DataFrame) -> None:
    """Store recomputed projects and sync session state."""
    bundle["projects"] = calculate_health_score(_strip_computed_for_recompute(projects))
    _persist_bundle_state(bundle)


def add_project(
    bundle: dict[str, pd.DataFrame],
    *,
    project_name: str,
    project_manager: str,
    sponsor: str,
    business_unit: str,
    start_date,
    end_date,
    planned_progress: float,
    actual_progress: float,
    status: str,
    budget: float,
    actual_cost: float,
    priority: str,
    strategic_alignment_score: int,
    roi_score: int,
    urgency_score: int,
    risk_probability: int,
    risk_impact: int,
    open_risks_count: int,
    overdue_milestones: int,
    resource_utilization_percent: float,
    comments: str,
    initial_milestones: list[dict] | None = None,
    initial_resources: list[dict] | None = None,
) -> tuple[bool, str]:
    """
    initial_milestones: each dict has milestone_name (str), due_date (date or datetime-like).
    initial_resources: each dict has resource_name, role, allocation_percent (float).
    """
    projects = bundle["projects"].copy()
    pid = _next_project_id(projects)
    if pid in projects["project_id"].astype(str).values:
        return False, "Could not allocate a unique project ID."

    proj_num = _parse_prj_index(pid)
    today = date.today()
    ms_list: list[dict] = []
    rs_list: list[dict] = []
    for i, m in enumerate(initial_milestones or [], start=1):
        name = str(m.get("milestone_name", f"Milestone {i}")).strip() or f"Milestone {i}"
        due = m.get("due_date")
        if due is None:
            continue
        due_d = pd.Timestamp(due).date()
        ms_list.append(_milestone_record(pid, proj_num, i, name, due_d, today=today))
    for i, r in enumerate(initial_resources or [], start=1):
        rname = str(r.get("resource_name", "")).strip()
        role = str(r.get("role", "Project Analyst")).strip()
        if not rname:
            continue
        alloc = float(r.get("allocation_percent", 50.0))
        rs_list.append(_resource_record(pid, proj_num, i, rname, role, alloc))

    row = {
        "project_id": pid,
        "project_name": project_name.strip(),
        "project_manager": project_manager.strip(),
        "sponsor": sponsor.strip(),
        "business_unit": business_unit.strip(),
        "start_date": pd.Timestamp(start_date),
        "end_date": pd.Timestamp(end_date),
        "planned_progress": float(planned_progress),
        "actual_progress": float(actual_progress),
        "status": status,
        "budget": float(budget),
        "actual_cost": float(actual_cost),
        "priority": priority,
        "strategic_alignment_score": int(strategic_alignment_score),
        "roi_score": int(roi_score),
        "urgency_score": int(urgency_score),
        "risk_probability": int(risk_probability),
        "risk_impact": int(risk_impact),
        "open_risks_count": int(open_risks_count),
        "overdue_milestones": int(overdue_milestones),
        "resource_utilization_percent": float(resource_utilization_percent),
        "comments": comments.strip() or "—",
    }
    projects = pd.concat([projects, pd.DataFrame([row])], ignore_index=True)

    if ms_list:
        mdf = pd.DataFrame(ms_list)
        old_m = bundle.get("milestones", pd.DataFrame())
        bundle["milestones"] = pd.concat([old_m, mdf], ignore_index=True)
    if rs_list:
        rdf = pd.DataFrame(rs_list)
        old_r = bundle.get("resources", pd.DataFrame())
        bundle["resources"] = pd.concat([old_r, rdf], ignore_index=True)

    wu_list = _placeholder_weekly_updates(pid, proj_num, n=2)
    wdf = pd.DataFrame(wu_list)
    old_w = bundle.get("weekly_updates", pd.DataFrame())
    bundle["weekly_updates"] = pd.concat([old_w, wdf], ignore_index=True)

    persist_projects(bundle, projects)
    extra = []
    if ms_list:
        extra.append(f"{len(ms_list)} milestone(s)")
    if rs_list:
        extra.append(f"{len(rs_list)} resource(s)")
    extra.append(f"{len(wu_list)} weekly update(s)")
    suffix = f" ({', '.join(extra)})" if extra else ""
    return True, f"Project **{pid}** created{suffix}."


def delete_projects(bundle: dict[str, pd.DataFrame], project_ids: list[str]) -> tuple[bool, str]:
    if not project_ids:
        return False, "No projects selected."
    pids = set(project_ids)
    projects = bundle["projects"].copy()
    before = len(projects)
    projects = projects[~projects["project_id"].astype(str).isin(pids)]
    if len(projects) == before:
        return False, "No matching projects removed."

    for key in ["milestones", "resources", "weekly_updates"]:
        if key in bundle and not bundle[key].empty and "project_id" in bundle[key].columns:
            bundle[key] = bundle[key][~bundle[key]["project_id"].astype(str).isin(pids)].copy()

    bundle["projects"] = projects
    persist_projects(bundle, bundle["projects"])
    return True, f"Removed {before - len(projects)} project(s)."


def replace_projects_from_editor(bundle: dict[str, pd.DataFrame], edited: pd.DataFrame) -> tuple[bool, str]:
    """Replace portfolio projects table after st.data_editor; IDs must remain unique."""
    projects = bundle["projects"].copy()
    base_cols = [c for c in edited.columns if c in REQUIRED_PROJECT_COLUMNS or c == "comments"]
    edited = edited[base_cols].copy()
    for col in ["start_date", "end_date"]:
        if col in edited.columns:
            edited[col] = pd.to_datetime(edited[col], errors="coerce")

    ids = edited["project_id"].astype(str)
    if ids.duplicated().any():
        return False, "Duplicate project_id values are not allowed."

    if "comments" not in edited.columns and "comments" in projects.columns:
        cmap = projects.set_index("project_id")["comments"].to_dict()
        edited["comments"] = edited["project_id"].astype(str).map(lambda x: cmap.get(x, "—"))

    missing = REQUIRED_PROJECT_COLUMNS - set(edited.columns)
    if missing:
        return False, f"Missing columns: {', '.join(sorted(missing))}"

    persist_projects(bundle, edited)
    return True, "Portfolio table saved."


def _fill_milestone_ids(edited: pd.DataFrame, project_id: str, proj_num: int, taken: set[str]) -> None:
    edited["project_id"] = project_id
    col = edited.columns.get_loc("milestone_id")
    seq = 1
    for i in range(len(edited)):
        v = edited.iat[i, col]
        if pd.isna(v) or str(v).strip() == "":
            while f"MS-{proj_num:03d}-{seq:02d}" in taken:
                seq += 1
            nid = f"MS-{proj_num:03d}-{seq:02d}"
            edited.iat[i, col] = nid
            taken.add(nid)
            seq += 1
        else:
            taken.add(str(v).strip())


def _fill_resource_ids(edited: pd.DataFrame, project_id: str, proj_num: int, taken: set[str]) -> None:
    edited["project_id"] = project_id
    col = edited.columns.get_loc("resource_id")
    seq = 1
    for i in range(len(edited)):
        v = edited.iat[i, col]
        if pd.isna(v) or str(v).strip() == "":
            while f"RES-{proj_num:03d}-{seq:02d}" in taken:
                seq += 1
            nid = f"RES-{proj_num:03d}-{seq:02d}"
            edited.iat[i, col] = nid
            taken.add(nid)
            seq += 1
        else:
            taken.add(str(v).strip())


def replace_milestones_for_project(
    bundle: dict[str, pd.DataFrame], project_id: str, edited: pd.DataFrame
) -> tuple[bool, str]:
    pid = str(project_id)
    proj_num = _parse_prj_index(pid)
    ms_all = bundle.get("milestones", pd.DataFrame())
    rest = ms_all[ms_all["project_id"].astype(str) != pid].copy() if not ms_all.empty else pd.DataFrame()
    taken: set[str] = (
        set(rest["milestone_id"].astype(str).tolist())
        if not rest.empty and "milestone_id" in rest.columns
        else set()
    )

    edited = edited.copy()
    if edited.empty:
        bundle["milestones"] = rest
        _persist_bundle_state(bundle)
        return True, "All milestones removed for this project."

    required = {"milestone_id", "project_id", "milestone_name", "due_date", "status"}
    missing = required - set(edited.columns)
    if missing:
        return False, f"Missing columns: {', '.join(sorted(missing))}"

    edited["milestone_name"] = edited["milestone_name"].apply(lambda x: str(x).strip() or "Milestone")
    edited["status"] = edited["status"].fillna("Upcoming")
    if edited["due_date"].isna().any():
        return False, "Set a due date for every milestone row."

    _fill_milestone_ids(edited, pid, proj_num, taken)

    if edited["milestone_id"].astype(str).duplicated().any():
        return False, "Duplicate milestone_id values in the table."

    for col in ["due_date", "completed_date"]:
        if col in edited.columns:
            edited[col] = pd.to_datetime(edited[col], errors="coerce")
    if "completed_date" not in edited.columns:
        edited["completed_date"] = pd.NaT

    edited["overdue_flag"] = (edited["status"].astype(str) == "Overdue").astype(int)

    bundle["milestones"] = pd.concat([rest, edited], ignore_index=True)
    _persist_bundle_state(bundle)
    return True, "Milestones saved."


def replace_resources_for_project(
    bundle: dict[str, pd.DataFrame], project_id: str, edited: pd.DataFrame
) -> tuple[bool, str]:
    pid = str(project_id)
    proj_num = _parse_prj_index(pid)
    rs_all = bundle.get("resources", pd.DataFrame())
    rest = rs_all[rs_all["project_id"].astype(str) != pid].copy() if not rs_all.empty else pd.DataFrame()
    taken: set[str] = (
        set(rest["resource_id"].astype(str).tolist())
        if not rest.empty and "resource_id" in rest.columns
        else set()
    )

    edited = edited.copy()
    if edited.empty:
        bundle["resources"] = rest
        _persist_bundle_state(bundle)
        return True, "All resources removed for this project."

    required = {"resource_id", "resource_name", "role", "project_id", "allocation_percent"}
    missing = required - set(edited.columns)
    if missing:
        return False, f"Missing columns: {', '.join(sorted(missing))}"

    edited["resource_name"] = edited["resource_name"].apply(lambda x: str(x).strip())
    if (edited["resource_name"] == "").any():
        return False, "Resource name cannot be empty."
    edited["role"] = edited["role"].fillna("Project Analyst")

    _fill_resource_ids(edited, pid, proj_num, taken)

    if edited["resource_id"].astype(str).duplicated().any():
        return False, "Duplicate resource_id values in the table."

    edited["allocation_percent"] = pd.to_numeric(edited["allocation_percent"], errors="coerce").fillna(0.0).round(1)
    edited["available_capacity_percent"] = (100.0 - edited["allocation_percent"]).clip(lower=0.0).round(1)

    bundle["resources"] = pd.concat([rest, edited], ignore_index=True)
    _persist_bundle_state(bundle)
    return True, "Resources saved."
