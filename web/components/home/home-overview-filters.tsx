"use client";

import type { HomeFilterState } from "@/lib/home-filters";
import { uniqueSorted } from "@/lib/home-filters";
import type { ProjectRow } from "@/lib/types";

const ALL = "all";

export function HomeOverviewFilters({
  projects,
  value,
  onChange,
}: {
  projects: ProjectRow[];
  value: HomeFilterState;
  onChange: (next: HomeFilterState) => void;
}) {
  const statuses = uniqueSorted(projects.map((p) => p.status));
  const units = uniqueSorted(
    projects.map((p) => String(p.business_unit ?? "").trim() || "Unassigned")
  );
  const priorities = uniqueSorted(projects.map((p) => p.priority));

  const sel =
    "mt-1 w-full min-w-[140px] rounded-lg border border-white/12 bg-black/35 px-3 py-2 text-xs text-zinc-100 outline-none focus:border-violet-500/40 sm:w-auto";

  return (
    <div
      className="flex flex-wrap items-end gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
      role="search"
      aria-label="Portfolio filters"
    >
      <p className="w-full text-[10px] font-semibold uppercase tracking-wider text-zinc-500 sm:mb-6 sm:w-auto sm:self-end">
        Filters
      </p>
      <label className="block min-w-[140px] flex-1 text-[11px] text-zinc-500">
        Status
        <select
          className={sel}
          value={value.status}
          onChange={(e) => onChange({ ...value, status: e.target.value })}
        >
          <option value={ALL}>All statuses</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="block min-w-[140px] flex-1 text-[11px] text-zinc-500">
        Business unit
        <select
          className={sel}
          value={value.businessUnit}
          onChange={(e) => onChange({ ...value, businessUnit: e.target.value })}
        >
          <option value={ALL}>All units</option>
          {units.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <label className="block min-w-[140px] flex-1 text-[11px] text-zinc-500">
        Priority
        <select
          className={sel}
          value={value.priority}
          onChange={(e) => onChange({ ...value, priority: e.target.value })}
        >
          <option value={ALL}>All priorities</option>
          {priorities.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
