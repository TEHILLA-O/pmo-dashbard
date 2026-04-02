"use client";

import type { DataBundle, MilestoneRow, ProjectRow, ResourceRow } from "@/lib/types";
import { recalculateAllProjects } from "@/lib/health";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import initialJson from "@/data/bundle.json";

const STORAGE_KEY = "pmo-dashbard-bundle-v1";

function cloneBundle(b: DataBundle): DataBundle {
  return {
    projects: b.projects.map((p) => ({ ...p })),
    milestones: b.milestones.map((m) => ({ ...m })),
    resources: b.resources.map((r) => ({ ...r })),
    weekly_updates: b.weekly_updates.map((w) => ({ ...w })),
  };
}

function seedBundle(): DataBundle {
  const b = cloneBundle(initialJson as DataBundle);
  b.projects = recalculateAllProjects(b.projects);
  return b;
}

type Ctx = {
  bundle: DataBundle;
  resetToSample: () => void;
  addProject: (row: Omit<ProjectRow, "project_id"> & { project_name: string }) => void;
  updateProject: (projectId: string, patch: Partial<ProjectRow>) => void;
  deleteProjects: (projectIds: string[]) => void;
};

const PortfolioContext = createContext<Ctx | null>(null);

function nextProjectId(projects: ProjectRow[]): string {
  let max = 0;
  for (const p of projects) {
    const m = /^PRJ-(\d+)$/i.exec(String(p.project_id).trim());
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `PRJ-${String(max + 1).padStart(3, "0")}`;
}

function parsePrjIndex(pid: string): number {
  const m = /^PRJ-(\d+)$/i.exec(pid.trim());
  return m ? parseInt(m[1], 10) : 0;
}

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [bundle, setBundle] = useState<DataBundle>(seedBundle);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as DataBundle;
        if (Array.isArray(parsed?.projects)) {
          const merged: DataBundle = {
            projects: recalculateAllProjects(parsed.projects as ProjectRow[]),
            milestones: Array.isArray(parsed.milestones) ? parsed.milestones : [],
            resources: Array.isArray(parsed.resources) ? parsed.resources : [],
            weekly_updates: Array.isArray(parsed.weekly_updates) ? parsed.weekly_updates : [],
          };
          setBundle(merged);
        }
      }
    } catch {
      /* keep sample */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bundle));
    } catch {
      /* quota */
    }
  }, [bundle, hydrated]);

  const resetToSample = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setBundle(seedBundle());
  }, []);

  const addProject = useCallback(
    (row: Partial<ProjectRow> & { project_name: string }) => {
      setBundle((prev) => {
        const pid = nextProjectId(prev.projects);
        const projNum = parsePrjIndex(pid);
        const today = new Date();
        const iso = (d: Date) => d.toISOString().slice(0, 10) + "T00:00:00.000";

        const newProject = {
          project_id: pid,
          project_name: row.project_name.trim(),
          project_manager: String(row.project_manager ?? "—"),
          sponsor: String(row.sponsor ?? "—"),
          business_unit: String(row.business_unit ?? "Technology"),
          start_date: String(row.start_date ?? iso(today)),
          end_date: String(row.end_date ?? iso(new Date(today.getTime() + 180 * 86400000))),
          planned_progress: Number(row.planned_progress ?? 40),
          actual_progress: Number(row.actual_progress ?? 35),
          status: String(row.status ?? "On Track"),
          budget: Number(row.budget ?? 500000),
          actual_cost: Number(row.actual_cost ?? 450000),
          priority: String(row.priority ?? "Medium"),
          strategic_alignment_score: Number(row.strategic_alignment_score ?? 70),
          roi_score: Number(row.roi_score ?? 70),
          urgency_score: Number(row.urgency_score ?? 50),
          risk_probability: Number(row.risk_probability ?? 3),
          risk_impact: Number(row.risk_impact ?? 2),
          open_risks_count: Number(row.open_risks_count ?? 0),
          overdue_milestones: Number(row.overdue_milestones ?? 0),
          resource_utilization_percent: Number(row.resource_utilization_percent ?? 85),
          comments: String(row.comments ?? "—").trim() || "—",
          health_score: 0,
        } as ProjectRow;

        const wu = [0, 1].map((w) => ({
          update_id: `UPD-${String(projNum).padStart(3, "0")}-${w + 1}`,
          project_id: pid,
          reporting_week: iso(new Date(today.getTime() - 7 * 86400000 * w)),
          key_achievement: "Governance cadence established; baseline scope confirmed.",
          blocker: "No major blockers this week.",
          next_step: "Confirm RAID ownership and weekly reporting rhythm.",
          status_note: "Delivery confidence moderate while team ramps.",
        }));

        return {
          ...prev,
          projects: recalculateAllProjects([...prev.projects, newProject]),
          weekly_updates: [...prev.weekly_updates, ...wu],
        };
      });
    },
    []
  );

  const updateProject = useCallback((projectId: string, patch: Partial<ProjectRow>) => {
    const drop = new Set([
      "budget_variance",
      "budget_variance_pct",
      "schedule_variance",
      "progress_lag",
      "risk_score",
      "delayed_flag",
      "health_score",
      "rag_health",
    ]);
    const clean: Partial<ProjectRow> = { ...patch };
    for (const k of Array.from(drop)) delete clean[k as keyof ProjectRow];

    setBundle((prev) => ({
      ...prev,
      projects: recalculateAllProjects(
        prev.projects.map((p) =>
          p.project_id === projectId ? { ...p, ...clean, project_id: projectId } : p
        )
      ),
    }));
  }, []);

  const deleteProjects = useCallback((projectIds: string[]) => {
    const set = new Set(projectIds);
    setBundle((prev) => ({
      projects: recalculateAllProjects(prev.projects.filter((p) => !set.has(p.project_id))),
      milestones: prev.milestones.filter(
        (m) => !set.has(String((m as MilestoneRow).project_id ?? ""))
      ),
      resources: prev.resources.filter(
        (r) => !set.has(String((r as ResourceRow).project_id ?? ""))
      ),
      weekly_updates: prev.weekly_updates.filter(
        (w) => !set.has(String((w as { project_id?: string }).project_id ?? ""))
      ),
    }));
  }, []);

  const value = useMemo(
    () => ({
      bundle,
      resetToSample,
      addProject,
      updateProject,
      deleteProjects,
    }),
    [bundle, resetToSample, addProject, updateProject, deleteProjects]
  );

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
}
