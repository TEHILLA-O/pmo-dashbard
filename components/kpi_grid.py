"""
Aligned KPI layouts: fixed column count so every card has equal width (no ragged rows).
"""

from __future__ import annotations

import streamlit as st

# Standard executive grid: four equal columns per row
DEFAULT_COLS = 4


def kpi_section_title(label: str, *, first: bool = False) -> None:
    cls = "kpi-section-title" + (" kpi-section-title--first" if first else "")
    st.markdown(f"<p class='{cls}'>{label}</p>", unsafe_allow_html=True)


def render_kpi_grid(
    rows: list[list[tuple[str, str]]],
    n_cols: int = DEFAULT_COLS,
    *,
    compact: bool = False,
) -> None:
    """
    Render KPI cards in a strict grid. Each inner list is one row with at most `n_cols` items.
    All rows use `st.columns(n_cols)` so card widths match across the page.
    Cards use staggered entrance delays for a subtle micro-interaction.
    Use compact=True for denser padding and typography (e.g. tabbed layouts).
    """
    card_index = 0
    stagger_step_s = 0.042
    card_cls = "kpi-card kpi-card--enter" + (" kpi-card--compact" if compact else "")

    for row in rows:
        if not row:
            continue
        if len(row) > n_cols:
            raise ValueError(f"KPI row has {len(row)} items; max is {n_cols}")
        cols = st.columns(n_cols)
        for i in range(n_cols):
            with cols[i]:
                if i < len(row):
                    title, value = row[i]
                    delay = card_index * stagger_step_s
                    card_index += 1
                    st.markdown(
                        f"<div class='{card_cls}' "
                        f"style='animation-delay: {delay:.3f}s'>"
                        f"<div class='kpi-title'>{title}</div>"
                        f"<div class='kpi-value'>{value}</div>"
                        "</div>",
                        unsafe_allow_html=True,
                    )


def render_kpi_column(items: list[tuple[str, str]], *, compact: bool = True) -> None:
    """Stack KPI cards in a single column (narrow sidebar / dashboard rail)."""
    if not items:
        return
    render_kpi_grid([[pair] for pair in items], n_cols=1, compact=compact)


def render_kpi_sidebar_group(
    title: str,
    items: list[tuple[str, str]],
    *,
    compact: bool = True,
) -> None:
    """Section label + vertical metric stack for multi-column executive layouts."""
    st.markdown(
        f"<p class='exec-sidebar-group-title'>{title}</p>",
        unsafe_allow_html=True,
    )
    render_kpi_column(items, compact=compact)


def render_kpi_strip(items: list[tuple[str, str]], *, compact: bool = True) -> None:
    """Single row of headline KPIs (e.g. above tabs) for at-a-glance scanning."""
    n = len(items)
    if n == 0:
        return
    cols = st.columns(n)
    card_cls = "kpi-card kpi-card--enter kpi-card--strip" + (" kpi-card--compact" if compact else "")
    for i, (title, value) in enumerate(items):
        with cols[i]:
            delay = i * 0.035
            st.markdown(
                f"<div class='{card_cls}' style='animation-delay: {delay:.3f}s'>"
                f"<div class='kpi-title'>{title}</div>"
                f"<div class='kpi-value'>{value}</div>"
                "</div>",
                unsafe_allow_html=True,
            )
