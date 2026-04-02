# PMO Portfolio Intelligence Dashboard

GitHub: [TEHILLA-O/pmo-dashbard](https://github.com/TEHILLA-O/pmo-dashbard)

## Web dashboard (recommended — Vercel, no Streamlit)

The **Next.js** app in **`web/`** is a full static dashboard (home, executive charts, portfolio table, risk, resources, etc.). It loads bundled JSON generated from the same sample data pipeline as the Python utilities.

```bash
cd web
npm install
npm run build   # production check
npm run dev     # http://localhost:3000
```

**Vercel:** import this repo and set **Root Directory** to **`web`**. Vercel will detect Next.js and deploy automatically.

**Refresh data:** from the repository root (Python env with `pandas` etc.):

```bash
python scripts/export_bundle_json.py
```

Then commit `web/data/bundle.json` and push.

---

## Legacy Streamlit app (optional / local)

```bash
python -m venv .venv
pip install -r requirements.txt
streamlit run app.py
```

**Docker** (self-hosted Streamlit): see `Dockerfile` and `docker-compose.yml`.

---

## Repository layout

- **`web/`** — Next.js 14 dashboard (primary for Vercel).
- **`app.py`**, **`pages/`** — Streamlit multipage app (legacy).
- **`utils/`** — Shared Python logic; `export_bundle_json.py` feeds `web/data/bundle.json`.
- **`scripts/export_bundle_json.py`** — Regenerate dashboard data.
