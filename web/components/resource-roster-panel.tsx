"use client";

import { usePortfolio } from "@/contexts/portfolio-context";
import type { ResourceRow } from "@/lib/types";
import { useMemo, useState } from "react";

export function ResourceRosterPanel() {
  const { bundle, addResource, updateResource, deleteResources } = usePortfolio();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const projectIds = useMemo(
    () => bundle.projects.map((p) => p.project_id),
    [bundle.projects]
  );
  const firstProjectId = projectIds[0] ?? "";

  const sorted = useMemo(() => {
    return [...bundle.resources].sort((a, b) => {
      const pa = String(a.project_id ?? "");
      const pb = String(b.project_id ?? "");
      if (pa !== pb) return pa.localeCompare(pb);
      return String(a.resource_name ?? "").localeCompare(String(b.resource_name ?? ""));
    });
  }, [bundle.resources]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Resource roster
          </h2>
          <p className="mt-1 text-xs text-zinc-600">
            Add, edit, or delete named allocations. Saved in this browser (same as Admin).
          </p>
        </div>
        <button
          type="button"
          disabled={!firstProjectId}
          onClick={() => {
            setShowAdd((v) => !v);
            setEditingId(null);
          }}
          className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {showAdd ? "Close form" : "Add resource"}
        </button>
      </div>

      {!firstProjectId && (
        <p className="text-sm text-amber-400/90">
          Add a project under <strong className="text-zinc-300">Data / Admin</strong> before you can
          assign resources.
        </p>
      )}

      {showAdd && firstProjectId && (
        <ResourceRosterForm
          key="add"
          mode="add"
          projectOptions={projectIds}
          defaultProjectId={firstProjectId}
          onSubmit={(data) => {
            addResource(data);
            setShowAdd(false);
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-zinc-500">
              <th className="p-3">ID</th>
              <th className="p-3">Resource</th>
              <th className="p-3">Project</th>
              <th className="p-3">Role</th>
              <th className="p-3 text-right">Allocation %</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-sm text-zinc-500">
                  No resource rows yet. Use &quot;Add resource&quot; or load sample data.
                </td>
              </tr>
            )}
            {sorted.map((r) => {
              const id = String(r.resource_id ?? "");
              if (editingId === id) {
                return (
                  <tr key={id || `row-${r.project_id}-${r.resource_name}`} className="border-b border-white/5 bg-white/[0.04]">
                    <td colSpan={6} className="p-4">
                      <ResourceRosterForm
                        key={id}
                        mode="edit"
                        resourceId={id}
                        initial={r}
                        projectOptions={projectIds}
                        onSubmit={(data) => {
                          updateResource(id, {
                            resource_name: data.resource_name,
                            project_id: data.project_id,
                            role: data.role,
                            allocation_percent: data.allocation_percent,
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
                <tr
                  key={id || `row-${r.project_id}-${r.resource_name}`}
                  className="border-b border-white/5 hover:bg-white/[0.03]"
                >
                  <td className="p-3 font-mono text-[10px] text-zinc-600">{id || "—"}</td>
                  <td className="p-3 text-zinc-200">{String(r.resource_name ?? "")}</td>
                  <td className="p-3 font-mono text-xs text-zinc-500">{String(r.project_id ?? "")}</td>
                  <td className="p-3 text-zinc-400">{String(r.role ?? "")}</td>
                  <td className="p-3 text-right tabular-nums">
                    {Number(r.allocation_percent ?? 0).toFixed(1)}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAdd(false);
                          setEditingId(id);
                        }}
                        disabled={!id}
                        className="text-xs text-emerald-400 hover:underline disabled:opacity-40"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!id) return;
                          if (
                            confirm(
                              `Remove allocation for ${String(r.resource_name ?? "this resource")} (${id})?`
                            )
                          ) {
                            deleteResources([id]);
                          }
                        }}
                        disabled={!id}
                        className="text-xs text-red-400 hover:underline disabled:opacity-40"
                      >
                        Delete
                      </button>
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

function ResourceRosterForm({
  mode,
  resourceId,
  initial,
  defaultProjectId,
  projectOptions,
  onSubmit,
  onCancel,
}: {
  mode: "add" | "edit";
  resourceId?: string;
  initial?: ResourceRow;
  defaultProjectId?: string;
  projectOptions: string[];
  onSubmit: (data: {
    resource_name: string;
    project_id: string;
    role: string;
    allocation_percent: number;
  }) => void;
  onCancel: () => void;
}) {
  const selectIds = useMemo(() => {
    const o = [...projectOptions];
    const pid = String(initial?.project_id ?? "");
    if (pid && !o.includes(pid)) o.unshift(pid);
    return o;
  }, [projectOptions, initial?.project_id]);

  const [resource_name, setResourceName] = useState(String(initial?.resource_name ?? ""));
  const [project_id, setProjectId] = useState(
    String(initial?.project_id ?? defaultProjectId ?? selectIds[0] ?? "")
  );
  const [role, setRole] = useState(
    initial?.role === "—" ? "" : String(initial?.role ?? "")
  );
  const [allocation_percent, setAllocation] = useState(
    String(initial?.allocation_percent ?? "50")
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = resource_name.trim();
    if (!name || !project_id.trim()) return;
    const alloc = Number(allocation_percent);
    if (!Number.isFinite(alloc)) return;
    onSubmit({
      resource_name: name,
      project_id: project_id.trim(),
      role: role.trim() || "—",
      allocation_percent: alloc,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {mode === "edit" && resourceId ? (
        <p className="text-[10px] font-mono text-zinc-600">Editing {resourceId}</p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-xs text-zinc-500">
          Resource name
          <input
            value={resource_name}
            onChange={(e) => setResourceName(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500/50"
            placeholder="e.g. Casey Wilson"
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
          Role
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500/50"
            placeholder="e.g. Business Analyst"
          />
        </label>
        <label className="block text-xs text-zinc-500">
          Allocation %
          <input
            type="number"
            min={0}
            max={200}
            step={0.1}
            value={allocation_percent}
            onChange={(e) => setAllocation(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-emerald-500/50"
          />
        </label>
      </div>
      <p className="text-[10px] text-zinc-600">
        Available capacity is set to 100% − allocation when you save (capped at 0).
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          {mode === "add" ? "Add resource" : "Save changes"}
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
