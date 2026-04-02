import streamlit as st

from components.navigation import render_sidebar_navigation
from utils.data_loader import get_active_data_bundle
from utils.styles import apply_global_styles

st.set_page_config(page_title='Portfolio View', layout='wide')
render_sidebar_navigation()
apply_global_styles()

bundle = get_active_data_bundle()
projects = bundle['projects'].copy()

st.title('Portfolio View')
st.caption('Detailed project portfolio with governance filters and drill-down')

f1, f2, f3, f4 = st.columns(4)
status_filter = f1.multiselect('Status', sorted(projects['status'].dropna().unique()), default=list(projects['status'].dropna().unique()))
bu_filter = f2.multiselect('Business Unit', sorted(projects['business_unit'].dropna().unique()), default=list(projects['business_unit'].dropna().unique()))
pm_filter = f3.multiselect('Project Manager', sorted(projects['project_manager'].dropna().unique()), default=list(projects['project_manager'].dropna().unique()))
priority_filter = f4.multiselect('Priority', sorted(projects['priority'].dropna().unique()), default=list(projects['priority'].dropna().unique()))

view = projects[(projects['status'].isin(status_filter)) & (projects['business_unit'].isin(bu_filter)) & (projects['project_manager'].isin(pm_filter)) & (projects['priority'].isin(priority_filter))].copy()

show_cols = ['project_id', 'project_name', 'project_manager', 'business_unit', 'sponsor', 'start_date', 'end_date', 'actual_progress', 'status', 'budget', 'actual_cost', 'budget_variance', 'priority', 'risk_score', 'health_score', 'overdue_milestones', 'resource_utilization_percent', 'comments']
if view.empty:
    st.info("No projects match the current filters. Adjust status, business unit, project manager, or priority above.")
else:
    st.dataframe(view[show_cols].sort_values(['status', 'risk_score'], ascending=[True, False]), use_container_width=True, hide_index=True)

selected = st.selectbox('Select project for detail', options=view['project_id'].tolist() if not view.empty else [])
if selected:
    row = view[view['project_id'] == selected].iloc[0]
    with st.expander(f"Project Detail | {row['project_name']}", expanded=True):
        c1, c2, c3, c4 = st.columns(4)
        c1.metric('Progress', f"{row['actual_progress']:.1f}%")
        c2.metric('Schedule Variance', f"{row['schedule_variance']:.1f} pp")
        c3.metric('Budget Variance', f"GBP {row['budget_variance']:,.0f}")
        c4.metric('Health Score', f"{row['health_score']:.1f}")
        st.write(f"**Governance Notes:** {row['comments']}")
