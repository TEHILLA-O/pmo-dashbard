from __future__ import annotations

import pandas as pd


def compute_prioritization_scores(projects: pd.DataFrame, weights: dict[str, float]) -> pd.DataFrame:
    df = projects.copy()
    risk_component = 100 - (df['risk_score'].clip(0, 25) / 25) * 100
    cost_efficiency = 100 - (df['budget_variance_pct'].clip(lower=-0.2, upper=0.4) + 0.2) / 0.6 * 100
    feasibility = 100 - ((df['resource_utilization_percent'].clip(60, 140) - 60) / 80) * 100

    df['prioritization_score'] = (
        df['strategic_alignment_score'] * weights['strategic_alignment']
        + df['roi_score'] * weights['roi_value']
        + df['urgency_score'] * weights['urgency']
        + risk_component * weights['risk']
        + cost_efficiency * weights['cost_efficiency']
        + feasibility * weights['delivery_feasibility']
        + (100 - df['risk_probability'] * 10) * weights['regulatory_importance']
    )
    return df.sort_values('prioritization_score', ascending=False)
