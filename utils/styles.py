"""
Premium UI: glassmorphism (frosted blur, translucency, depth) with a purple / mint
accent system inspired by modern analytics dashboards — not flat colour blocks.
"""

from __future__ import annotations

import streamlit as st


def apply_global_styles() -> None:
    st.markdown(
        """
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&display=swap" rel="stylesheet" />
        <style>
            :root {
                --glass-bg: rgba(255, 255, 255, 0.06);
                --glass-bg-strong: rgba(255, 255, 255, 0.09);
                --glass-border: rgba(255, 255, 255, 0.14);
                --glass-border-soft: rgba(255, 255, 255, 0.08);
                --glass-highlight: rgba(255, 255, 255, 0.18);
                --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.34);
                --glass-inset: inset 0 1px 0 rgba(255, 255, 255, 0.14);
                --text-primary: rgba(248, 250, 252, 0.97);
                --text-secondary: rgba(167, 180, 200, 0.95);
                /* Reference-inspired accents — still read on dark glass */
                --accent: #a78bfa;
                --accent-purple: #8b5cf6;
                --accent-purple-soft: rgba(139, 92, 246, 0.35);
                --accent-mint: #34d399;
                --accent-mint-soft: rgba(52, 211, 153, 0.25);
                --accent-rose: #fb7185;
                --radius-lg: 18px;
                --radius-md: 13px;
                --blur: saturate(185%) blur(44px);
                --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
                --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            @keyframes kpiEnter {
                from {
                    opacity: 0;
                    transform: translateY(14px) scale(0.98);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            @keyframes titleFade {
                from { opacity: 0; transform: translateY(6px); }
                to { opacity: 1; transform: translateY(0); }
            }

            @keyframes heroSheen {
                0%, 100% { background-position: 120% 50%; opacity: 0.35; }
                50% { background-position: -20% 50%; opacity: 0.55; }
            }

            @keyframes bannerSlide {
                from {
                    opacity: 0;
                    transform: translateX(-8px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }

            /* App canvas — dark glass + purple / mint ambient (dashboard reference vibe) */
            .stApp {
                font-family: "DM Sans", -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", sans-serif !important;
                background:
                    radial-gradient(1000px 700px at 0% 0%, rgba(88, 28, 135, 0.22) 0%, transparent 52%),
                    radial-gradient(900px 600px at 100% -5%, rgba(52, 211, 153, 0.10) 0%, transparent 48%),
                    radial-gradient(800px 500px at 50% 100%, rgba(109, 40, 217, 0.12) 0%, transparent 50%),
                    linear-gradient(165deg, #0c0618 0%, #0f172a 45%, #020617 100%);
                color: var(--text-primary);
            }

            /* Top chrome */
            header[data-testid="stHeader"] {
                background: rgba(12, 8, 24, 0.55) !important;
                backdrop-filter: var(--blur);
                -webkit-backdrop-filter: var(--blur);
                border-bottom: 1px solid rgba(139, 92, 246, 0.12);
            }

            /* Sidebar — deep purple glass (reference sidebar) + frost */
            section[data-testid="stSidebar"] {
                background: linear-gradient(180deg, rgba(59, 7, 100, 0.52) 0%, rgba(15, 23, 42, 0.72) 100%) !important;
                backdrop-filter: saturate(200%) blur(52px) !important;
                -webkit-backdrop-filter: saturate(200%) blur(52px) !important;
                border-right: 1px solid rgba(167, 139, 250, 0.14) !important;
                box-shadow: 8px 0 48px rgba(0, 0, 0, 0.35), inset -1px 0 0 rgba(255, 255, 255, 0.04);
            }
            section[data-testid="stSidebar"] .block-container {
                padding-top: 1.12rem;
            }
            section[data-testid="stSidebar"] * {
                color-scheme: dark;
            }

            /*
             * Hide Streamlit's automatic multipage navigation (plain list + search field).
             * Custom glass nav remains in `components/navigation.py` (st.page_link).
             * CSS backup when client.showSidebarNavigation in .streamlit/config.toml is not applied.
             */
            section[data-testid="stSidebar"] [data-testid="stSidebarNav"] {
                display: none !important;
            }
            /* Tighten top spacing when auto-nav is hidden */
            section[data-testid="stSidebar"] [data-testid="stSidebarUserContent"] {
                padding-top: 0.68rem !important;
            }

            /* Sidebar page links — frosted pills + slide hover */
            section[data-testid="stSidebar"] [data-testid="stPageLink-NavLink"] {
                border-radius: 12px !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                background: rgba(255, 255, 255, 0.06) !important;
                backdrop-filter: blur(12px);
                margin: 2px 0 !important;
                transition:
                    background 0.22s var(--ease-out),
                    border-color 0.22s var(--ease-out),
                    transform 0.22s var(--ease-out),
                    box-shadow 0.22s var(--ease-out);
            }
            section[data-testid="stSidebar"] [data-testid="stPageLink-NavLink"]:hover {
                background: rgba(139, 92, 246, 0.22) !important;
                border-color: rgba(167, 139, 250, 0.45) !important;
                transform: translateX(4px);
                box-shadow: -2px 0 20px rgba(139, 92, 246, 0.2);
            }
            section[data-testid="stSidebar"] [data-testid="stPageLink-NavLink"]:active {
                transform: translateX(2px) scale(0.99);
            }

            /* Main content width & rhythm */
            .main .block-container {
                padding-top: 1.62rem;
                padding-bottom: 2.43rem;
                max-width: 1280px;
            }

            /* Home quick-nav panel (st.container(border=True, key="home_quick_nav")) */
            div.st-key-home_quick_nav {
                background: linear-gradient(165deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 100%) !important;
                backdrop-filter: blur(32px) saturate(170%) !important;
                -webkit-backdrop-filter: blur(32px) saturate(170%) !important;
                border: 1px solid var(--glass-border) !important;
                border-radius: var(--radius-lg) !important;
                box-shadow: var(--glass-shadow), var(--glass-inset);
                padding: 0.4rem 0.52rem 0.81rem !important;
                transition:
                    transform 0.3s var(--ease-out),
                    box-shadow 0.3s var(--ease-out),
                    border-color 0.3s var(--ease-out) !important;
            }
            div.st-key-home_quick_nav:hover {
                transform: translateY(-2px);
                box-shadow: 0 20px 56px rgba(0, 0, 0, 0.45), var(--glass-inset), 0 0 48px rgba(139, 92, 246, 0.12) !important;
                border-color: rgba(167, 139, 250, 0.28) !important;
            }

            /* Headings — soft white → lavender (purple dashboard tone) */
            .main h1 {
                font-weight: 700;
                letter-spacing: -0.035em;
                font-size: clamp(1.65rem, 2.2vw, 2rem);
                background: linear-gradient(180deg, #ffffff 0%, #e9d5ff 55%, #c4b5fd 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                margin-bottom: 0.35rem;
                animation: titleFade 0.55s var(--ease-out) both;
            }
            .main h2, .main h3 {
                font-weight: 600;
                letter-spacing: -0.02em;
                color: rgba(250, 245, 255, 0.96) !important;
                margin-top: 1.75rem;
                margin-bottom: 0.65rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid rgba(139, 92, 246, 0.15);
            }
            .main [data-testid="stCaptionContainer"] p {
                color: var(--text-secondary) !important;
                font-size: 0.95rem !important;
                font-weight: 500;
            }

            /* Metrics — glass tiles */
            [data-testid="stMetric"] {
                background: linear-gradient(155deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 100%) !important;
                backdrop-filter: blur(24px) saturate(160%);
                -webkit-backdrop-filter: blur(24px) saturate(160%);
                border: 1px solid var(--glass-border) !important;
                border-radius: var(--radius-md) !important;
                padding: 0.81rem 0.9rem !important;
                box-shadow: var(--glass-shadow), var(--glass-inset);
                transition:
                    transform 0.25s var(--ease-out),
                    box-shadow 0.25s var(--ease-out),
                    border-color 0.25s var(--ease-out);
            }
            [data-testid="stMetric"]:hover {
                transform: translateY(-2px);
                border-color: rgba(167, 139, 250, 0.35) !important;
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.42), var(--glass-inset), 0 0 28px rgba(139, 92, 246, 0.12);
            }
            [data-testid="stMetric"] label {
                color: var(--text-secondary) !important;
                font-weight: 500 !important;
                font-size: 0.8rem !important;
                text-transform: uppercase;
                letter-spacing: 0.06em;
            }
            [data-testid="stMetric"] [data-testid="stMetricValue"] {
                color: var(--text-primary) !important;
                font-weight: 700 !important;
                font-size: 1.4rem !important;
            }

            /* Plotly chart shell */
            [data-testid="stPlotlyChart"] {
                background: linear-gradient(165deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%);
                backdrop-filter: blur(28px) saturate(150%);
                -webkit-backdrop-filter: blur(28px) saturate(150%);
                border: 1px solid var(--glass-border);
                border-radius: var(--radius-lg);
                padding: 0.52rem 0.4rem 0.29rem;
                box-shadow: var(--glass-shadow), var(--glass-inset);
                overflow: hidden;
                transition:
                    transform 0.35s var(--ease-out),
                    border-color 0.35s var(--ease-out),
                    box-shadow 0.35s var(--ease-out);
            }
            [data-testid="stPlotlyChart"]:hover {
                transform: translateY(-3px) scale(1.008);
                border-color: rgba(167, 139, 250, 0.28);
                box-shadow: 0 16px 48px rgba(0, 0, 0, 0.48), var(--glass-inset), 0 0 44px rgba(139, 92, 246, 0.1), 0 0 60px rgba(52, 211, 153, 0.05);
            }

            /* Dataframes / tables */
            [data-testid="stDataFrame"] {
                border-radius: var(--radius-md);
                overflow: hidden;
                border: 1px solid var(--glass-border-soft);
                background: rgba(255,255,255,0.04);
                backdrop-filter: blur(16px);
                box-shadow: var(--glass-shadow);
                transition: border-color 0.3s var(--ease-out), box-shadow 0.3s var(--ease-out);
            }
            [data-testid="stDataFrame"]:hover {
                border-color: rgba(167, 139, 250, 0.2);
                box-shadow: 0 12px 36px rgba(0, 0, 0, 0.38), 0 0 24px rgba(139, 92, 246, 0.06);
            }

            /* Expanders */
            details[data-testid="stExpander"] {
                background: rgba(255,255,255,0.05) !important;
                backdrop-filter: blur(20px);
                border: 1px solid var(--glass-border-soft) !important;
                border-radius: var(--radius-md) !important;
                box-shadow: var(--glass-inset);
            }

            /* Alerts — glass variants */
            div[data-testid="stAlert"] {
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.14), rgba(15, 23, 42, 0.55)) !important;
                backdrop-filter: blur(20px);
                border: 1px solid rgba(167, 139, 250, 0.3) !important;
                border-radius: var(--radius-md) !important;
                color: var(--text-primary) !important;
            }
            div[data-testid="stAlert"] p { color: rgba(226, 232, 240, 0.95) !important; }

            /* Success / error / warning — softer glass */
            div[data-baseweb="notification"] {
                border-radius: var(--radius-md) !important;
                backdrop-filter: blur(16px);
            }

            /* Dividers */
            hr {
                border: none;
                height: 1px;
                background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.25), rgba(52, 211, 153, 0.15), transparent);
                margin: 1.22rem 0;
            }

            /* Buttons */
            .stButton > button, button[kind="secondary"] {
                border-radius: 12px !important;
                border: 1px solid var(--glass-border) !important;
                background: rgba(255,255,255,0.08) !important;
                backdrop-filter: blur(12px);
                font-weight: 600;
                transition:
                    background 0.22s var(--ease-out),
                    border-color 0.22s var(--ease-out),
                    transform 0.18s var(--ease-spring),
                    box-shadow 0.22s var(--ease-out);
            }
            .stButton > button:hover {
                background: rgba(255,255,255,0.14) !important;
                border-color: var(--glass-highlight) !important;
                transform: translateY(-1px);
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
            }
            .stButton > button:active {
                transform: translateY(0) scale(0.98);
            }

            /* Download button container */
            [data-testid="stDownloadButton"] button {
                border-radius: 14px !important;
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.35) 0%, rgba(52, 211, 153, 0.15) 100%) !important;
                border: 1px solid rgba(167, 139, 250, 0.45) !important;
                font-weight: 600;
                transition:
                    transform 0.2s var(--ease-spring),
                    box-shadow 0.25s var(--ease-out),
                    filter 0.2s ease;
            }
            [data-testid="stDownloadButton"] button:hover {
                transform: translateY(-2px);
                box-shadow: 0 12px 32px rgba(139, 92, 246, 0.28), 0 0 24px rgba(52, 211, 153, 0.08);
                filter: brightness(1.06);
            }
            [data-testid="stDownloadButton"] button:active {
                transform: translateY(0) scale(0.98);
            }

            /* Select / inputs — subtle glass */
            div[data-baseweb="select"] > div {
                border-radius: 12px !important;
                border-color: var(--glass-border-soft) !important;
                background-color: rgba(255,255,255,0.05) !important;
            }

            /* Tabs */
            .stTabs [data-baseweb="tab-list"] {
                background: rgba(255,255,255,0.04);
                border-radius: 12px;
                padding: 4px;
                gap: 4px;
                border: 1px solid var(--glass-border-soft);
            }
            .stTabs [aria-selected="true"] {
                background: linear-gradient(180deg, rgba(139, 92, 246, 0.25), rgba(139, 92, 246, 0.1)) !important;
                border-radius: 10px !important;
            }
            .stTabs [data-baseweb="tab"] {
                transition: background 0.2s var(--ease-out), transform 0.15s ease;
            }
            .stTabs [data-baseweb="tab"]:hover:not([aria-selected="true"]) {
                background: rgba(255,255,255,0.06) !important;
            }

            /* Slider track */
            div[data-testid="stSlider"] [role="slider"] {
                background: linear-gradient(180deg, #a78bfa, #8b5cf6) !important;
                box-shadow: 0 0 12px rgba(139, 92, 246, 0.35);
            }

            /* Custom HTML helpers */
            .glass-hero {
                position: relative;
                overflow: hidden;
                background: linear-gradient(145deg, rgba(255,255,255,0.11) 0%, rgba(255,255,255,0.03) 100%);
                backdrop-filter: blur(32px) saturate(160%);
                -webkit-backdrop-filter: blur(32px) saturate(160%);
                border: 1px solid var(--glass-border);
                border-radius: var(--radius-lg);
                padding: 1.08rem 1.22rem;
                margin-bottom: 1rem;
                box-shadow: var(--glass-shadow), var(--glass-inset);
                transition: border-color 0.35s var(--ease-out), box-shadow 0.35s var(--ease-out);
            }
            .glass-hero:hover {
                border-color: rgba(167, 139, 250, 0.28);
                box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4), var(--glass-inset), 0 0 56px rgba(139, 92, 246, 0.12);
            }
            .glass-hero::after {
                content: "";
                position: absolute;
                inset: 0;
                background: linear-gradient(
                    115deg,
                    transparent 32%,
                    rgba(167, 139, 250, 0.09) 46%,
                    rgba(52, 211, 153, 0.05) 52%,
                    transparent 66%
                );
                background-size: 220% 100%;
                animation: heroSheen 9s ease-in-out infinite;
                pointer-events: none;
            }
            .glass-hero-lead {
                position: relative;
                z-index: 1;
                margin: 0;
                color: rgba(226, 232, 240, 0.88);
                font-size: 0.98rem;
                line-height: 1.65;
                font-weight: 450;
            }
            .glass-nav-grid {
                background: linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
                backdrop-filter: blur(28px);
                border: 1px solid var(--glass-border-soft);
                border-radius: var(--radius-lg);
                padding: 0.81rem 0.81rem 0.94rem;
                margin: 0.4rem 0 1rem;
                box-shadow: var(--glass-shadow);
            }
            .glass-nav-title {
                font-size: 0.72rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.14em;
                color: var(--text-secondary);
                margin: 0 0 0.85rem 0;
            }
            /* Hint above tabbed KPI blocks (Executive Overview) */
            p.kpi-tabs-hint {
                font-size: 0.78rem;
                color: var(--text-secondary);
                margin: 0 0 0.5rem 0;
                line-height: 1.45;
            }
            /* Three-column executive dashboard rails */
            p.exec-overview-rail-title {
                font-size: 0.72rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.14em;
                color: rgba(237, 233, 254, 0.98);
                margin: 0 0 0.85rem 0;
                padding-bottom: 0.45rem;
                border-bottom: 1px solid rgba(139, 92, 246, 0.38);
            }
            p.exec-sidebar-group-title {
                font-size: 0.65rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.1em;
                color: rgba(167, 180, 200, 0.96);
                margin: 1rem 0 0.42rem 0;
                padding-bottom: 0.28rem;
                border-bottom: 1px solid rgba(139, 92, 246, 0.18);
            }
            /* KPI section headings — consistent rhythm */
            p.kpi-section-title {
                font-size: 0.7rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.16em;
                color: rgba(196, 181, 253, 0.92);
                margin: 1.5rem 0 0.65rem 0;
                padding-bottom: 0.4rem;
                border-bottom: 1px solid rgba(139, 92, 246, 0.22);
                box-shadow: 0 1px 0 rgba(52, 211, 153, 0.08);
                animation: titleFade 0.45s var(--ease-out) both;
            }
            p.kpi-section-title--first {
                margin-top: 0.35rem;
            }
            .kpi-card {
                box-sizing: border-box;
                min-height: 77px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                background: linear-gradient(155deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%);
                backdrop-filter: blur(28px) saturate(170%);
                -webkit-backdrop-filter: blur(28px) saturate(170%);
                border: 1px solid var(--glass-border);
                border-radius: var(--radius-md);
                padding: 0.77rem 0.81rem;
                box-shadow: var(--glass-shadow), var(--glass-inset);
                transition:
                    border-color 0.28s var(--ease-out),
                    box-shadow 0.28s var(--ease-out),
                    transform 0.28s var(--ease-out);
            }
            .kpi-card--enter {
                opacity: 0;
                animation: kpiEnter 0.52s var(--ease-out) both;
                animation-delay: 0s;
            }
            .kpi-card:hover {
                border-color: rgba(167, 139, 250, 0.38);
                transform: translateY(-4px);
                box-shadow:
                    0 16px 48px rgba(0, 0, 0, 0.45),
                    var(--glass-inset),
                    0 0 32px rgba(139, 92, 246, 0.15),
                    0 0 0 1px rgba(52, 211, 153, 0.08);
            }
            .kpi-card:active {
                transform: translateY(-1px) scale(0.995);
                transition-duration: 0.1s;
            }
            /* Denser cards — tabbed executive views, less vertical scroll */
            .kpi-card--compact {
                min-height: 58px;
                padding: 0.45rem 0.52rem 0.49rem;
            }
            .kpi-card--compact .kpi-title {
                font-size: 0.62rem;
                margin-bottom: 0.28rem;
            }
            .kpi-card--compact .kpi-value {
                font-size: 1.01rem;
            }
            /* One-row headline strip above detailed grids */
            .kpi-card--strip {
                min-height: 55px;
                margin-bottom: 0.29rem;
            }
            .kpi-title {
                color: var(--text-secondary);
                font-size: 0.68rem;
                font-weight: 600;
                margin-bottom: 0.4rem;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                line-height: 1.25;
            }
            .kpi-value {
                font-size: 1.22rem;
                font-weight: 700;
                letter-spacing: -0.02em;
                color: var(--text-primary);
                line-height: 1.2;
                word-break: break-word;
                transition: color 0.2s ease, letter-spacing 0.25s var(--ease-out);
            }
            .kpi-card:hover .kpi-value {
                color: #faf5ff;
                letter-spacing: -0.03em;
            }
            .warn-banner {
                border-left: 4px solid #f87171;
                background: linear-gradient(90deg, rgba(248,113,113,0.15), rgba(15,23,42,0.45));
                backdrop-filter: blur(16px);
                border-radius: var(--radius-md);
                border: 1px solid rgba(248,113,113,0.28);
                padding: 0.81rem 0.94rem;
                margin: 0.81rem 0;
                color: rgba(254, 226, 226, 0.95);
                box-shadow: var(--glass-shadow);
                animation: bannerSlide 0.45s var(--ease-out) both;
                transition: transform 0.2s var(--ease-out), box-shadow 0.2s var(--ease-out);
            }
            .warn-banner:hover {
                transform: translateX(2px);
                box-shadow: 0 8px 32px rgba(248, 113, 113, 0.12);
            }
            .glass-tip {
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.14), rgba(15, 23, 42, 0.55), rgba(52, 211, 153, 0.06));
                backdrop-filter: blur(20px);
                border: 1px solid rgba(167, 139, 250, 0.28);
                border-radius: var(--radius-md);
                padding: 0.72rem 0.9rem;
                color: rgba(226, 232, 240, 0.95);
                font-size: 0.92rem;
                transition:
                    border-color 0.25s var(--ease-out),
                    transform 0.25s var(--ease-out),
                    box-shadow 0.25s var(--ease-out);
            }
            .glass-tip:hover {
                border-color: rgba(52, 211, 153, 0.35);
                transform: translateY(-2px);
                box-shadow: 0 10px 32px rgba(139, 92, 246, 0.18);
            }

            @media (prefers-reduced-motion: reduce) {
                .kpi-card--enter,
                .main h1,
                p.kpi-section-title,
                .warn-banner,
                .glass-hero::after {
                    animation: none !important;
                }
                .kpi-card--enter { opacity: 1 !important; }
                .kpi-card:hover,
                [data-testid="stMetric"]:hover,
                [data-testid="stPlotlyChart"]:hover,
                .glass-tip:hover,
                div.st-key-home_quick_nav:hover {
                    transform: none !important;
                }
                section[data-testid="stSidebar"] [data-testid="stPageLink-NavLink"]:hover {
                    transform: none !important;
                }
            }
        </style>
        """,
        unsafe_allow_html=True,
    )


def glass_hero_intro(body_html: str) -> None:
    """Premium intro panel for the home page."""
    st.markdown(
        f'<div class="glass-hero"><p class="glass-hero-lead">{body_html}</p></div>',
        unsafe_allow_html=True,
    )


def glass_tip(text: str) -> None:
    """Callout with glass styling (replaces default st.info look when used)."""
    st.markdown(f'<div class="glass-tip">{text}</div>', unsafe_allow_html=True)
