from __future__ import annotations

from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
import pandas as pd


def build_weekly_summary(project_row: pd.Series, updates: pd.DataFrame, milestones: pd.DataFrame) -> dict[str, str]:
    p_id = project_row['project_id']
    project_updates = updates[updates['project_id'] == p_id].sort_values('reporting_week', ascending=False)
    project_milestones = milestones[milestones['project_id'] == p_id]

    next_milestones = project_milestones[project_milestones['status'].isin(['Upcoming', 'Overdue'])].sort_values('due_date').head(3)

    achievements = "\n".join(f"- {x}" for x in project_updates["key_achievement"].head(3).tolist()) or "- No update captured"
    blockers = "\n".join(f"- {x}" for x in project_updates["blocker"].head(3).tolist()) or "- No blocker captured"
    actions = "\n".join(f"- {x}" for x in project_updates["next_step"].head(3).tolist()) or "- No action captured"
    risks = f"Open risks: {int(project_row['open_risks_count'])}; risk score: {int(project_row['risk_score'])}; overdue milestones: {int(project_row['overdue_milestones'])}."
    schedule = f"Planned progress {project_row['planned_progress']:.1f}% vs actual {project_row['actual_progress']:.1f}% (variance: {project_row['schedule_variance']:.1f}pp)."
    budget = f"Budget GBP {project_row['budget']:,.0f}; actual GBP {project_row['actual_cost']:,.0f}; variance GBP {project_row['budget_variance']:,.0f}."
    milestones_txt = (
        "\n".join(f"- {r.milestone_name} ({r.status}) due {pd.to_datetime(r.due_date).date()}" for _, r in next_milestones.iterrows())
        or "- No upcoming milestones logged"
    )

    return {
        "overall_status": f"{project_row['status']} | Delivery confidence: {project_row['rag_health']} | Health score: {project_row['health_score']}",
        "achievements": achievements,
        "milestones": milestones_txt,
        "blockers": blockers,
        "risks": risks,
        "budget": budget,
        "schedule": schedule,
        "next_actions": actions,
    }


def generate_weekly_pdf(project_name: str, summary: dict[str, str]) -> bytes:
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    y = height - 20 * mm
    c.setFont("Helvetica-Bold", 14)
    c.drawString(20 * mm, y, "Weekly Status Summary")
    y -= 8 * mm
    c.setFont("Helvetica", 10)
    c.drawString(20 * mm, y, f"Project: {project_name}")

    sections = [
        ("Overall Status", summary["overall_status"]),
        ("Key Achievements", summary["achievements"]),
        ("Upcoming Milestones", summary["milestones"]),
        ("Blockers / Issues", summary["blockers"]),
        ("Risks", summary["risks"]),
        ("Budget Summary", summary["budget"]),
        ("Schedule Summary", summary["schedule"]),
        ("Next Actions", summary["next_actions"]),
    ]

    for title, body in sections:
        y -= 10 * mm
        if y < 30 * mm:
            c.showPage()
            y = height - 20 * mm
        c.setFont("Helvetica-Bold", 11)
        c.drawString(20 * mm, y, title)
        y -= 5 * mm
        c.setFont("Helvetica", 9)
        for line in str(body).split("\n"):
            if y < 20 * mm:
                c.showPage()
                y = height - 20 * mm
            c.drawString(22 * mm, y, line[:130])
            y -= 4.5 * mm
    c.save()
    return buffer.getvalue()
