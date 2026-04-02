from __future__ import annotations

import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# Purple / mint / rose — matches glass UI reference while staying legible on dark charts
STATUS_COLORS = {
    "On Track": "#34d399",
    "At Risk": "#c4b5fd",
    "Delayed": "#fb7185",
}
RAG_COLORS = {"Green": "#34d399", "Amber": "#fbbf24", "Red": "#fb7185"}

PREDICTIVE_BAND_COLORS = {"Low": "#34d399", "Moderate": "#fbbf24", "High": "#fb7185"}

BUDGET_BAR_COLORS = {"Budget": "#8b5cf6", "Actual cost": "#10b981"}

_FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', sans-serif"


def apply_premium_theme(fig: go.Figure) -> go.Figure:
    """Glass-matching Plotly look: transparent paper, soft grid, purple/mint accents."""
    fig.update_layout(
        template="plotly_dark",
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(255,255,255,0.04)",
        font=dict(family=_FONT, color="rgba(248,250,252,0.9)", size=12),
        title=dict(font=dict(size=14, color="rgba(237,233,254,0.96)")),
        legend=dict(
            bgcolor="rgba(0,0,0,0)",
            bordercolor="rgba(167, 139, 250, 0.2)",
            borderwidth=1,
            font=dict(size=11),
        ),
        margin=dict(l=12, r=12, t=48, b=12),
    )
    fig.update_xaxes(
        gridcolor="rgba(139, 92, 246, 0.08)",
        linecolor="rgba(167, 139, 250, 0.15)",
        zerolinecolor="rgba(52, 211, 153, 0.06)",
    )
    fig.update_yaxes(
        gridcolor="rgba(139, 92, 246, 0.08)",
        linecolor="rgba(167, 139, 250, 0.15)",
        zerolinecolor="rgba(52, 211, 153, 0.06)",
    )
    return fig


def status_donut(projects: pd.DataFrame) -> go.Figure:
    counts = projects["status"].value_counts().reset_index()
    counts.columns = ["status", "count"]
    fig = px.pie(
        counts,
        names="status",
        values="count",
        hole=0.62,
        color="status",
        color_discrete_map=STATUS_COLORS,
        title="Portfolio status mix",
    )
    return apply_premium_theme(fig)


def budget_vs_actual(projects: pd.DataFrame) -> go.Figure:
    b = float(projects["budget"].sum())
    a = float(projects["actual_cost"].sum())
    agg = pd.DataFrame(
        {
            "Metric": ["Budget", "Actual cost"],
            "GBP": [b, a],
        }
    )
    ymax = max(b, a, 1.0) * 1.12
    fig = px.bar(
        agg,
        x="Metric",
        y="GBP",
        color="Metric",
        title="Portfolio budget vs actual",
        color_discrete_map=BUDGET_BAR_COLORS,
    )
    fig.update_traces(texttemplate="£%{y:,.0f}", textposition="outside", cliponaxis=False)
    fig.update_yaxes(
        title="GBP",
        range=[0, ymax],
        rangemode="tozero",
        showgrid=True,
    )
    fig.update_layout(
        showlegend=False,
        height=340,
        margin=dict(t=48, b=36),
    )
    return apply_premium_theme(fig)


def risk_matrix(projects: pd.DataFrame) -> go.Figure:
    """
    Stacked bar charts: project counts at each risk probability / impact level, stacked by status.
    Replaces the former bubble plot with a clearer aggregate view.
    """
    if projects.empty:
        return _empty_figure("Risk profile", "No projects")

    df = projects.copy()
    for col in ("risk_probability", "risk_impact"):
        if col not in df.columns:
            return _empty_figure("Risk profile", f"Missing column: {col}")
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0).astype(int).clip(1, 5)

    status_order = ["On Track", "At Risk", "Delayed"]
    idx_labels = [str(i) for i in range(1, 6)]

    def pivot_stack(dim: str) -> pd.DataFrame:
        g = df.groupby([dim, "status"], observed=True).size().unstack(fill_value=0)
        for s in status_order:
            if s not in g.columns:
                g[s] = 0
        g = g[status_order]
        g.index = g.index.astype(int)
        g = g.reindex(range(1, 6), fill_value=0)
        return g

    p_p = pivot_stack("risk_probability")
    p_i = pivot_stack("risk_impact")

    fig = make_subplots(
        rows=1,
        cols=2,
        horizontal_spacing=0.1,
        subplot_titles=("By risk probability", "By risk impact"),
    )

    for status in status_order:
        fig.add_trace(
            go.Bar(
                name=status,
                x=idx_labels,
                y=p_p[status].tolist(),
                marker_color=STATUS_COLORS[status],
                legendgroup=status,
                hovertemplate=f"{status}<br>Count=%{{y}}<extra></extra>",
            ),
            row=1,
            col=1,
        )
    for status in status_order:
        fig.add_trace(
            go.Bar(
                name=status,
                x=idx_labels,
                y=p_i[status].tolist(),
                marker_color=STATUS_COLORS[status],
                legendgroup=status,
                showlegend=False,
                hovertemplate=f"{status}<br>Count=%{{y}}<extra></extra>",
            ),
            row=1,
            col=2,
        )

    fig.update_layout(
        barmode="stack",
        title="Risk matrix — stacked by delivery status",
        height=400,
        margin=dict(t=52, b=44, l=48, r=24),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="right", x=1),
    )
    fig.update_xaxes(title_text="Probability (1–5)", row=1, col=1, type="category", dtick=1)
    fig.update_xaxes(title_text="Impact (1–5)", row=1, col=2, type="category", dtick=1)
    fig.update_yaxes(title_text="Projects", row=1, col=1, rangemode="tozero")
    fig.update_yaxes(title_text="Projects", row=1, col=2, rangemode="tozero")
    return apply_premium_theme(fig)


def health_distribution(projects: pd.DataFrame) -> go.Figure:
    fig = px.histogram(
        projects,
        x="health_score",
        color="rag_health",
        nbins=15,
        color_discrete_map=RAG_COLORS,
        title="Health score distribution",
    )
    return apply_premium_theme(fig)


def _empty_figure(title: str, message: str = "No data") -> go.Figure:
    fig = go.Figure()
    fig.add_annotation(
        text=message,
        xref="paper",
        yref="paper",
        x=0.5,
        y=0.5,
        showarrow=False,
        font=dict(size=13, color="rgba(167, 180, 200, 0.9)"),
    )
    fig.update_layout(title=title, template="plotly_dark", paper_bgcolor="rgba(0,0,0,0)")
    return apply_premium_theme(fig)


def executive_health_attention_bar(projects: pd.DataFrame, n: int = 12) -> go.Figure:
    """Lowest health projects first — draws the eye to governance attention areas."""
    if projects.empty:
        return _empty_figure("Health attention", "No projects")
    df = projects.nsmallest(min(n, len(projects)), "health_score").sort_values("health_score", ascending=True)
    fig = px.bar(
        df,
        x="health_score",
        y="project_name",
        orientation="h",
        color="rag_health",
        color_discrete_map=RAG_COLORS,
        title=f"Lowest health scores (top {len(df)} for review)",
    )
    return apply_premium_theme(fig).update_layout(xaxis=dict(range=[0, 105]))


def executive_delivery_timeline(projects: pd.DataFrame, max_projects: int = 28) -> go.Figure:
    """Gantt-style view of baselined delivery windows."""
    if projects.empty:
        return _empty_figure("Delivery windows", "No projects")
    df = projects.copy()
    df["start"] = pd.to_datetime(df["start_date"])
    df["end"] = pd.to_datetime(df["end_date"])
    df = df.sort_values("end", ascending=False).head(max_projects)
    df["label"] = df["project_name"].astype(str).str.slice(0, 42)
    fig = px.timeline(
        df,
        x_start="start",
        x_end="end",
        y="label",
        color="status",
        color_discrete_map=STATUS_COLORS,
        title="Delivery windows (start → planned end)",
    )
    fig.update_yaxes(autorange="reversed")
    return apply_premium_theme(fig).update_layout(height=max(320, min(720, 24 * len(df))))


def milestone_portfolio_status_bar(milestones: pd.DataFrame) -> go.Figure:
    if milestones is None or milestones.empty or "status" not in milestones.columns:
        return _empty_figure("Milestone pipeline", "No milestones")
    c = milestones["status"].value_counts().reset_index()
    c.columns = ["status", "count"]
    fig = px.bar(
        c,
        x="status",
        y="count",
        color="status",
        title="Milestone status mix (portfolio)",
        color_discrete_map={
            "Upcoming": "#a78bfa",
            "Overdue": "#fb7185",
            "Completed": "#34d399",
        },
    )
    return apply_premium_theme(fig).update_layout(showlegend=False)


def portfolio_health_overview_bars(projects: pd.DataFrame) -> go.Figure:
    """All projects: health score as a ranked horizontal bar chart."""
    if projects.empty:
        return _empty_figure("Portfolio health", "No projects")
    df = projects.sort_values("health_score", ascending=True)
    fig = px.bar(
        df,
        x="health_score",
        y="project_id",
        orientation="h",
        color="status",
        color_discrete_map=STATUS_COLORS,
        title="Health score by project (low → high)",
    )
    return apply_premium_theme(fig).update_layout(
        xaxis=dict(range=[0, 105]),
        height=min(900, max(400, 14 * len(df))),
    )



def weekly_report_cadence(weekly_updates: pd.DataFrame, project_id: str) -> go.Figure:
    """Timeline of weekly submissions for one project."""
    if weekly_updates is None or weekly_updates.empty:
        return _empty_figure("Weekly report cadence", "No weekly updates")
    u = weekly_updates[weekly_updates["project_id"].astype(str) == str(project_id)].copy()
    if u.empty:
        return _empty_figure("Weekly report cadence", "No rows for this project")
    u["reporting_week"] = pd.to_datetime(u["reporting_week"])
    u = u.sort_values("reporting_week").tail(32)
    u["_seq"] = np.arange(len(u))
    fig = px.line(
        u,
        x="reporting_week",
        y="_seq",
        markers=True,
        title="Weekly report history (recent sequence)",
        hover_data=["key_achievement", "blocker"],
    )
    fig.update_yaxes(title="Report # (0 = oldest shown)")
    return apply_premium_theme(fig)


def project_milestones_due_chart(milestones: pd.DataFrame, project_id: str, max_m: int = 14) -> go.Figure:
    """Upcoming / open milestones by due date."""
    if milestones is None or milestones.empty:
        return _empty_figure("Milestones due", "No milestones")
    ms = milestones[milestones["project_id"].astype(str) == str(project_id)].copy()
    if ms.empty:
        return _empty_figure("Milestones due", "No milestones for this project")
    ms["due_date"] = pd.to_datetime(ms["due_date"])
    ms = ms.sort_values("due_date").head(max_m)
    ms["label"] = ms["milestone_name"].astype(str).str.slice(0, 40)
    fig = px.bar(
        ms,
        x="due_date",
        y="label",
        orientation="h",
        color="status",
        color_discrete_map={
            "Upcoming": "#a78bfa",
            "Overdue": "#fb7185",
            "Completed": "#34d399",
        },
        title="Milestones by due date",
    )
    fig.update_yaxes(autorange="reversed")
    return apply_premium_theme(fig)


def project_schedule_progress_figure(planned: float, actual: float) -> go.Figure:
    """Side-by-side planned vs actual % complete."""
    fig = go.Figure(
        data=[
            go.Bar(name="Planned %", x=["Schedule"], y=[float(planned)], marker_color="#8b5cf6"),
            go.Bar(name="Actual %", x=["Schedule"], y=[float(actual)], marker_color="#34d399"),
        ]
    )
    fig.update_layout(barmode="group", title="Planned vs actual progress %", bargap=0.35)
    fig.update_yaxes(range=[0, 105], title="% complete")
    return apply_premium_theme(fig)


def weekly_blocker_word_summary(weekly_updates: pd.DataFrame, project_id: str) -> go.Figure:
    """Simple bar: character length of blocker text as proxy for issue verbosity (lightweight digest)."""
    if weekly_updates is None or weekly_updates.empty:
        return _empty_figure("Issue notes length", "No weekly updates")
    u = weekly_updates[weekly_updates["project_id"].astype(str) == str(project_id)].copy()
    if u.empty:
        return _empty_figure("Issue notes length", "No rows for this project")
    u["reporting_week"] = pd.to_datetime(u["reporting_week"])
    u = u.sort_values("reporting_week").tail(16)
    u["blocker_len"] = u["blocker"].astype(str).str.len().clip(0, 500)
    fig = px.bar(
        u,
        x="reporting_week",
        y="blocker_len",
        title="Blocker field length by week (quick signal)",
    )
    fig.update_traces(marker_color="#c4b5fd")
    return apply_premium_theme(fig).update_layout(showlegend=False)


def predictive_delay_risk_bars(projects: pd.DataFrame, max_projects: int = 28) -> go.Figure:
    """Horizontal bars: delay risk probability by project (sorted, highest at bottom)."""
    if projects.empty:
        return _empty_figure("Delay risk", "No projects")
    df = projects.copy()
    df["label"] = df["project_name"].astype(str).str.slice(0, 44)
    df = df.sort_values("delay_risk_probability", ascending=True).tail(max_projects)
    fig = px.bar(
        df,
        x="delay_risk_probability",
        y="label",
        orientation="h",
        color="failure_risk_band",
        color_discrete_map=PREDICTIVE_BAND_COLORS,
        title="Predicted delay risk by project",
    )
    fig.update_xaxes(title="Probability", tickformat=".0%", range=[0, 1])
    fig.update_yaxes(autorange="reversed")
    return apply_premium_theme(fig).update_layout(
        height=min(900, max(360, 20 * len(df))),
        legend_title_text="Risk band",
    )


def predictive_budget_risk_bars(projects: pd.DataFrame, max_projects: int = 28) -> go.Figure:
    """Horizontal bars: budget overrun risk probability by project."""
    if projects.empty:
        return _empty_figure("Budget overrun risk", "No projects")
    df = projects.copy()
    df["label"] = df["project_name"].astype(str).str.slice(0, 44)
    df = df.sort_values("budget_overrun_risk_probability", ascending=True).tail(max_projects)
    fig = px.bar(
        df,
        x="budget_overrun_risk_probability",
        y="label",
        orientation="h",
        color="failure_risk_band",
        color_discrete_map=PREDICTIVE_BAND_COLORS,
        title="Predicted budget overrun risk by project",
    )
    fig.update_xaxes(title="Probability", tickformat=".0%", range=[0, 1])
    fig.update_yaxes(autorange="reversed")
    return apply_premium_theme(fig).update_layout(
        height=min(900, max(360, 20 * len(df))),
        legend_title_text="Risk band",
    )


def predictive_actual_vs_predicted_compact(projects: pd.DataFrame) -> go.Figure:
    """
    Compact grouped bars: model **predicted** probabilities vs **realized** portfolio signals.

    - Schedule: predicted = mean delay-risk probability; actual = mean progress lag / 100 (0–1).
    - Budget: predicted = mean budget-overrun risk probability; actual = scaled positive budget variance % (capped 0–1).
    """
    if projects.empty:
        return _empty_figure("Predicted vs actual", "No projects")

    pred_delay = float(projects["delay_risk_probability"].mean())
    pred_budget = float(projects["budget_overrun_risk_probability"].mean())

    lag = projects["progress_lag"].clip(lower=0).astype(float)
    actual_schedule = float((lag / 100.0).mean()) if len(projects) else 0.0
    actual_schedule = min(1.0, actual_schedule)

    pos_var = projects["budget_variance_pct"].clip(lower=0).astype(float)
    # Map typical 0–25% variance into 0–1 for side-by-side readability with probabilities
    actual_cost = float((pos_var * 4.0).clip(upper=1.0).mean()) if len(projects) else 0.0

    fig = go.Figure(
        data=[
            go.Bar(
                name="Predicted (model)",
                x=["Schedule", "Cost"],
                y=[pred_delay, pred_budget],
                marker_color="#8b5cf6",
                text=[f"{pred_delay:.0%}", f"{pred_budget:.0%}"],
                textposition="outside",
                textfont=dict(size=11, color="rgba(248,250,252,0.92)"),
            ),
            go.Bar(
                name="Actual / realized",
                x=["Schedule", "Cost"],
                y=[actual_schedule, actual_cost],
                marker_color="#34d399",
                text=[f"{actual_schedule:.0%}", f"{actual_cost:.0%}"],
                textposition="outside",
                textfont=dict(size=11, color="rgba(248,250,252,0.92)"),
            ),
        ]
    )
    fig.update_layout(
        barmode="group",
        bargap=0.22,
        title="Predicted vs realized (portfolio averages)",
        height=300,
        margin=dict(t=44, b=40),
    )
    fig.update_yaxes(title="Index (0–100%)", tickformat=".0%", range=[0, 1.05])
    fig.update_xaxes(title="")
    return apply_premium_theme(fig)


def predictive_risk_band_distribution(projects: pd.DataFrame) -> go.Figure:
    """Vertical bar chart: count of projects per risk band (delay-risk model)."""
    if projects.empty:
        return _empty_figure("Risk band mix", "No projects")
    order = ["Low", "Moderate", "High"]
    vc = projects["failure_risk_band"].astype(str).value_counts()
    counts = [int(vc.get(b, 0)) for b in order]
    fig = px.bar(
        x=order,
        y=counts,
        color=order,
        color_discrete_map=PREDICTIVE_BAND_COLORS,
        title="Projects by delay-risk band",
    )
    fig.update_xaxes(title="Band")
    fig.update_yaxes(title="Count")
    return apply_premium_theme(fig).update_layout(showlegend=False)
