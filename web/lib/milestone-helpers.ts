import type { MilestoneRow, ProjectRow } from "./types";

function dueDay(iso: unknown): Date | null {
  if (iso == null || String(iso).trim() === "") return null;
  const d = new Date(String(iso));
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isMilestoneCompleted(m: MilestoneRow): boolean {
  const cd = m.completed_date;
  if (cd != null && String(cd).trim() !== "" && String(cd).toLowerCase() !== "null") {
    return true;
  }
  return String(m.status ?? "").toLowerCase() === "completed";
}

/** Open milestone: past due and not completed. */
export function isMilestoneOverdueOpen(m: MilestoneRow): boolean {
  if (isMilestoneCompleted(m)) return false;
  if (Number(m.overdue_flag)) return true;
  const due = dueDay(m.due_date);
  if (!due) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

/** Not completed and not overdue (future or today due). */
export function isMilestoneUpcomingOpen(m: MilestoneRow): boolean {
  if (isMilestoneCompleted(m)) return false;
  if (isMilestoneOverdueOpen(m)) return false;
  return true;
}

/** Recompute status / overdue_flag for a single row from dates (completed rows unchanged). */
export function normalizeMilestoneRow(m: MilestoneRow): MilestoneRow {
  if (isMilestoneCompleted(m)) {
    return {
      ...m,
      overdue_flag: 0,
      status: String(m.status ?? "Completed") || "Completed",
    };
  }
  const due = dueDay(m.due_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdue = due != null && due < today ? 1 : 0;
  return {
    ...m,
    overdue_flag: overdue,
    status: overdue ? "Overdue" : "Upcoming",
  };
}

export function countOverdueOpenForProject(
  milestones: MilestoneRow[],
  projectId: string
): number {
  let n = 0;
  for (const m of milestones) {
    if (String(m.project_id ?? "") !== projectId) continue;
    if (isMilestoneOverdueOpen(m)) n++;
  }
  return n;
}

export function syncProjectOverdueFromMilestones(
  projects: ProjectRow[],
  milestones: MilestoneRow[]
): ProjectRow[] {
  return projects.map((p) => ({
    ...p,
    overdue_milestones: countOverdueOpenForProject(milestones, p.project_id),
  }));
}

export function prjSegment(projectId: string): string {
  const m = /^PRJ-(\d+)$/i.exec(String(projectId).trim());
  return m ? m[1].padStart(3, "0") : "000";
}

export function nextMilestoneId(milestones: MilestoneRow[], projectId: string): string {
  const seg = prjSegment(projectId);
  const prefix = `MS-${seg}-`;
  let maxSeq = 0;
  for (const m of milestones) {
    const id = String(m.milestone_id ?? "").trim();
    if (!id.startsWith(prefix)) continue;
    const rest = id.slice(prefix.length);
    const n = parseInt(rest, 10);
    if (!Number.isNaN(n)) maxSeq = Math.max(maxSeq, n);
  }
  return `${prefix}${String(maxSeq + 1).padStart(2, "0")}`;
}

export function ensureMilestoneIds(milestones: MilestoneRow[]): MilestoneRow[] {
  return milestones.map((m, i) => {
    const mid = String(m.milestone_id ?? "").trim();
    const pid = String(m.project_id ?? "").trim();
    if (mid) return { ...m };
    return {
      ...m,
      milestone_id: `MS-ORPHAN-${String(i).padStart(4, "0")}`,
      project_id: pid || "PRJ-001",
    };
  });
}

export function toDueIso(dateYmd: string): string {
  const s = dateYmd.trim();
  if (s.length === 10) return `${s}T00:00:00.000`;
  return s;
}

export function todayCompletedIso(): string {
  return new Date().toISOString().slice(0, 10) + "T00:00:00.000";
}
