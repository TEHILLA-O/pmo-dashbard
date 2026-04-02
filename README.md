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

### Run locally with Docker (same as production)

```bash
docker compose up --build
```

Then open `http://localhost:8501`.

---

## Deploy the app (recommended): Docker — runs on its own

The dashboard is packaged as **one Docker image**. You get a **normal HTTPS URL** from your host. You do **not** need Streamlit Community Cloud, and visitors are **not** forced through Streamlit’s sign-in page.

**Requirements:** `Dockerfile` at repo root, `requirements-prod.txt` for the image.

### Render (example)

1. Push this repo to GitHub.
2. [Render](https://render.com) → **New** → **Web Service** → connect the repo.
3. **Runtime:** Docker (auto-detects `Dockerfile`).
4. Deploy. Use the URL Render assigns (e.g. `https://pmo-dashboard.onrender.com`).

Optional: connect the `render.yaml` Blueprint if you use Blueprint deploys.

### Railway / Fly.io / Google Cloud Run / Azure Container Apps

- **Railway:** New project → Deploy from GitHub → select repo; it builds `Dockerfile`.
- **Fly.io:** `fly launch` after installing the Fly CLI (follow their Docker guide).
- **Cloud Run / others:** deploy the same image; set **port** from the platform (the app reads `PORT`).

### After deploy

- Put that public URL in `landing/index.html` (“Open dashboard”) if you use the Vercel landing page.

### Optional: Streamlit Community Cloud

If you still want Streamlit to host it: [streamlit.io/cloud](https://streamlit.io/cloud) → New app → `app.py`. Note: private apps and account access behave like their product (separate from Docker self-host).

---

## Deploy the landing page (Vercel)

Optional static site in `landing/`. Root `vercel.json` + `package.json` run `npm run build`, which copies `landing/` → `dist/` so Vercel does not treat the repo as a Python project.

1. Import the repo in [Vercel](https://vercel.com) (repository root).
2. Confirm build output is `dist` per `vercel.json`.

---

## Repository layout

- `app.py` — home page entrypoint.
- `pages/` — multipage Streamlit routes (`1_Executive_Overview.py`, etc.).
- `utils/` — data loading, metrics, charts, exports.
- `components/` — reusable Streamlit UI sections.
- `Dockerfile` / `docker-compose.yml` — self-hosted deployment.
- `landing/` — static HTML for optional Vercel landing.
