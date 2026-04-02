export default function AdminPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-instrument)] text-3xl text-white">Data / Admin</h1>
        <p className="mt-1 text-sm text-zinc-500">Static deployment (Vercel)</p>
      </div>

      <div className="glass-card rounded-2xl p-6 text-sm leading-relaxed text-zinc-400">
        <p>
          This web dashboard loads bundled JSON generated from the same sample pipeline as the legacy
          Streamlit app. There is no file upload in the static build.
        </p>
        <p className="mt-4">
          To refresh numbers: run{" "}
          <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-teal-200">
            python scripts/export_bundle_json.py
          </code>{" "}
          from the repo root, then commit <code className="font-mono text-xs">web/data/bundle.json</code>{" "}
          and redeploy.
        </p>
      </div>
    </div>
  );
}
