"use client";

import type { ProjectRow } from "@/lib/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo } from "react";
import { chartGrid, chartTooltip } from "./chart-styles";

function shortLabel(p: ProjectRow): string {
  const n = String(p.project_name ?? p.project_id);
  return n.length > 12 ? `${n.slice(0, 10)}…` : n;
}

/** Planned vs actual progress % — “Time / delivery” proxy. */
export function PlannedActualGroupedBars({ projects, limit = 8 }: { projects: ProjectRow[]; limit?: number }) {
  const data = useMemo(() => {
    return [...projects]
      .sort(
        (a, b) =>
          Math.abs(Number(b.planned_progress) - Number(b.actual_progress)) -
          Math.abs(Number(a.planned_progress) - Number(a.actual_progress))
      )
      .slice(0, limit)
      .map((p) => ({
        name: shortLabel(p),
        planned: Number(p.planned_progress),
        actual: Number(p.actual_progress),
      }));
  }, [projects, limit]);

  return (
    <div className="h-[240px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartGrid.stroke} />
          <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 9 }} interval={0} angle={-20} textAnchor="end" height={48} />
          <YAxis tick={{ fill: "#a1a1aa", fontSize: 10 }} domain={[0, 100]} width={36} unit="%" />
          <Tooltip {...chartTooltip} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="planned" name="Planned %" fill="#818cf8" radius={[2, 2, 0, 0]} />
          <Bar dataKey="actual" name="Actual %" fill="#34d399" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
