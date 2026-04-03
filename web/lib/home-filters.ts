import type { DataBundle, ExecutiveKpis, ProjectRow } from "./types";
import { computePortfolioExecutiveKpis } from "./metrics";

export type HomeFilterState = {
  status: string;
  businessUnit: string;
  priority: string;
};

export const defaultHomeFilters: HomeFilterState = {
  status: "all",
  businessUnit: "all",
  priority: "all",
};

export function filterProjects(projects: ProjectRow[], f: HomeFilterState): ProjectRow[] {
  return projects.filter((p) => {
    if (f.status !== "all" && String(p.status) !== f.status) return false;
    if (f.businessUnit !== "all" && String(p.business_unit ?? "").trim() !== f.businessUnit)
      return false;
    if (f.priority !== "all" && String(p.priority ?? "").trim() !== f.priority) return false;
    return true;
  });
}

export function getKpisForProjectSubset(bundle: DataBundle, projects: ProjectRow[]): ExecutiveKpis {
  const ids = new Set(projects.map((p) => p.project_id));
  const milestones = bundle.milestones.filter((m) => ids.has(String(m.project_id ?? "")));
  const resources = bundle.resources.filter((r) => ids.has(String(r.project_id ?? "")));
  return computePortfolioExecutiveKpis(projects, milestones, resources);
}

export function uniqueSorted(values: (string | undefined)[]): string[] {
  const s = new Set<string>();
  for (const v of values) {
    const t = String(v ?? "").trim();
    if (t) s.add(t);
  }
  return Array.from(s).sort((a, b) => a.localeCompare(b));
}
