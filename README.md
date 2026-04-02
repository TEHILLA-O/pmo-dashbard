# PMO Portfolio Intelligence Dashboard

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

The folder `landing/` is a static site that links visitors to your Streamlit deployment.

1. Push this repository to GitHub (same repo as the app is fine).
2. Import the project in [Vercel](https://vercel.com) from GitHub.
3. **Settings → General → Root Directory** → set to `landing` (not the repo root).
4. Framework Preset: **Other** (no build needed).
5. Deploy.

**Before or after the first deploy:** edit `landing/index.html` and replace the Streamlit URL in the main “Open dashboard” button (`href="..."`) with your real URL from Streamlit Cloud (for example `https://your-app.streamlit.app`).

## Repository layout

- `app.py` — home page entrypoint.
- `pages/` — multipage Streamlit routes (`1_Executive_Overview.py`, etc.).
- `utils/` — data loading, metrics, charts, exports.
- `components/` — reusable Streamlit UI sections.
- `landing/` — static HTML for Vercel only.
