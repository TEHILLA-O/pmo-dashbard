"use client";

import type {
  DataBundle,
  MilestoneRow,
  ProjectRow,
  ResourceRow,
  WeeklyUpdateRow,
} from "@/lib/types";
import { recalculateAllProjects } from "@/lib/health";
import {
  ensureMilestoneIds,
  nextMilestoneId,
  normalizeMilestoneRow,
  syncProjectOverdueFromMilestones,
  todayCompletedIso,
  toDueIso,
} from "@/lib/milestone-helpers";
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
  const milestones = ensureMilestoneIds(b.milestones as MilestoneRow[]).map(normalizeMilestoneRow);
  b.milestones = milestones;
  b.projects = recalculateAllProjects(syncProjectOverdueFromMilestones(b.projects, milestones));
  return b;
}

type WeeklyUpdateInput = {
  project_id: string;
  reporting_week: string;
  key_achievement: string;
  blocker: string;
  next_step: string;
  status_note?: string;
};

type ResourceInput = {
  resource_name: string;
  project_id: string;
  role?: string;
  allocation_percent: number;
};

type MilestoneInput = {
  project_id: string;
  milestone_name: string;
  due_date: string;
};

type Ctx = {
  bundle: DataBundle;
  resetToSample: () => void;
  addProject: (row: Omit<ProjectRow, "project_id"> & { project_name: string }) => void;
  updateProject: (projectId: string, patch: Partial<ProjectRow>) => void;
  deleteProjects: (projectIds: string[]) => void;
  addResource: (input: ResourceInput) => void;
  updateResource: (resourceId: string, patch: Partial<ResourceRow>) => void;
  deleteResources: (resourceIds: string[]) => void;
  addWeeklyUpdate: (input: WeeklyUpdateInput) => void;
  updateWeeklyUpdate: (updateId: string, patch: Partial<WeeklyUpdateInput>) => void;
  deleteWeeklyUpdates: (updateIds: string[]) => void;
  addMilestone: (input: MilestoneInput) => void;
  updateMilestone: (milestoneId: string, patch: Partial<MilestoneRow>) => void;
  markMilestoneComplete: (milestoneId: string) => void;
  deleteMilestones: (milestoneIds: string[]) => void;
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

function prjSegmentForResourceId(projectId: string): string {
  const m = /^PRJ-(\d+)$/i.exec(String(projectId).trim());
  return m ? m[1].padStart(3, "0") : "000";
}

function nextResourceId(resources: ResourceRow[], projectId: string): string {
  const seg = prjSegmentForResourceId(projectId);
  const prefix = `RES-${seg}-`;
  let maxSeq = 0;
  for (const r of resources) {
    const id = String(r.resource_id ?? "").trim();
    if (!id.startsWith(prefix)) continue;
    const rest = id.slice(prefix.length);
    const n = parseInt(rest, 10);
    if (!Number.isNaN(n)) maxSeq = Math.max(maxSeq, n);
  }
  return `${prefix}${String(maxSeq + 1).padStart(2, "0")}`;
}

function ensureResourceIds(resources: ResourceRow[]): ResourceRow[] {
  return resources.map((r, i) => {
    const rid = String(r.resource_id ?? "").trim();
    if (rid) return { ...r };
    return {
      ...r,
      resource_id: `RES-ORPHAN-${String(i).padStart(4, "0")}`,
    };
  });
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
          const rawMs = Array.isArray(parsed.milestones) ? (parsed.milestones as MilestoneRow[]) : [];
          const milestones = ensureMilestoneIds(rawMs).map(normalizeMilestoneRow);
          const mergedProjects = syncProjectOverdueFromMilestones(
            parsed.projects as ProjectRow[],
            milestones
          );
          const merged: DataBundle = {
            projects: recalculateAllProjects(mergedProjects),
            milestones,
            resources: Array.isArray(parsed.resources)
              ? ensureResourceIds(parsed.resources as ResourceRow[])
              : [],
            weekly_updates: Array.isArray(parsed.weekly_updates)
              ? (parsed.weekly_updates as WeeklyUpdateRow[])
              : [],
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
    setBundle((prev) => {
      const milestones = prev.milestones.filter(
        (m) => !set.has(String((m as MilestoneRow).project_id ?? ""))
      );
      const projects = recalculateAllProjects(
        syncProjectOverdueFromMilestones(
          prev.projects.filter((p) => !set.has(p.project_id)),
          milestones
        )
      );
      return {
        ...prev,
        projects,
        milestones,
        resources: prev.resources.filter(
          (r) => !set.has(String((r as ResourceRow).project_id ?? ""))
        ),
        weekly_updates: prev.weekly_updates.filter(
          (w) => !set.has(String(w.project_id ?? ""))
        ),
      };
    });
  }, []);

  const addResource = useCallback((input: ResourceInput) => {
    const name = input.resource_name.trim();
    const pid = input.project_id.trim();
    if (!name || !pid) return;
    const alloc = Math.min(200, Math.max(0, Number(input.allocation_percent)));
    const avail = Math.max(0, 100 - alloc);
    setBundle((prev) => {
      const resource_id = nextResourceId(prev.resources, pid);
      const row: ResourceRow = {
        resource_id,
        resource_name: name,
        project_id: pid,
        role: String(input.role ?? "").trim() || "—",
        allocation_percent: alloc,
        available_capacity_percent: avail,
      };
      return { ...prev, resources: [...prev.resources, row] };
    });
  }, []);

  const updateResource = useCallback((resourceId: string, patch: Partial<ResourceRow>) => {
    const rid = resourceId.trim();
    if (!rid) return;
    setBundle((prev) => ({
      ...prev,
      resources: prev.resources.map((r) => {
        if (String(r.resource_id ?? "") !== rid) return r;
        const next: ResourceRow = { ...r, ...patch, resource_id: rid };
        if (patch.resource_name != null) next.resource_name = String(patch.resource_name).trim();
        if (patch.project_id != null) next.project_id = String(patch.project_id).trim();
        if (patch.role != null) next.role = String(patch.role).trim() || "—";
        if (patch.allocation_percent != null) {
          const alloc = Math.min(200, Math.max(0, Number(patch.allocation_percent)));
          next.allocation_percent = alloc;
          if (patch.available_capacity_percent === undefined) {
            next.available_capacity_percent = Math.max(0, 100 - alloc);
          }
        }
        return next;
      }),
    }));
  }, []);

  const deleteResources = useCallback((resourceIds: string[]) => {
    const set = new Set(resourceIds.map((id) => id.trim()).filter(Boolean));
    if (set.size === 0) return;
    setBundle((prev) => ({
      ...prev,
      resources: prev.resources.filter((r) => !set.has(String(r.resource_id ?? ""))),
    }));
  }, []);

  const addWeeklyUpdate = useCallback((input: WeeklyUpdateInput) => {
    const reporting =
      input.reporting_week.length === 10
        ? `${input.reporting_week}T00:00:00.000`
        : input.reporting_week;
    const row: WeeklyUpdateRow = {
      update_id: `UPD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      project_id: input.project_id.trim(),
      reporting_week: reporting,
      key_achievement: input.key_achievement.trim(),
      blocker: input.blocker.trim(),
      next_step: input.next_step.trim(),
      status_note: (input.status_note ?? "").trim() || undefined,
    };
    setBundle((prev) => ({
      ...prev,
      weekly_updates: [...prev.weekly_updates, row],
    }));
  }, []);

  const updateWeeklyUpdate = useCallback((updateId: string, patch: Partial<WeeklyUpdateInput>) => {
    setBundle((prev) => ({
      ...prev,
      weekly_updates: prev.weekly_updates.map((w) => {
        if (w.update_id !== updateId) return w;
        const next = { ...w };
        if (patch.project_id != null) next.project_id = patch.project_id.trim();
        if (patch.reporting_week != null) {
          next.reporting_week =
            patch.reporting_week.length === 10
              ? `${patch.reporting_week}T00:00:00.000`
              : patch.reporting_week;
        }
        if (patch.key_achievement != null) next.key_achievement = patch.key_achievement.trim();
        if (patch.blocker != null) next.blocker = patch.blocker.trim();
        if (patch.next_step != null) next.next_step = patch.next_step.trim();
        if (patch.status_note !== undefined) {
          next.status_note = patch.status_note.trim() || undefined;
        }
        return next;
      }),
    }));
  }, []);

  const deleteWeeklyUpdates = useCallback((updateIds: string[]) => {
    const set = new Set(updateIds);
    setBundle((prev) => ({
      ...prev,
      weekly_updates: prev.weekly_updates.filter((w) => !set.has(w.update_id)),
    }));
  }, []);

  const addMilestone = useCallback((input: MilestoneInput) => {
    const pid = input.project_id.trim();
    const name = input.milestone_name.trim();
    if (!pid || !name) return;
    const ymd = input.due_date.trim().slice(0, 10);
    if (ymd.length < 10) return;
    setBundle((prev) => {
      const milestone_id = nextMilestoneId(prev.milestones, pid);
      let row: MilestoneRow = {
        milestone_id,
        project_id: pid,
        milestone_name: name,
        due_date: toDueIso(ymd),
        completed_date: null,
        status: "Upcoming",
        overdue_flag: 0,
      };
      row = normalizeMilestoneRow(row);
      const milestones = [...prev.milestones, row];
      const projects = recalculateAllProjects(
        syncProjectOverdueFromMilestones(prev.projects, milestones)
      );
      return { ...prev, milestones, projects };
    });
  }, []);

  const updateMilestone = useCallback((milestoneId: string, patch: Partial<MilestoneRow>) => {
    const mid = milestoneId.trim();
    if (!mid) return;
    setBundle((prev) => {
      const milestones = prev.milestones.map((m) => {
        if (String(m.milestone_id ?? "") !== mid) return m;
        let next: MilestoneRow = { ...m, ...patch, milestone_id: mid };
        if (patch.milestone_name != null) next.milestone_name = String(patch.milestone_name).trim();
        if (patch.project_id != null) next.project_id = String(patch.project_id).trim();
        if (patch.due_date != null) {
          const d = String(patch.due_date);
          next.due_date = d.includes("T") ? d : toDueIso(d.slice(0, 10));
        }
        if (patch.completed_date !== undefined) {
          const c = patch.completed_date;
          if (c == null || String(c).trim() === "") {
            next.completed_date = null;
            next.status = "Upcoming";
          } else {
            next.completed_date = String(c);
            next.status = "Completed";
            next.overdue_flag = 0;
          }
        }
        return normalizeMilestoneRow(next);
      });
      const projects = recalculateAllProjects(
        syncProjectOverdueFromMilestones(prev.projects, milestones)
      );
      return { ...prev, milestones, projects };
    });
  }, []);

  const markMilestoneComplete = useCallback(
    (milestoneId: string) => {
      updateMilestone(milestoneId, { completed_date: todayCompletedIso() });
    },
    [updateMilestone]
  );

  const deleteMilestones = useCallback((milestoneIds: string[]) => {
    const set = new Set(milestoneIds.map((x) => x.trim()).filter(Boolean));
    if (set.size === 0) return;
    setBundle((prev) => {
      const milestones = prev.milestones.filter((m) => !set.has(String(m.milestone_id ?? "")));
      const projects = recalculateAllProjects(
        syncProjectOverdueFromMilestones(prev.projects, milestones)
      );
      return { ...prev, milestones, projects };
    });
  }, []);

  const value = useMemo(
    () => ({
      bundle,
      resetToSample,
      addProject,
      updateProject,
      deleteProjects,
      addResource,
      updateResource,
      deleteResources,
      addWeeklyUpdate,
      updateWeeklyUpdate,
      deleteWeeklyUpdates,
      addMilestone,
      updateMilestone,
      markMilestoneComplete,
      deleteMilestones,
    }),
    [
      bundle,
      resetToSample,
      addProject,
      updateProject,
      deleteProjects,
      addResource,
      updateResource,
      deleteResources,
      addWeeklyUpdate,
      updateWeeklyUpdate,
      deleteWeeklyUpdates,
      addMilestone,
      updateMilestone,
      markMilestoneComplete,
      deleteMilestones,
    ]
  );

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
}
