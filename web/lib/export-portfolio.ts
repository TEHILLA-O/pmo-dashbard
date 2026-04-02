import type { DataBundle, ProjectRow } from "./types";
import JSZip from "jszip";

const UTF8_BOM = "\uFEFF";

/** Column order aligned with Python sample / data_loader expectations */
const PROJECT_COLUMNS: (keyof ProjectRow | string)[] = [
  "project_id",
  "project_name",
  "project_manager",
  "sponsor",
  "business_unit",
  "start_date",
  "end_date",
  "planned_progress",
  "actual_progress",
  "status",
  "budget",
  "actual_cost",
  "priority",
  "strategic_alignment_score",
  "roi_score",
  "urgency_score",
  "risk_probability",
  "risk_impact",
  "open_risks_count",
  "overdue_milestones",
  "resource_utilization_percent",
  "comments",
  "budget_variance",
  "budget_variance_pct",
  "schedule_variance",
  "progress_lag",
  "risk_score",
  "delayed_flag",
  "health_score",
  "rag_health",
];

function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return "";
  const s = String(val);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function recordToRow(rec: Record<string, unknown>, keys: string[]): string {
  return keys.map((k) => escapeCsvCell(rec[k])).join(",");
}

export function projectsToCsv(projects: ProjectRow[]): string {
  if (projects.length === 0) {
    return PROJECT_COLUMNS.join(",");
  }
  const header = PROJECT_COLUMNS.map((c) => escapeCsvCell(c)).join(",");
  const lines = projects.map((p) =>
    recordToRow(p as Record<string, unknown>, PROJECT_COLUMNS as string[])
  );
  return [header, ...lines].join("\n");
}

export function singleProjectToCsv(project: ProjectRow): string {
  return projectsToCsv([project]);
}

function tableToCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const keys = Object.keys(rows[0]);
  const header = keys.map(escapeCsvCell).join(",");
  const body = rows.map((row) => recordToRow(row, keys)).join("\n");
  return `${header}\n${body}`;
}

export function defaultZipFilename(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `pmo_portfolio_export_${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}.zip`;
}

export function downloadCsv(filename: string, csvBody: string) {
  const blob = new Blob([UTF8_BOM + csvBody], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function downloadPortfolioZip(bundle: DataBundle) {
  const zip = new JSZip();
  zip.file("projects.csv", UTF8_BOM + projectsToCsv(bundle.projects));
  zip.file(
    "milestones.csv",
    UTF8_BOM + tableToCsv(bundle.milestones as Record<string, unknown>[])
  );
  zip.file(
    "resources.csv",
    UTF8_BOM + tableToCsv(bundle.resources as Record<string, unknown>[])
  );
  zip.file(
    "weekly_updates.csv",
    UTF8_BOM + tableToCsv(bundle.weekly_updates as Record<string, unknown>[])
  );
  const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = defaultZipFilename();
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function safeProjectFilename(projectId: string) {
  return `pmo_project_${projectId.replace(/[^a-zA-Z0-9-_]/g, "_")}.csv`;
}
