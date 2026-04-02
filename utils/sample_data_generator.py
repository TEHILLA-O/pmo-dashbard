from __future__ import annotations

from datetime import date, timedelta
import random
import numpy as np
import pandas as pd


PROJECT_MANAGERS = [
    "Amelia Patel",
    "Thomas Reed",
    "Priya Nair",
    "Daniel Hughes",
    "Sophie Clarke",
    "James Walker",
    "Maya Shah",
    "Owen Bennett",
]

SPONSORS = [
    "CFO",
    "COO",
    "Director of Transformation",
    "Head of Operations",
    "Head of Technology",
    "Head of Customer Services",
]

BUSINESS_UNITS = [
    "Technology",
    "Operations",
    "Finance",
    "Customer Experience",
    "Compliance",
    "Commercial",
]

RESOURCE_ROLES = [
    "Business Analyst",
    "Project Analyst",
    "Project Support Officer",
    "PMO Analyst",
    "Delivery Manager",
    "Data Analyst",
    "Change Manager",
]


def _status_from_signals(progress_gap: float, budget_var_pct: float, risk_score: float, overdue: int) -> str:
    if overdue >= 3 or progress_gap > 20 or budget_var_pct > 0.20 or risk_score >= 16:
        return "Delayed"
    if overdue >= 1 or progress_gap > 10 or budget_var_pct > 0.10 or risk_score >= 9:
        return "At Risk"
    return "On Track"


def generate_sample_data(n_projects: int = 35, seed: int = 42) -> dict[str, pd.DataFrame]:
    random.seed(seed)
    np.random.seed(seed)

    today = date.today()
    project_records = []
    milestone_records = []
    resource_records = []
    weekly_records = []

    for i in range(1, n_projects + 1):
        project_id = f"PRJ-{i:03d}"
        project_name = f"Workstream {i:02d} - {random.choice(['Platform Modernisation', 'Process Optimisation', 'Regulatory Readiness', 'Data Enhancement', 'Customer Journey Improvement'])}"

        start_offset = random.randint(180, 720)
        duration_days = random.randint(180, 540)
        start_date = today - timedelta(days=start_offset)
        end_date = start_date + timedelta(days=duration_days)

        elapsed = (today - start_date).days
        planned_progress = float(np.clip((elapsed / max(duration_days, 1)) * 100, 0, 100))
        actual_progress = float(np.clip(planned_progress + np.random.normal(-4, 12), 0, 100))

        budget = float(np.random.randint(180_000, 2_600_000))
        actual_cost = float(budget * np.random.uniform(0.72, 1.28) * (max(actual_progress, 8) / 100 + 0.2))

        risk_probability = int(np.random.randint(1, 6))
        risk_impact = int(np.random.randint(1, 6))
        risk_score = risk_probability * risk_impact

        open_risks_count = int(np.random.randint(0, 11))
        overdue_milestones = int(np.random.randint(0, 5))
        resource_util = float(np.random.uniform(55, 130))

        budget_variance = actual_cost - budget
        budget_var_pct = budget_variance / budget if budget else 0
        progress_gap = planned_progress - actual_progress
        status = _status_from_signals(progress_gap, budget_var_pct, float(risk_score), overdue_milestones)

        priority = random.choice(["High", "Medium", "Low"])

        project_records.append(
            {
                "project_id": project_id,
                "project_name": project_name,
                "project_manager": random.choice(PROJECT_MANAGERS),
                "sponsor": random.choice(SPONSORS),
                "business_unit": random.choice(BUSINESS_UNITS),
                "start_date": pd.to_datetime(start_date),
                "end_date": pd.to_datetime(end_date),
                "planned_progress": round(planned_progress, 1),
                "actual_progress": round(actual_progress, 1),
                "status": status,
                "budget": round(budget, 2),
                "actual_cost": round(actual_cost, 2),
                "priority": priority,
                "strategic_alignment_score": int(np.random.randint(50, 100)),
                "roi_score": int(np.random.randint(45, 100)),
                "urgency_score": int(np.random.randint(40, 100)),
                "risk_probability": risk_probability,
                "risk_impact": risk_impact,
                "open_risks_count": open_risks_count,
                "overdue_milestones": overdue_milestones,
                "resource_utilization_percent": round(resource_util, 1),
                "comments": random.choice(
                    [
                        "Governance cadence stable; monitor dependency risk.",
                        "Supplier timeline requires close tracking.",
                        "Scope fully baselined; focus on benefits capture.",
                        "Resourcing pressure in data engineering capability.",
                        "Awaiting steering committee sign-off for phase gate.",
                    ]
                ),
            }
        )

        for m in range(1, random.randint(4, 8)):
            due = start_date + timedelta(days=int((duration_days / 6) * m + np.random.randint(-20, 20)))
            complete_probability = np.random.rand()
            completed_date = None
            milestone_status = "Upcoming"
            overdue_flag = 0

            if due <= today:
                if complete_probability > 0.23:
                    completed_date = due + timedelta(days=int(np.random.randint(-10, 18)))
                    milestone_status = "Completed"
                else:
                    milestone_status = "Overdue"
                    overdue_flag = 1

            milestone_records.append(
                {
                    "milestone_id": f"MS-{i:03d}-{m:02d}",
                    "project_id": project_id,
                    "milestone_name": f"Milestone {m}",
                    "due_date": pd.to_datetime(due),
                    "completed_date": pd.to_datetime(completed_date) if completed_date else pd.NaT,
                    "status": milestone_status,
                    "overdue_flag": overdue_flag,
                }
            )

        resources_in_project = random.randint(3, 8)
        for r in range(resources_in_project):
            alloc = float(np.random.uniform(30, 120))
            available = max(0.0, round(100 - alloc, 1))
            resource_records.append(
                {
                    "resource_id": f"RES-{i:03d}-{r+1:02d}",
                    "resource_name": f"{random.choice(['Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Riley', 'Casey', 'Jamie'])} {random.choice(['Wilson', 'Cooper', 'Brown', 'White', 'Davies', 'Lewis'])}",
                    "role": random.choice(RESOURCE_ROLES),
                    "project_id": project_id,
                    "allocation_percent": round(alloc, 1),
                    "available_capacity_percent": available,
                }
            )

        for w in range(6):
            week_date = today - timedelta(days=7 * w)
            weekly_records.append(
                {
                    "update_id": f"UPD-{i:03d}-{w+1}",
                    "project_id": project_id,
                    "reporting_week": pd.to_datetime(week_date),
                    "key_achievement": random.choice(
                        [
                            "Phase gate documentation approved by governance board.",
                            "Sprint increment delivered to UAT successfully.",
                            "Business process mapping completed for target teams.",
                            "Data migration rehearsal completed with low defects.",
                            "Vendor design review completed and accepted.",
                        ]
                    ),
                    "blocker": random.choice(
                        [
                            "No major blockers this week.",
                            "Dependency on external vendor API release.",
                            "Delayed sign-off on policy interpretation.",
                            "Temporary bandwidth constraints in QA team.",
                            "Environment access not yet provisioned for two analysts.",
                        ]
                    ),
                    "next_step": random.choice(
                        [
                            "Confirm baseline schedule at next steering committee.",
                            "Close open RAID actions and refresh mitigation owners.",
                            "Progress SIT execution and defect triage.",
                            "Finalize phase 2 resource plan and onboarding.",
                            "Validate benefits profile with finance partner.",
                        ]
                    ),
                    "status_note": random.choice(
                        [
                            "Delivery confidence remains moderate.",
                            "Scope and plan remain in control.",
                            "Risk exposure elevated; mitigation active.",
                            "Executive attention required for one dependency.",
                        ]
                    ),
                }
            )

    projects = pd.DataFrame(project_records)
    milestones = pd.DataFrame(milestone_records)
    resources = pd.DataFrame(resource_records)
    weekly_updates = pd.DataFrame(weekly_records)

    return {
        "projects": projects,
        "milestones": milestones,
        "resources": resources,
        "weekly_updates": weekly_updates,
    }
