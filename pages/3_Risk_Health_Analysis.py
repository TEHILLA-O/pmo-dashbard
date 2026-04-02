import streamlit as st

from components.navigation import render_sidebar_navigation
from utils.charts import health_distribution, risk_matrix
from utils.data_loader import get_active_data_bundle
from utils.styles import apply_global_styles

st.set_page_config(page_title='Risk & Health Analysis', layout='wide')
render_sidebar_navigation()
apply_global_styles()

bundle = get_active_data_bundle()
projects = bundle['projects'].copy()

st.title('Risk & Health Analysis')
if projects.empty:
    st.info("No projects to analyse. Load or create portfolio data first.")
    st.stop()
st.caption('Governance-led risk scoring, health transparency, and critical alerts')

st.markdown("""
**Health score model**

`Health Score = 100 - (Schedule Penalty + Budget Penalty + Milestone Penalty + Resource Penalty + Risk Penalty + Progress Lag Penalty)`

Weighted governance factors: schedule variance (25%), budget variance (25%), overdue milestones (15%),
resource overload (15%), open risk exposure (10%), progress lag (10%).
""")

c1, c2 = st.columns(2)
with c1: st.plotly_chart(risk_matrix(projects), use_container_width=True)
with c2: st.plotly_chart(health_distribution(projects), use_container_width=True)

st.subheader('Top Risk Drivers')
risk_drivers = projects[['project_name', 'risk_score', 'open_risks_count', 'overdue_milestones', 'budget_variance_pct', 'progress_lag']].sort_values(['risk_score', 'open_risks_count', 'overdue_milestones'], ascending=False)
st.dataframe(risk_drivers.head(12), use_container_width=True, hide_index=True)

st.subheader('Critical Alerts')
critical = projects[(projects['status'] == 'Delayed') | (projects['budget_variance_pct'] > 0.15) | (projects['overdue_milestones'] >= 2) | (projects['resource_utilization_percent'] > 110)]
if critical.empty:
    st.success('No critical governance alerts at this time.')
else:
    st.error(f"{critical.shape[0]} projects require urgent PMO governance intervention.")
    st.dataframe(critical[['project_id', 'project_name', 'status', 'risk_score', 'health_score', 'budget_variance_pct', 'overdue_milestones', 'resource_utilization_percent']].sort_values(['health_score', 'risk_score'], ascending=[True, False]), use_container_width=True, hide_index=True)
