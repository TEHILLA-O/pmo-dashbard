import numpy as np
import streamlit as st

from components.kpi_grid import render_kpi_sidebar_group
from components.navigation import render_sidebar_navigation
from utils.charts import (
    budget_vs_actual,
    executive_delivery_timeline,
    executive_health_attention_bar,
    health_distribution,
    milestone_portfolio_status_bar,
    risk_matrix,
    status_donut,
)
from utils.data_loader import get_active_data_bundle
from utils.metrics import compute_portfolio_executive_kpis
from utils.portfolio_export import default_zip_filename, portfolio_zip_bytes, projects_csv_bytes
from utils.styles import apply_global_styles

st.set_page_config(page_title="Executive Overview", layout="wide")
render_sidebar_navigation()
apply_global_styles()

bundle = get_active_data_bundle()
projects = bundle["projects"].copy()
milestones = bundle["milestones"].copy()
resources_df = bundle["resources"].copy()

st.title("Executive Overview")
st.caption("Current portfolio health, financial position, and governance exceptions")

if projects.empty:
    st.info("No projects in the portfolio. Add data from Home or Data Upload / Admin.")
    st.stop()

k = compute_portfolio_executive_kpis(projects, milestones, resources_df)

cpi_txt = f"{k['cpi']:.2f}" if k["total_spend_gbp"] > 0 and np.isfinite(k["cpi"]) else "—"
rem_work = max(0.0, 100.0 - k["budget_weighted_pct_complete"])
avg_named_load_txt = (
    f"{k['avg_named_resource_load_pct']:.1f}%"
    if k["named_resources_count"] > 0 and np.isfinite(k["avg_named_resource_load_pct"])
    else "—"
)

st.markdown(
    "<p class='kpi-tabs-hint'>Figures in the left rail; charts in the centre; pulse metrics and quick tables on the right. "
    "Detail tables span the width below.</p>",
    unsafe_allow_html=True,
)

col_left, col_mid, col_right = st.columns([1, 2.05, 1.05])

with col_left:
    st.markdown("<p class='exec-overview-rail-title'>Key figures</p>", unsafe_allow_html=True)
    render_kpi_sidebar_group(
        "Delivery & schedule",
        [
            ("Budget-weighted % complete", f"{k['budget_weighted_pct_complete']:.1f}%"),
            ("Avg % complete", f"{k['avg_pct_complete']:.1f}%"),
            ("Remaining work", f"{rem_work:.1f}%"),
            ("Avg schedule variance", f"{k['avg_schedule_variance_pp']:+.1f} pp"),
            ("SPI (schedule index)", f"{k['spi']:.2f}"),
            ("On-schedule rate", f"{k['on_schedule_rate_pct']:.0f}%"),
            ("Overdue milestones", f"{k['overdue_milestones']:,}"),
            ("Exception rate", f"{k['exception_rate_pct']:.1f}%"),
        ],
    )
    render_kpi_sidebar_group(
        "Budget & cost",
        [
            ("Total approved budget", f"GBP {k['total_budget_gbp']:,.0f}"),
            ("Actual spend (AC)", f"GBP {k['total_spend_gbp']:,.0f}"),
            ("Budget utilisation", f"{k['budget_utilisation_pct']:.1f}%"),
            ("Budget variance %", f"{k['budget_variance_pct']:+.1f}%"),
            ("Budget variance (GBP)", f"GBP {k['variance_gbp']:+,.0f}"),
            ("CPI (cost index)", cpi_txt),
            ("Total open risks", f"{k['total_open_risks']:,}"),
            ("Avg health score", f"{k['avg_health']:.1f}"),
        ],
    )
    render_kpi_sidebar_group(
        "Resource & capacity",
        [
            ("Avg resource utilisation", f"{k['avg_resource_utilization_pct']:.1f}%"),
            ("% projects over 100% util", f"{k['pct_projects_overallocated']:.0f}%"),
            ("Named resources (roster)", f"{k['named_resources_count']:,}"),
            ("Avg allocation / person", avg_named_load_txt),
            ("Named resources overallocated", f"{k['named_resources_overallocated_count']:,}"),
            ("Avg capacity overrun", f"{k['avg_resource_overrun_pp']:.1f} pp"),
            ("High load projects (>110%)", f"{int((projects['resource_utilization_percent'] > 110).sum()):,}"),
            ("Low load projects (<70%)", f"{int((projects['resource_utilization_percent'] < 70).sum()):,}"),
        ],
    )
    render_kpi_sidebar_group(
        "Portfolio status",
        [
            ("Active projects", f"{k['n_projects']:,}"),
            ("On track", f"{k['on_track']:,}"),
            ("At risk", f"{k['at_risk']:,}"),
            ("Delayed", f"{k['delayed']:,}"),
        ],
    )

with col_mid:
    st.markdown("<p class='exec-overview-rail-title'>Visual digest</p>", unsafe_allow_html=True)
    m1, m2 = st.columns(2)
    with m1:
        st.plotly_chart(status_donut(projects), use_container_width=True)
    with m2:
        st.plotly_chart(budget_vs_actual(projects), use_container_width=True)
    m3, m4 = st.columns(2)
    with m3:
        st.plotly_chart(health_distribution(projects), use_container_width=True)
    with m4:
        st.plotly_chart(risk_matrix(projects), use_container_width=True)
    m5, m6 = st.columns(2)
    with m5:
        st.plotly_chart(executive_health_attention_bar(projects), use_container_width=True)
    with m6:
        st.plotly_chart(milestone_portfolio_status_bar(milestones), use_container_width=True)
    st.plotly_chart(executive_delivery_timeline(projects), use_container_width=True)

with col_right:
    st.markdown("<p class='exec-overview-rail-title'>Pulse & tables</p>", unsafe_allow_html=True)
    render_kpi_sidebar_group(
        "Headline pulse",
        [
            ("Active projects", f"{k['n_projects']:,}"),
            ("Avg health", f"{k['avg_health']:.1f}"),
            ("Budget utilisation", f"{k['budget_utilisation_pct']:.1f}%"),
            ("SPI", f"{k['spi']:.2f}"),
            ("CPI", cpi_txt),
            ("Exception rate", f"{k['exception_rate_pct']:.1f}%"),
        ],
    )
    if k["delayed"] > 0:
        st.markdown(
            f"<div class='warn-banner'><strong>Alert:</strong> {k['delayed']} project(s) delayed.</div>",
            unsafe_allow_html=True,
        )

    st.markdown("<p class='exec-sidebar-group-title'>Top risk (5)</p>", unsafe_allow_html=True)
    risk_cols = [
        "project_id",
        "project_name",
        "status",
        "risk_score",
        "health_score",
        "overdue_milestones",
    ]
    st.dataframe(
        projects.sort_values(["risk_score", "overdue_milestones"], ascending=False)[risk_cols].head(5),
        use_container_width=True,
        hide_index=True,
        height=220,
    )

    st.markdown("<p class='exec-sidebar-group-title'>Next milestones (sample)</p>", unsafe_allow_html=True)
    st.dataframe(
        projects[["project_name", "end_date", "status"]].sort_values("end_date").head(8),
        use_container_width=True,
        hide_index=True,
        height=260,
    )

st.divider()
st.subheader("Detail tables")
tbl_a, tbl_b = st.columns(2)
with tbl_a:
    st.markdown("**Timeline summary**")
    st.dataframe(
        projects[["project_name", "start_date", "end_date", "status"]].sort_values("end_date"),
        use_container_width=True,
        hide_index=True,
    )
with tbl_b:
    st.markdown("**Overdue & delayed watchlist**")
    watch = projects[(projects["overdue_milestones"] > 0) | (projects["status"] == "Delayed")][
        [
            "project_id",
            "project_name",
            "status",
            "planned_progress",
            "actual_progress",
            "overdue_milestones",
            "resource_utilization_percent",
        ]
    ]
    st.dataframe(watch, use_container_width=True, hide_index=True)

st.subheader("Export")
ec1, ec2 = st.columns(2)
with ec1:
    st.download_button(
        "Download projects (CSV)",
        data=projects_csv_bytes(projects),
        file_name="pmo_projects.csv",
        mime="text/csv",
        use_container_width=True,
        help="Current projects table only.",
    )
with ec2:
    st.download_button(
        "Download full portfolio (ZIP)",
        data=portfolio_zip_bytes(bundle),
        file_name=default_zip_filename(),
        mime="application/zip",
        use_container_width=True,
        help="ZIP containing projects.csv, milestones.csv, resources.csv, weekly_updates.csv.",
    )
st.caption("Full portfolio export matches the four datasets used across the app.")
