import numpy as np
import pandas as pd
import streamlit as st

from components.navigation import render_sidebar_navigation
from utils.charts import (
    predictive_actual_vs_predicted_compact,
    predictive_budget_risk_bars,
    predictive_delay_risk_bars,
    predictive_risk_band_distribution,
)
from utils.data_loader import get_active_data_bundle
from utils.styles import apply_global_styles

st.set_page_config(page_title='Predictive Analytics', layout='wide')
render_sidebar_navigation()
apply_global_styles()

st.title('Predictive Analytics')
st.caption('Explainable heuristics for delay and budget overrun risk banding')

bundle = get_active_data_bundle()
projects = bundle['projects'].copy()

if projects.empty:
    st.info("No projects in the dataset. Load or create portfolio data first.")
    st.stop()

score = (
    0.28 * projects['progress_lag']
    + 0.24 * (projects['budget_variance_pct'].clip(lower=0) * 100)
    + 0.18 * projects['risk_score']
    + 0.15 * projects['overdue_milestones'] * 8
    + 0.15 * (projects['resource_utilization_percent'].clip(lower=100) - 100)
)
projects['delay_risk_probability'] = 1 / (1 + np.exp(-(score - 18) / 12))
projects['budget_overrun_risk_probability'] = 1 / (1 + np.exp(-((projects['budget_variance_pct'] * 100 - 8) / 10)))
projects['failure_risk_band'] = pd.cut(projects['delay_risk_probability'], bins=[-0.01, 0.33, 0.66, 1], labels=['Low', 'Moderate', 'High'])

st.markdown("""
**Model Logic (Interpretability First)**

Delay risk probability is estimated from progress lag, positive budget variance, risk score,
milestone slippage, and resource overload pressure. Budget overrun risk uses the budget variance signal.
The compact chart compares **model predictions** (portfolio averages) with **realized** schedule and cost pressure.
Project-level detail uses **horizontal bar charts** below.
""")

st.plotly_chart(predictive_actual_vs_predicted_compact(projects), use_container_width=True)
st.caption(
    "Schedule — **Predicted** = mean delay-risk probability; **Actual** = mean progress lag ÷ 100 (capped). "
    "Cost — **Predicted** = mean budget-overrun risk probability; **Actual** = positive budget variance % × 4, capped at 100% (for scale)."
)

c1, c2 = st.columns(2)
with c1:
    st.plotly_chart(predictive_delay_risk_bars(projects), use_container_width=True)
with c2:
    st.plotly_chart(predictive_budget_risk_bars(projects), use_container_width=True)

st.plotly_chart(predictive_risk_band_distribution(projects), use_container_width=True)
st.caption("Band colours match the delay-risk model (Low / Moderate / High).")

st.dataframe(projects[['project_id', 'project_name', 'status', 'delay_risk_probability', 'budget_overrun_risk_probability', 'failure_risk_band', 'health_score']].sort_values(['delay_risk_probability', 'budget_overrun_risk_probability'], ascending=False), use_container_width=True, hide_index=True)
