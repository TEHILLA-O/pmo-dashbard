"use client";

import { usePortfolio } from "@/contexts/portfolio-context";
import type { ProjectRow } from "@/lib/types";
import { useMemo, useState } from "react";

const STATUS = ["On Track", "At Risk", "Delayed"] as const;
const PRIORITY = ["High", "Medium", "Low"] as const;

const emptyForm = () => ({
  project_name: "",
  project_manager: "",
  sponsor: "",
  business_unit: "Technology",
  start_date: new Date().toISOString().slice(0, 10),
  end_date: new Date(Date.now() + 180 * 86400000).toISOString().slice(0, 10),
  planned_progress: 40,
  actual_progress: 35,
  status: "On Track",
  budget: 500000,
  actual_cost: 450000,
  priority: "Medium",
  strategic_alignment_score: 70,
  roi_score: 70,
  urgency_score: 50,
  risk_probability: 3,
  risk_impact: 2,
  open_risks_count: 0,
  overdue_milestones: 0,
  resource_utilization_percent: 85,
  comments: "",
});

export function AdminPanel() {
  const { bundle, resetToSample, addProject, updateProject, deleteProjects } = usePortfolio();
  const [addForm, setAddForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ProjectRow>>({});

  const editing = useMemo(
    () => bundle.projects.find((p) => p.project_id === editingId),
    [bundle.projects, editingId]
  );

  function startEdit(p: ProjectRow) {
    setEditingId(p.project_id);
    setEditForm({ ...p });
  }

  function saveEdit() {
    if (!editingId) return;
    updateProject(editingId, editForm);
    setEditingId(null);
    setEditForm({});
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <div>
        <h1 className="font-[family-name:var(--font-instrument)] text-3xl text-white">Data / Admin</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Add, edit, or delete projects. Changes save in <strong className="text-zinc-400">this browser only</strong>{" "}
          (localStorage). Deployed builds have no server database.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            if (confirm("Reset all data to the built-in sample portfolio?")) resetToSample();
          }}
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-200 hover:bg-amber-500/20"
        >
          Reset to sample data
        </button>
      </div>

      <section className="glass-card space-y-4 rounded-2xl p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-400/90">Add project</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs text-zinc-500">
            Name *
            <input
              className="mt-1 w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200"
              value={addForm.project_name}
              onChange={(e) => setAddForm((f) => ({ ...f, project_name: e.target.value }))}
            />
          </label>
          <label className="block text-xs text-zinc-500">
            Project manager
            <input
              className="mt-1 w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200"
              value={addForm.project_manager}
              onChange={(e) => setAddForm((f) => ({ ...f, project_manager: e.target.value }))}
            />
          </label>
          <label className="block text-xs text-zinc-500">
            Sponsor
            <input
              className="mt-1 w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200"
              value={addForm.sponsor}
              onChange={(e) => setAddForm((f) => ({ ...f, sponsor: e.target.value }))}
            />
          </label>
          <label className="block text-xs text-zinc-500">
            Business unit
            <input
              className="mt-1 w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200"
              value={addForm.business_unit}
              onChange={(e) => setAddForm((f) => ({ ...f, business_unit: e.target.value }))}
            />
          </label>
          <label className="block text-xs text-zinc-500">
            Start date
            <input
              type="date"
              className="mt-1 w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200"
              value={addForm.start_date}
              onChange={(e) => setAddForm((f) => ({ ...f, start_date: e.target.value }))}
            />
          </label>
          <label className="block text-xs text-zinc-500">
            End date
            <input
              type="date"
              className="mt-1 w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200"
              value={addForm.end_date}
              onChange={(e) => setAddForm((f) => ({ ...f, end_date: e.target.value }))}
            />
          </label>
          <Num label="Planned % complete" v={addForm.planned_progress} on={(n) => setAddForm((f) => ({ ...f, planned_progress: n }))} />
          <Num label="Actual % complete" v={addForm.actual_progress} on={(n) => setAddForm((f) => ({ ...f, actual_progress: n }))} />
          <label className="block text-xs text-zinc-500">
            Status
            <select
              className="mt-1 w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200"
              value={addForm.status}
              onChange={(e) => setAddForm((f) => ({ ...f, status: e.target.value }))}
            >
              {STATUS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-zinc-500">
            Priority
            <select
              className="mt-1 w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200"
              value={addForm.priority}
              onChange={(e) => setAddForm((f) => ({ ...f, priority: e.target.value }))}
            >
              {PRIORITY.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <Num label="Budget" v={addForm.budget} on={(n) => setAddForm((f) => ({ ...f, budget: n }))} />
          <Num label="Actual cost" v={addForm.actual_cost} on={(n) => setAddForm((f) => ({ ...f, actual_cost: n }))} />
          <Num
            label="Strategic alignment"
            v={addForm.strategic_alignment_score}
            on={(n) => setAddForm((f) => ({ ...f, strategic_alignment_score: n }))}
          />
          <Num label="ROI score" v={addForm.roi_score} on={(n) => setAddForm((f) => ({ ...f, roi_score: n }))} />
          <Num label="Urgency" v={addForm.urgency_score} on={(n) => setAddForm((f) => ({ ...f, urgency_score: n }))} />
          <Num label="Risk probability" v={addForm.risk_probability} on={(n) => setAddForm((f) => ({ ...f, risk_probability: n }))} />
          <Num label="Risk impact" v={addForm.risk_impact} on={(n) => setAddForm((f) => ({ ...f, risk_impact: n }))} />
          <Num label="Open risks" v={addForm.open_risks_count} on={(n) => setAddForm((f) => ({ ...f, open_risks_count: n }))} />
          <Num label="Overdue milestones" v={addForm.overdue_milestones} on={(n) => setAddForm((f) => ({ ...f, overdue_milestones: n }))} />
          <Num
            label="Resource utilisation %"
            v={addForm.resource_utilization_percent}
            on={(n) => setAddForm((f) => ({ ...f, resource_utilization_percent: n }))}
          />
          <label className="block text-xs text-zinc-500 sm:col-span-2">
            Comments
            <input
              className="mt-1 w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200"
              value={addForm.comments}
              onChange={(e) => setAddForm((f) => ({ ...f, comments: e.target.value }))}
            />
          </label>
        </div>
        <button
          type="button"
          disabled={!addForm.project_name.trim()}
          onClick={() => {
            addProject({
              ...addForm,
              start_date: addForm.start_date + "T00:00:00.000",
              end_date: addForm.end_date + "T00:00:00.000",
            });
            setAddForm(emptyForm());
          }}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-500 disabled:opacity-40"
        >
          Add project
        </button>
      </section>

      {editing && (
        <section className="glass-card space-y-4 rounded-2xl border border-teal-500/30 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-teal-400/90">
            Edit {editing.project_id}
          </h2>
          <EditFields form={editForm} setForm={setEditForm} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={saveEdit}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm text-white hover:bg-teal-500"
            >
              Save changes
            </button>
            <button
              type="button"
              onClick={() => setEditingId(null)}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </section>
      )}

      <section className="glass-card rounded-2xl p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">All projects</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 text-xs uppercase text-zinc-500">
                <th className="p-2">ID</th>
                <th className="p-2">Name</th>
                <th className="p-2">Status</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bundle.projects.map((p) => (
                <tr key={p.project_id} className="border-b border-white/5">
                  <td className="p-2 font-mono text-xs text-teal-400">{p.project_id}</td>
                  <td className="p-2 text-zinc-300">{p.project_name}</td>
                  <td className="p-2 text-zinc-500">{p.status}</td>
                  <td className="p-2 text-right">
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      className="mr-2 text-teal-400 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete ${p.project_id}?`)) deleteProjects([p.project_id]);
                      }}
                      className="text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Num({
  label,
  v,
  on,
}: {
  label: string;
  v: number;
  on: (n: number) => void;
}) {
  return (
    <label className="block text-xs text-zinc-500">
      {label}
      <input
        type="number"
        className="mt-1 w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200"
        value={v}
        onChange={(e) => on(Number(e.target.value))}
      />
    </label>
  );
}

function EditFields({
  form,
  setForm,
}: {
  form: Partial<ProjectRow>;
  setForm: React.Dispatch<React.SetStateAction<Partial<ProjectRow>>>;
}) {
  const set = (key: keyof ProjectRow, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-xs text-zinc-500">
        Name
        <input
          className="mt-1 w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200"
          value={String(form.project_name ?? "")}
          onChange={(e) => set("project_name", e.target.value)}
        />
      </label>
      <label className="text-xs text-zinc-500">
        Manager
        <input
          className="mt-1 w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200"
          value={String(form.project_manager ?? "")}
          onChange={(e) => set("project_manager", e.target.value)}
        />
      </label>
      <label className="text-xs text-zinc-500">
        Status
        <select
          className="mt-1 w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200"
          value={String(form.status ?? "On Track")}
          onChange={(e) => set("status", e.target.value)}
        >
          {STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="text-xs text-zinc-500">
        Budget
        <input
          type="number"
          className="mt-1 w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200"
          value={Number(form.budget ?? 0)}
          onChange={(e) => set("budget", Number(e.target.value))}
        />
      </label>
      <label className="text-xs text-zinc-500">
        Actual cost
        <input
          type="number"
          className="mt-1 w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200"
          value={Number(form.actual_cost ?? 0)}
          onChange={(e) => set("actual_cost", Number(e.target.value))}
        />
      </label>
      <label className="text-xs text-zinc-500">
        Planned %
        <input
          type="number"
          className="mt-1 w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200"
          value={Number(form.planned_progress ?? 0)}
          onChange={(e) => set("planned_progress", Number(e.target.value))}
        />
      </label>
      <label className="text-xs text-zinc-500">
        Actual %
        <input
          type="number"
          className="mt-1 w-full rounded border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-200"
          value={Number(form.actual_progress ?? 0)}
          onChange={(e) => set("actual_progress", Number(e.target.value))}
        />
      </label>
      <label className="text-xs text-zinc-500">
        Health (read-only)
        <input
          readOnly
          className="mt-1 w-full rounded border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-400"
          value={String(form.health_score ?? "")}
        />
      </label>
    </div>
  );
}
