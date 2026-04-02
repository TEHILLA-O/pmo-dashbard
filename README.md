# PMO Portfolio Intelligence Dashboard

GitHub: [TEHILLA-O/pmo-dashbard](https://github.com/TEHILLA-O/pmo-dashbard)

Streamlit app for portfolio governance: executive KPIs, risk, resources, prioritization, weekly status, exports, and admin data upload.

## Run locally

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
streamlit run app.py
```

Open the URL Streamlit prints (usually `http://localhost:8501`).

## Deploy the app (Streamlit Community Cloud)

1. Push this repository to GitHub.
2. Go to [Streamlit Community Cloud](https://streamlit.io/cloud) and sign in with GitHub.
3. **New app** → pick this repo, branch `main`, **Main file path**: `app.py`.
4. Deploy. Your app will be at `https://<your-app-name>.streamlit.app`.

Optional: add secrets in the Cloud dashboard under **App settings → Secrets** if you later use `st.secrets` (local file `.streamlit/secrets.toml` is gitignored).

## Deploy the landing page (Vercel)

The folder `landing/` is a static site that links visitors to your Streamlit deployment. Because `requirements.txt` lives at the repo root for Streamlit Cloud, Vercel would otherwise try to run the **Python** builder and fail. This repo includes **`vercel.json`** + **`package.json`**: `npm run build` copies `landing/` → `dist/`, and Vercel publishes **`dist/`** as a static site.

1. Push this repository to GitHub.
2. Import the project in [Vercel](https://vercel.com) from GitHub (use the **repository root** — do not set Root Directory to `landing` unless you remove the Node build).
3. Leave defaults so **Build Command** is `npm run build` and **Output Directory** is `dist` (from `vercel.json`), or confirm they match after import.
4. Deploy.

**Optional:** If you prefer no Node step, set **Root Directory** to `landing` only and remove/ignore the root `vercel.json` build — then use Framework **Other** with no build.

**Before or after the first deploy:** edit `landing/index.html` and set the Streamlit URL and GitHub link in the buttons.

## Repository layout

- `app.py` — home page entrypoint.
- `pages/` — multipage Streamlit routes (`1_Executive_Overview.py`, etc.).
- `utils/` — data loading, metrics, charts, exports.
- `components/` — reusable Streamlit UI sections.
- `landing/` — static HTML for Vercel only.
