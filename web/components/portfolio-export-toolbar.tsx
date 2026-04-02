"use client";

import { usePortfolio } from "@/contexts/portfolio-context";
import {
  downloadCsv,
  downloadPortfolioZip,
  projectsToCsv,
  safeProjectFilename,
  singleProjectToCsv,
} from "@/lib/export-portfolio";
import { useState } from "react";

export function PortfolioExportToolbar() {
  const { bundle } = usePortfolio();
  const [zipping, setZipping] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => downloadCsv("pmo_projects.csv", projectsToCsv(bundle.projects))}
        className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-zinc-200 hover:bg-white/10"
      >
        Download all projects (CSV)
      </button>
      <button
        type="button"
        disabled={zipping}
        onClick={async () => {
          setZipping(true);
          try {
            await downloadPortfolioZip(bundle);
          } finally {
            setZipping(false);
          }
        }}
        className="rounded-lg border border-teal-500/40 bg-teal-500/15 px-3 py-2 text-xs font-medium text-teal-100 hover:bg-teal-500/25 disabled:opacity-50"
        title="ZIP: projects, milestones, resources, weekly_updates"
      >
        {zipping ? "Building ZIP…" : "Download full portfolio (ZIP)"}
      </button>
      <span className="text-[11px] text-zinc-600">
        ZIP contains projects, milestones, resources, weekly_updates (CSV each).
      </span>
    </div>
  );
}

export function ExportProjectCsvButton({ projectId }: { projectId: string }) {
  const { bundle } = usePortfolio();
  const p = bundle.projects.find((x) => x.project_id === projectId);
  if (!p) return null;
  return (
    <button
      type="button"
      onClick={() => downloadCsv(safeProjectFilename(p.project_id), singleProjectToCsv(p))}
      className="text-xs text-teal-400 hover:text-teal-300 hover:underline"
    >
      CSV
    </button>
  );
}
