import plotly.express as px
import streamlit as st

from components.navigation import render_sidebar_navigation
from utils.charts import apply_premium_theme
from utils.data_loader import get_active_data_bundle
from utils.styles import apply_global_styles

st.set_page_config(page_title='Resource Allocation', layout='wide')
render_sidebar_navigation()
apply_global_styles()

bundle = get_active_data_bundle()
projects = bundle['projects'].copy()
resources = bundle['resources'].copy()

st.title('Resource Allocation')
st.caption('Capacity planning and workload governance across portfolio workstreams')

if resources.empty:
    st.info("No resource rows in the portfolio. Create projects with resources from Home, upload data, or reset to sample data under Data Upload / Admin.")
    st.stop()

resource_summary = resources.groupby(['resource_name', 'role'], as_index=False)['allocation_percent'].sum().rename(columns={'allocation_percent': 'total_allocation_percent'})
resource_summary['available_capacity_percent'] = (100 - resource_summary['total_allocation_percent']).clip(upper=100)
resource_summary['capacity_flag'] = resource_summary['total_allocation_percent'].apply(lambda x: 'Overloaded' if x > 100 else ('Underutilised' if x < 60 else 'Balanced'))
overloaded = resource_summary[resource_summary['total_allocation_percent'] > 100]

c1, c2 = st.columns(2)
with c1:
    fig = px.bar(
        resource_summary.sort_values("total_allocation_percent", ascending=False).head(20),
        x="resource_name",
        y="total_allocation_percent",
        color="capacity_flag",
        title="Workload by resource",
        color_discrete_map={
            "Overloaded": "#fb7185",
            "Balanced": "#34d399",
            "Underutilised": "#a78bfa",
        },
    )
    fig = apply_premium_theme(fig)
    fig.update_layout(xaxis_tickangle=-45)
    st.plotly_chart(fig, use_container_width=True)
with c2:
    by_project = resources.groupby("project_id", as_index=False)["allocation_percent"].sum()
    fig2 = px.bar(by_project, x="project_id", y="allocation_percent", title="Total allocation by project")
    apply_premium_theme(fig2)
    st.plotly_chart(fig2, use_container_width=True)

st.subheader('Resource Capacity Table')
st.dataframe(resource_summary.sort_values('total_allocation_percent', ascending=False), use_container_width=True, hide_index=True)

st.subheader('Overallocated Resource Alerts')
if overloaded.empty:
    st.success('No resources currently above 100% allocation.')
else:
    impacted_projects = resources[resources['resource_name'].isin(overloaded['resource_name'])]['project_id'].unique().tolist()
    impacted_names = projects[projects['project_id'].isin(impacted_projects)]['project_name'].tolist()
    st.error(f"{overloaded.shape[0]} resources are overallocated. Potential delivery bottlenecks identified.")
    st.write('**Likely affected projects:**')
    st.write(', '.join(impacted_names[:12]))
