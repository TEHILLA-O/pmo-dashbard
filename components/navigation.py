"""
Primary sidebar navigation via st.page_link.

Requires `.streamlit/config.toml` with `client.showSidebarNavigation = false` so this is the only nav.
"""

from __future__ import annotations

import streamlit as st


def render_sidebar_navigation() -> None:
    """Single sidebar menu for all app sections."""
    with st.sidebar:
        st.markdown("### Portfolio")
        st.caption("Select a view")
        st.page_link("app.py", label="Home")
        st.page_link("pages/1_Executive_Overview.py", label="Executive Overview")
        st.page_link("pages/2_Portfolio_View.py", label="Portfolio View")
        st.page_link("pages/3_Risk_Health_Analysis.py", label="Risk & Health Analysis")
        st.page_link("pages/4_Resource_Allocation.py", label="Resource Allocation")
        st.page_link("pages/5_Prioritization.py", label="Prioritization")
        st.page_link("pages/6_Weekly_Status_Reports.py", label="Weekly Status Reports")
        st.page_link("pages/7_Data_Upload_Admin.py", label="Data Upload / Admin")
        st.page_link("pages/8_Predictive_Analytics.py", label="Predictive Analytics")
        st.divider()


def render_home_quick_links() -> None:
    """Prominent navigation on the Home page only (inside a frosted panel)."""
    with st.container(border=True, key="home_quick_nav"):
        st.markdown('<p class="glass-nav-title">Jump to a section</p>', unsafe_allow_html=True)
        r1 = st.columns(4)
        r2 = st.columns(4)
        r3 = st.columns(4)

        links = [
            ("Executive Overview", "pages/1_Executive_Overview.py"),
            ("Portfolio View", "pages/2_Portfolio_View.py"),
            ("Risk & Health", "pages/3_Risk_Health_Analysis.py"),
            ("Resources", "pages/4_Resource_Allocation.py"),
            ("Prioritization", "pages/5_Prioritization.py"),
            ("Weekly Reports", "pages/6_Weekly_Status_Reports.py"),
            ("Data / Admin", "pages/7_Data_Upload_Admin.py"),
            ("Predictive", "pages/8_Predictive_Analytics.py"),
        ]
        rows = [r1, r2, r3]
        for i, (label, path) in enumerate(links):
            row = rows[i // 4]
            with row[i % 4]:
                st.page_link(path, label=label, use_container_width=True)
