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
import { chartGrid, chartTooltip } from "./chart-styles";

/** Horizontal bars: planned vs actual % complete (subset of projects). */
export function ProgressBarsHorizontal({
  projects,
  limit = 14,
}: {
  projects: ProjectRow[];
  limit?: number;
}) {
  const data = [...projects]
    .sort((a, b) => Number(b.actual_progress) - Number(a.actual_progress))
    .slice(0, limit)
    .map((p) => ({
      name: p.project_id,
      planned: Number(p.planned_progress),
      actual: Number(p.actual_progress),
    }));

  return (
    <div className="h-[min(420px,60vh)] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartGrid.stroke} horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: "#a1a1aa", fontSize: 11 }} unit="%" />
          <YAxis type="category" dataKey="name" width={68} tick={{ fill: "#a1a1aa", fontSize: 10 }} />
          <Tooltip {...chartTooltip} />
          <Legend wrapperStyle={{ fontSize: 11, color: "#a1a1aa" }} />
          <Bar dataKey="planned" fill="#64748b" name="Planned %" radius={[0, 2, 2, 0]} />
          <Bar dataKey="actual" fill="#14b8a6" name="Actual %" radius={[0, 2, 2, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
