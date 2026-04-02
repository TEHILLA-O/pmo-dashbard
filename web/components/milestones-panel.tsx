"use client";

import { usePortfolio } from "@/contexts/portfolio-context";
import {
  isMilestoneCompleted,
  isMilestoneOverdueOpen,
  isMilestoneUpcomingOpen,
} from "@/lib/milestone-helpers";
import type { MilestoneRow } from "@/lib/types";
import { useMemo, useState } from "react";

type TabKey = "overdue" | "upcoming" | "completed";

function fmtDate(iso: unknown): string {
  if (iso == null || String(iso).trim() === "") return "—";
  return String(iso).slice(0, 10);
}

export function MilestonesPanel() {
  const {
    bundle,
    addMilestone,
    updateMilestone,
    markMilestoneComplete,
    deleteMilestones,
  } = usePortfolio();
  const [tab, setTab] = useState<TabKey>("overdue");
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const projectById = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of bundle.projects) {
      m.set(p.project_id, p.project_name);
    }
    return m;
  }, [bundle.projects]);

  const projectIds = useMemo(() => bundle.projects.map((p) => p.project_id), [bundle.projects]);
  const firstProjectId = projectIds[0] ?? "";

  const { overdue, upcoming, completed } = useMemo(() => {
    const o: MilestoneRow[] = [];
    const u: MilestoneRow[] = [];
    const c: MilestoneRow[] = [];
    for (const m of bundle.milestones) {
      if (isMilestoneCompleted(m)) c.push(m);
      else if (isMilestoneOverdueOpen(m)) o.push(m);
      else if (isMilestoneUpcomingOpen(m)) u.push(m);
    }
    const sortDue = (a: MilestoneRow, b: MilestoneRow) =>
      String(a.due_date ?? "").localeCompare(String(b.due_date ?? ""));
    o.sort(sortDue);
    u.sort(sortDue);
    c.sort((a, b) =>
      String(b.completed_date ?? "").localeCompare(String(a.completed_date ?? ""))
    );
    return { overdue: o, upcoming: u, completed: c };
  }, [bundle.milestones]);

  const activeList =
    tab === "overdue" ? overdue : tab === "upcoming" ? upcoming : completed;

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: "overdue", label: "Overdue", count: overdue.length },
    { key: "upcoming", label: "Upcoming", count: upcoming.length },
    { key: "completed", label: "Completed", count: completed.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setTab(t.key);
                setEditingId(null);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                tab === t.key
                  ? "bg-emerald-600/90 text-white shadow-lg shadow-emerald-900/20"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
              }`}
            >
              {t.label}
              <span className="ml-2 tabular-nums text-xs opacity-80">({t.count})</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={!firstProjectId}
          onClick={() => {
            setShowAdd((v) => !v);
            setEditingId(null);
          }}
          className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {showAdd ? "Close form" : "Add milestone"}
        </button>
      </div>

      {!firstProjectId && (
        <p className="text-sm text-amber-400/90">
          Add a project under <strong className="text-zinc-300">Data / Admin</strong> first.
        </p>
      )}

      {showAdd && firstProjectId && (
        <MilestoneForm
          key="add"
          mode="add"
          projectOptions={projectIds}
          defaultProjectId={firstProjectId}
          onSubmit={(data) => {
            addMilestone(data);
            setShowAdd(false);
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-zinc-500">
              <th className="p-3">Milestone</th>
              <th className="p-3">Project</th>
              <th className="p-3">Due</th>
              {tab === "completed" ? <th className="p-3">Completed</th> : null}
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {activeList.length === 0 && (
              <tr>
                <td
                  colSpan={tab === "completed" ? 5 : 4}
                  className="p-8 text-center text-sm text-zinc-500"
                >
                  {tab === "overdue" && "No overdue milestones."}
                  {tab === "upcoming" && "No upcoming milestones."}
                  {tab === "completed" && "No completed milestones yet."}
                </td>
              </tr>
            )}
            {activeList.map((row) => {
              const id = String(row.milestone_id ?? "");
              const pid = String(row.project_id ?? "");
              const pname = projectById.get(pid) ?? pid;

              if (editingId === id && id) {
                return (
                  <tr key={id} className="border-b border-white/5 bg-white/[0.04]">
                    <td colSpan={tab === "completed" ? 5 : 4} className="p-4">
                      <MilestoneForm
                        mode="edit"
                        initial={row}
                        projectOptions={projectIds}
                        onSubmit={(data) => {
                          updateMilestone(id, {
                            milestone_name: data.milestone_name,
                            project_id: data.project_id,
                            due_date: data.due_date,
                          });
                          setEditingId(null);
                        }}
                        onCancel={() => setEditingId(null)}
                      />
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={id || `${pid}-${row.milestone_name}`} className="border-b border-white/5 hover:bg-white/[0.03]">
                  <td className="p-3">
                    <p className="font-medium text-zinc-100">{String(row.milestone_name ?? "—")}</p>
                    {id ? (
                      <p className="mt-0.5 font-mono text-[10px] text-zinc-600">{id}</p>
                    ) : null}
                  </td>
                  <td className="p-3">
                    <p className="text-zinc-200">{pname}</p>
                    <p className="font-mono text-[10px] text-zinc-600">{pid}</p>
                  </td>
                  <td className="p-3 tabular-nums text-zinc-400">{fmtDate(row.due_date)}</td>
                  {tab === "completed" ? (
                    <td className="p-3 tabular-nums text-emerald-400/90">
                      {fmtDate(row.completed_date)}
                    </td>
                  ) : null}
                  <td className="p-3 text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      {tab !== "completed" && id ? (
                        <button
                          type="button"
                          onClick={() => markMilestoneComplete(id)}
                          className="text-xs text-emerald-400 hover:underline"
                        >
                          Complete
                        </button>
                      ) : null}
                      {id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAdd(false);
                              setEditingId(id);
                            }}
                            className="text-xs text-zinc-400 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                confirm(
                                  `Delete milestone "${String(row.milestone_name ?? id)}"?`
                                )
                              ) {
                                deleteMilestones([id]);
                              }
                            }}
                            className="text-xs text-red-400 hover:underline"
                          >
                            Delete
                          </button>
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MilestoneForm({
  mode,
  initial,
  defaultProjectId,
  projectOptions,
  onSubmit,
  onCancel,
}: {
  mode: "add" | "edit";
  initial?: MilestoneRow;
  defaultProjectId?: string;
  projectOptions: string[];
  onSubmit: (data: { project_id: string; milestone_name: string; due_date: string }) => void;
  onCancel: () => void;
}) {
  const selectIds = useMemo(() => {
    const o = [...projectOptions];
    const pid = String(initial?.project_id ?? "");
    if (pid && !o.includes(pid)) o.unshift(pid);
    return o;
  }, [projectOptions, initial?.project_id]);

  const [milestone_name, setName] = useState(String(initial?.milestone_name ?? ""));
  const [project_id, setProjectId] = useState(
    String(initial?.project_id ?? defaultProjectId ?? selectIds[0] ?? "")
  );
  const [due_date, setDue] = useState(
    String(initial?.due_date ?? "").slice(0, 10) ||
      new Date().toISOString().slice(0, 10)
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = milestone_name.trim();
    if (!name || !project_id.trim() || due_date.length < 10) return;
    onSubmit({ project_id: project_id.trim(), milestone_name: name, due_date });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-xs text-zinc-500">
          Milestone name
          <input
            value={milestone_name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500/50"
            placeholder="e.g. Design sign-off"
          />
        </label>
        <label className="block text-xs text-zinc-500">
          Project
          <select
            value={project_id}
            onChange={(e) => setProjectId(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500/50"
          >
            {selectIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs text-zinc-500">
          Due date
          <input
            type="date"
            value={due_date}
            onChange={(e) => setDue(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500/50"
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          {mode === "add" ? "Add milestone" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/15 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
