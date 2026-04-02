import streamlit as st

from components.navigation import render_sidebar_navigation
from utils.data_loader import get_active_data_bundle, reset_session_to_sample_bundle, set_uploaded_data_bundle
from utils.portfolio_export import default_zip_filename, portfolio_zip_bytes, projects_csv_bytes
from utils.styles import apply_global_styles

st.set_page_config(page_title='Data Upload / Admin', layout='wide')
render_sidebar_navigation()
apply_global_styles()

st.title('Data Upload / Admin')
st.caption('Upload, validate, and administer PMO portfolio data sources')

uploaded = st.file_uploader('Upload CSV or Excel (.xlsx)', type=['csv', 'xlsx', 'xls'])
if uploaded is not None:
    ok, message = set_uploaded_data_bundle(uploaded)
    st.success(message) if ok else st.error(message)

if st.button('Reset to Sample Demo Data'):
    reset_session_to_sample_bundle()
    st.success('Sample data loaded.')
    st.rerun()

bundle = get_active_data_bundle()

st.subheader('Export')
ex1, ex2 = st.columns(2)
with ex1:
    st.download_button(
        'Download projects (CSV)',
        data=projects_csv_bytes(bundle['projects']),
        file_name='pmo_projects.csv',
        mime='text/csv',
        use_container_width=True,
    )
with ex2:
    st.download_button(
        'Download full portfolio (ZIP)',
        data=portfolio_zip_bytes(bundle),
        file_name=default_zip_filename(),
        mime='application/zip',
        use_container_width=True,
        help='Four CSV files: projects, milestones, resources, weekly_updates.',
    )
st.caption('Exports reflect the active session (including in-app edits until you reload).')

st.subheader('Dataset Preview')
tab1, tab2, tab3, tab4 = st.tabs(['Projects', 'Milestones', 'Resources', 'Weekly Updates'])
with tab1: st.dataframe(bundle['projects'].head(50), use_container_width=True)
with tab2: st.dataframe(bundle['milestones'].head(50), use_container_width=True)
with tab3: st.dataframe(bundle['resources'].head(50), use_container_width=True)
with tab4: st.dataframe(bundle['weekly_updates'].head(50), use_container_width=True)
