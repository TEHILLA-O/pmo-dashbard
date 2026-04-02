from __future__ import annotations

import numpy as np
import pandas as pd


def calculate_core_metrics(projects: pd.DataFrame) -> pd.DataFrame:
    df = projects.copy()
    df['budget_variance'] = df['actual_cost'] - df['budget']
    df['budget_variance_pct'] = np.where(df['budget'] > 0, df['budget_variance'] / df['budget'], 0.0)
    df['schedule_variance'] = df['actual_progress'] - df['planned_progress']
    df['progress_lag'] = (df['planned_progress'] - df['actual_progress']).clip(lower=0)
    df['risk_score'] = df['risk_probability'] * df['risk_impact']
    df['delayed_flag'] = ((df['overdue_milestones'] > 0) | ((df['end_date'] < pd.Timestamp.today()) & (df['actual_progress'] < 100))).astype(int)
    return df


def calculate_health_score(projects: pd.DataFrame) -> pd.DataFrame:
    df = calculate_core_metrics(projects)
    schedule_penalty = (df['progress_lag'].clip(0, 30) / 30) * 25
    budget_penalty = (df['budget_variance_pct'].clip(lower=0, upper=0.5) / 0.5) * 25
    milestone_penalty = (df['overdue_milestones'].clip(0, 5) / 5) * 15
    resource_penalty = ((df['resource_utilization_percent'] - 100).clip(lower=0, upper=40) / 40) * 15
    risks_penalty = (df['open_risks_count'].clip(0, 12) / 12) * 10
    lag_penalty = (df['progress_lag'].clip(0, 40) / 40) * 10

    total_penalty = schedule_penalty + budget_penalty + milestone_penalty + resource_penalty + risks_penalty + lag_penalty
    df['health_score'] = (100 - total_penalty).clip(lower=0, upper=100).round(1)
    df['rag_health'] = pd.cut(df['health_score'], bins=[-1, 59, 79, 100], labels=['Red', 'Amber', 'Green'])
    return df
