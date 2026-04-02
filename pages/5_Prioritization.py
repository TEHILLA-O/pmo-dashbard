import plotly.express as px
import streamlit as st

from components.navigation import render_sidebar_navigation
from utils.charts import STATUS_COLORS, apply_premium_theme
from utils.data_loader import get_active_data_bundle
from utils.prioritization import compute_prioritization_scores
from utils.styles import apply_global_styles

st.set_page_config(page_title='Prioritization', layout='wide')
render_sidebar_navigation()
apply_global_styles()

bundle = get_active_data_bundle()
projects = bundle['projects'].copy()

st.title('Prioritization')
if projects.empty:
    st.info("No projects to prioritise. Add or load portfolio data from Home or Data Upload / Admin.")
    st.stop()
st.caption('Strategic portfolio scoring model for investment and delivery sequencing')

st.markdown('Adjust criterion weights (must total 1.0):')
c1, c2, c3, c4 = st.columns(4)
weights = {
    'strategic_alignment': c1.slider('Strategic Alignment', 0.0, 0.4, 0.2, 0.01),
    'roi_value': c2.slider('ROI / Value', 0.0, 0.4, 0.15, 0.01),
    'urgency': c3.slider('Urgency', 0.0, 0.3, 0.15, 0.01),
    'risk': c4.slider('Risk Profile', 0.0, 0.3, 0.1, 0.01),
}
c5, c6, c7 = st.columns(3)
weights['cost_efficiency'] = c5.slider('Cost Efficiency', 0.0, 0.3, 0.15, 0.01)
weights['regulatory_importance'] = c6.slider('Regulatory Importance', 0.0, 0.3, 0.1, 0.01)
weights['delivery_feasibility'] = c7.slider('Delivery Feasibility', 0.0, 0.3, 0.15, 0.01)

total_w = sum(weights.values())
if total_w == 0:
    st.stop()
weights = {k: v / total_w for k, v in weights.items()}

ranked = compute_prioritization_scores(projects, weights)

st.subheader('Ranked Project List')
st.dataframe(ranked[['project_id', 'project_name', 'business_unit', 'priority', 'status', 'prioritization_score', 'health_score', 'risk_score']].head(20), use_container_width=True, hide_index=True)

st.subheader('Impact vs Effort Matrix')
fig = px.scatter(
    ranked,
    x='actual_cost',
    y='prioritization_score',
    size='budget',
    color='status',
    hover_name='project_name',
    title='Impact (prioritisation) vs effort (actual cost)',
    color_discrete_map=STATUS_COLORS,
)
apply_premium_theme(fig)
st.plotly_chart(fig, use_container_width=True)

st.success('Recommendation: Prioritise top-ranked projects with strong strategic alignment and delivery feasibility while actively managing high-risk dependencies.')
