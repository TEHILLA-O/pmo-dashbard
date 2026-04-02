"use client";

import { WeeklyVolumeChart } from "@/components/charts/weekly-volume-chart";
import { usePortfolio } from "@/contexts/portfolio-context";
import type { WeeklyUpdateRow } from "@/lib/types";
import { useMemo, useState } from "react";

function reportingDateInputValue(iso: string): string {
  const s = String(iso);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

export function WeeklyReportsPanel() {
  const {
    bundle,
    addWeeklyUpdate,
    updateWeeklyUpdate,
    deleteWeeklyUpdates,
  } = usePortfolio();

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const sorted = useMemo(
    () =>
      [...bundle.weekly_updates].sort((a, b) =>
        String(b.reporting_week).localeCompare(String(a.reporting_week))
      ),
    [bundle.weekly_updates]
  );

  const firstProjectId = bundle.projects[0]?.project_id ?? "";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-instrument)] text-3xl text-white">
            Weekly Status Reports
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Narrative updates per project — add, edit, or delete (saved in this browser).
          </p>
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
          {showAdd ? "Close form" : "Add weekly update"}
        </button>
      </div>

      {bundle.weekly_updates.length > 0 && (
        <div className="glass-card rounded-2xl p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Updates by reporting week
          </p>
          <WeeklyVolumeChart updates={bundle.weekly_updates} />
        </div>
      )}

      {!firstProjectId && (
        <p className="text-sm text-amber-400/90">
          Add a project under <strong>Data / Admin</strong> before you can create weekly updates.
        </p>
      )}

      {showAdd && firstProjectId && (
        <WeeklyUpdateForm
          key="add"
          mode="add"
          projectOptions={bundle.projects.map((p) => p.project_id)}
          defaultProjectId={firstProjectId}
          onSubmit={(data) => {
            addWeeklyUpdate(data);
            setShowAdd(false);
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      <div className="space-y-4">
        {sorted.length === 0 && (
          <p className="text-sm text-zinc-500">No weekly updates yet. Use &quot;Add weekly update&quot;.</p>
        )}
        {sorted.map((u) =>
          editingId === u.update_id ? (
            <WeeklyUpdateForm
              key={u.update_id}
              mode="edit"
              initial={u}
              projectOptions={bundle.projects.map((p) => p.project_id)}
              onSubmit={(data) => {
                updateWeeklyUpdate(u.update_id, data);
                setEditingId(null);
              }}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <article key={u.update_id} className="glass-card rounded-xl p-5 text-sm">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="font-mono text-xs text-emerald-400">{u.project_id}</span>
                  <span className="text-xs text-zinc-500">
                    {reportingDateInputValue(u.reporting_week)}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-600">{u.update_id}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdd(false);
                      setEditingId(u.update_id);
                    }}
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete this weekly update (${u.update_id})?`)) {
                        deleteWeeklyUpdates([u.update_id]);
                      }
                    }}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="mt-3 text-zinc-300">
                <strong className="text-zinc-500">Achievement:</strong> {u.key_achievement}
              </p>
              <p className="mt-2 text-zinc-500">
                <strong>Blocker:</strong> {u.blocker}
              </p>
              <p className="mt-2 text-zinc-500">
                <strong>Next:</strong> {u.next_step}
              </p>
              {u.status_note ? (
                <p className="mt-2 text-xs text-zinc-600">
                  <strong className="text-zinc-500">Status note:</strong> {u.status_note}
                </p>
              ) : null}
            </article>
          )
        )}
      </div>
    </div>
  );
}

function WeeklyUpdateForm({
  mode,
  initial,
  defaultProjectId,
  projectOptions,
  onSubmit,
  onCancel,
}: {
  mode: "add" | "edit";
  initial?: WeeklyUpdateRow;
  defaultProjectId?: string;
  projectOptions: string[];
  onSubmit: (data: {
    project_id: string;
    reporting_week: string;
    key_achievement: string;
    blocker: string;
    next_step: string;
    status_note?: string;
  }) => void;
  onCancel: () => void;
}) {
  const selectIds = useMemo(() => {
    const o = [...projectOptions];
    if (initial?.project_id && !o.includes(initial.project_id)) o.unshift(initial.project_id);
    return o;
  }, [projectOptions, initial?.project_id]);

  const [project_id, setProjectId] = useState(
    initial?.project_id ?? defaultProjectId ?? selectIds[0] ?? ""
  );
  const [reporting_week, setReportingWeek] = useState(
    reportingDateInputValue(initial?.reporting_week ?? new Date().toISOString())
  );
  const [key_achievement, setAchievement] = useState(initial?.key_achievement ?? "");
  const [blocker, setBlocker] = useState(initial?.blocker ?? "");
  const [next_step, setNext] = useState(initial?.next_step ?? "");
  const [status_note, setStatusNote] = useState(initial?.status_note ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!project_id.trim()) return;
    if (!key_achievement.trim() || !blocker.trim() || !next_step.trim()) return;
    onSubmit({
      project_id,
      reporting_week,
      key_achievement,
      blocker,
      next_step,
      status_note: status_note.trim() || undefined,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="glass-card space-y-4 rounded-xl border border-emerald-500/25 p-5 text-sm"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400/90">
        {mode === "add" ? "New weekly update" : "Edit weekly update"}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs text-zinc-500">
          Project
          {selectIds.length > 0 ? (
            <select
              className="mt-1 w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-zinc-200"
              value={project_id}
              onChange={(e) => setProjectId(e.target.value)}
              required
            >
              {selectIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          ) : (
            <input
              className="mt-1 w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-zinc-200"
              value={project_id}
              onChange={(e) => setProjectId(e.target.value)}
              required
            />
          )}
        </label>
        <label className="block text-xs text-zinc-500">
          Reporting week
          <input
            type="date"
            required
            className="mt-1 w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-zinc-200"
            value={reporting_week}
            onChange={(e) => setReportingWeek(e.target.value)}
          />
        </label>
        <label className="block text-xs text-zinc-500 sm:col-span-2">
          Achievement
          <textarea
            required
            rows={2}
            className="mt-1 w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-zinc-200"
            value={key_achievement}
            onChange={(e) => setAchievement(e.target.value)}
          />
        </label>
        <label className="block text-xs text-zinc-500 sm:col-span-2">
          Blocker
          <textarea
            required
            rows={2}
            className="mt-1 w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-zinc-200"
            value={blocker}
            onChange={(e) => setBlocker(e.target.value)}
          />
        </label>
        <label className="block text-xs text-zinc-500 sm:col-span-2">
          Next step
          <textarea
            required
            rows={2}
            className="mt-1 w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-zinc-200"
            value={next_step}
            onChange={(e) => setNext(e.target.value)}
          />
        </label>
        <label className="block text-xs text-zinc-500 sm:col-span-2">
          Status note (optional)
          <textarea
            rows={2}
            className="mt-1 w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-zinc-200"
            value={status_note}
            onChange={(e) => setStatusNote(e.target.value)}
          />
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          {mode === "add" ? "Save update" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/20 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
