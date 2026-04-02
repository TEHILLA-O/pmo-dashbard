from __future__ import annotations

from io import BytesIO
import pandas as pd
import streamlit as st

from utils.risk_logic import calculate_health_score
from utils.sample_data_generator import generate_sample_data

REQUIRED_PROJECT_COLUMNS = {
    'project_id','project_name','project_manager','sponsor','business_unit','start_date','end_date','planned_progress','actual_progress','status',
    'budget','actual_cost','priority','strategic_alignment_score','roi_score','urgency_score','risk_probability','risk_impact','open_risks_count','overdue_milestones','resource_utilization_percent',
}

@st.cache_data
def _load_sample_bundle() -> dict[str, pd.DataFrame]:
    bundle = generate_sample_data(n_projects=35)
    bundle['projects'] = calculate_health_score(bundle['projects'])
    return bundle


def _read_uploaded_file(file_obj) -> dict[str, pd.DataFrame]:
    if file_obj is None:
        raise ValueError('No upload provided')
    name = file_obj.name.lower()
    if name.endswith('.csv'):
        projects = pd.read_csv(file_obj)
        bundle = _load_sample_bundle(); bundle['projects'] = projects; return bundle
    if name.endswith('.xlsx') or name.endswith('.xls'):
        raw = BytesIO(file_obj.read())
        xls = pd.ExcelFile(raw)
        bundle = _load_sample_bundle()
        if 'projects' in xls.sheet_names: bundle['projects'] = pd.read_excel(xls, 'projects')
        if 'milestones' in xls.sheet_names: bundle['milestones'] = pd.read_excel(xls, 'milestones')
        if 'resources' in xls.sheet_names: bundle['resources'] = pd.read_excel(xls, 'resources')
        if 'weekly_updates' in xls.sheet_names: bundle['weekly_updates'] = pd.read_excel(xls, 'weekly_updates')
        return bundle
    raise ValueError('Unsupported file type')


def validate_projects_df(projects: pd.DataFrame) -> tuple[bool, list[str]]:
    missing = sorted(REQUIRED_PROJECT_COLUMNS - set(projects.columns))
    return (False, missing) if missing else (True, [])


def get_active_data_bundle() -> dict[str, pd.DataFrame]:
    if 'data_bundle' not in st.session_state:
        st.session_state['data_bundle'] = _load_sample_bundle()
    return st.session_state['data_bundle']


def reset_session_to_sample_bundle() -> None:
    """Replace session data with a fresh sample portfolio (same as first app load). Clears in-app edits."""
    _load_sample_bundle.clear()
    st.session_state['data_bundle'] = _load_sample_bundle()


def set_uploaded_data_bundle(file_obj) -> tuple[bool, str]:
    try:
        bundle = _read_uploaded_file(file_obj)
        is_valid, missing = validate_projects_df(bundle['projects'])
        if not is_valid:
            return False, f"Missing required columns: {', '.join(missing)}"
        projects = bundle['projects'].copy()
        for col in ['start_date', 'end_date']:
            if col in projects.columns:
                projects[col] = pd.to_datetime(projects[col], errors='coerce')
        bundle['projects'] = calculate_health_score(projects)
        st.session_state['data_bundle'] = bundle
        return True, 'Data uploaded and validated successfully.'
    except Exception as exc:
        return False, f'Upload failed: {exc}'
