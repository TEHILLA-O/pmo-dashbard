import streamlit as st

from components.navigation import render_sidebar_navigation
from utils.charts import (
    portfolio_health_overview_bars,
    project_milestones_due_chart,
    project_schedule_progress_figure,
    weekly_blocker_word_summary,
    weekly_report_cadence,
)
from utils.data_loader import get_active_data_bundle
from utils.reporting import build_weekly_summary, generate_weekly_pdf
from utils.styles import apply_global_styles

st.set_page_config(page_title='Weekly Status Reports', layout='wide')
render_sidebar_navigation()
apply_global_styles()

bundle = get_active_data_bundle()
projects = bundle['projects'].copy()
milestones = bundle['milestones'].copy()
weekly_updates = bundle['weekly_updates'].copy()

st.title('Weekly Status Reports')
if projects.empty:
    st.info("No projects loaded. Add portfolio data from Home or Data Upload / Admin.")
    st.stop()
st.caption('Automated executive-ready weekly status summary generation')

selection = st.selectbox('Select project', ['All Projects'] + projects['project_id'].tolist())

if selection == 'All Projects':
    st.write('Generate reports project-by-project for formal distribution.')
    st.plotly_chart(portfolio_health_overview_bars(projects), use_container_width=True)
    st.caption('Spot low health scores, then open a project below for milestone and weekly-report detail.')
    st.dataframe(projects[['project_id', 'project_name', 'status', 'health_score']], use_container_width=True, hide_index=True)
else:
    row = projects[projects['project_id'] == selection].iloc[0]
    summary = build_weekly_summary(row, weekly_updates, milestones)

    st.subheader(f"Weekly Status Summary | {row['project_name']}")
    st.caption('Visuals first — scroll for the narrative blocks and PDF export.')

    c_vis1, c_vis2 = st.columns(2)
    with c_vis1:
        st.plotly_chart(
            project_schedule_progress_figure(float(row['planned_progress']), float(row['actual_progress'])),
            use_container_width=True,
        )
    with c_vis2:
        st.plotly_chart(project_milestones_due_chart(milestones, selection), use_container_width=True)

    st.plotly_chart(weekly_report_cadence(weekly_updates, selection), use_container_width=True)
    st.plotly_chart(weekly_blocker_word_summary(weekly_updates, selection), use_container_width=True)
    st.caption(
        'The “blocker length” chart is a quick signal only — pair it with the blockers narrative and RAID log.'
    )

    st.markdown('### Narrative summary')
    st.markdown(f"**Overall Status:** {summary['overall_status']}")
    st.markdown('**Key Achievements**')
    st.text(summary['achievements'])
    st.markdown('**Upcoming Milestones**')
    st.text(summary['milestones'])
    st.markdown('**Blockers / Issues**')
    st.text(summary['blockers'])
    st.markdown('**Risks**')
    st.write(summary['risks'])
    st.markdown('**Budget Summary**')
    st.write(summary['budget'])
    st.markdown('**Schedule Summary**')
    st.write(summary['schedule'])
    st.markdown('**Next Actions**')
    st.text(summary['next_actions'])

    pdf_bytes = generate_weekly_pdf(row['project_name'], summary)
    st.download_button('Download Weekly Status PDF', data=pdf_bytes, file_name=f'weekly_status_{selection}.pdf', mime='application/pdf')
