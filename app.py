import numpy as np
import streamlit as st

from components.navigation import render_home_quick_links, render_sidebar_navigation
from components.portfolio_admin import render_portfolio_admin_section
from utils.data_loader import get_active_data_bundle
from utils.metrics import compute_portfolio_executive_kpis
from utils.styles import apply_global_styles, glass_hero_intro, glass_tip

st.set_page_config(
    page_title="PMO Portfolio Intelligence Dashboard",
    layout="wide",
    initial_sidebar_state="expanded",
)

render_sidebar_navigation()
apply_global_styles()

st.title("PMO Portfolio Intelligence Dashboard")
st.caption("Enterprise portfolio governance and decision-support platform")

bundle = get_active_data_bundle()
projects = bundle["projects"]
milestones = bundle["milestones"]
resources_df = bundle["resources"]
k = compute_portfolio_executive_kpis(projects, milestones, resources_df)

glass_hero_intro(
    "Integrated PMO view across portfolio health, delivery risk, resource capacity, "
    "strategic prioritisation, and weekly reporting. Use the sidebar or the shortcuts "
    "below to move between governance views."
)

render_home_quick_links()
st.divider()

render_portfolio_admin_section()
st.divider()

st.markdown("##### Snapshot KPIs")
r1 = st.columns(4)
r1[0].metric("Budget-weighted % complete", f"{k['budget_weighted_pct_complete']:.1f}%")
r1[1].metric("Avg schedule variance", f"{k['avg_schedule_variance_pp']:+.1f} pp")
r1[2].metric("Budget utilisation", f"{k['budget_utilisation_pct']:.1f}%")
r1[3].metric("SPI (schedule)", f"{k['spi']:.2f}")
r2 = st.columns(4)
r2[0].metric("Active projects", f"{k['n_projects']:,}")
r2[1].metric("On track", f"{k['on_track']:,}")
r2[2].metric(
    "CPI (cost)",
    f"{k['cpi']:.2f}" if k["total_spend_gbp"] > 0 and np.isfinite(k["cpi"]) else "—",
)
r2[3].metric("Avg resource utilisation", f"{k['avg_resource_utilization_pct']:.1f}%")

r3 = st.columns(4)
r3[0].metric("Avg health score", f"{k['avg_health']:.1f}")
r3[1].metric("Projects over 100% utilisation", f"{k['pct_projects_overallocated']:.0f}%")
r3[2].metric("Named resources overallocated", f"{k['named_resources_overallocated_count']:,}")
r3[3].metric("Avg capacity overrun", f"{k['avg_resource_overrun_pp']:.1f} pp")

glass_tip(
    "<strong>Tip:</strong> open Executive Overview for the portfolio-wide health snapshot."
)
