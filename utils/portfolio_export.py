"""CSV / ZIP export helpers for the active session portfolio bundle."""

from __future__ import annotations

import io
import zipfile
from datetime import datetime

import pandas as pd


def projects_csv_bytes(projects: pd.DataFrame) -> bytes:
    return projects.to_csv(index=False).encode("utf-8")


def portfolio_zip_bytes(bundle: dict[str, pd.DataFrame]) -> bytes:
    """
    Zip archive containing four CSV files: projects, milestones, resources, weekly_updates.
    """
    buf = io.BytesIO()
    keys = [
        ("projects.csv", "projects"),
        ("milestones.csv", "milestones"),
        ("resources.csv", "resources"),
        ("weekly_updates.csv", "weekly_updates"),
    ]
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        for filename, key in keys:
            df = bundle.get(key)
            if df is None or not isinstance(df, pd.DataFrame):
                df = pd.DataFrame()
            zf.writestr(filename, df.to_csv(index=False))
    return buf.getvalue()


def default_zip_filename() -> str:
    return f"pmo_portfolio_export_{datetime.now().strftime('%Y%m%d_%H%M')}.zip"
