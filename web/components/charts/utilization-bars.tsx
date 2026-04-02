"use client";

import type { ProjectRow } from "@/lib/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { chartGrid, chartTooltip } from "./chart-styles";

/** Project-level resource utilisation % (top by utilisation). */
export function UtilizationBars({ projects, limit = 14 }: { projects: ProjectRow[]; limit?: number }) {
  const data = [...projects]
    .sort((a, b) => Number(b.resource_utilization_percent) - Number(a.resource_utilization_percent))
    .slice(0, limit)
    .map((p) => ({
      id: p.project_id,
      util: Number(p.resource_utilization_percent),
    }));

  return (
    <div className="h-[min(380px,55vh)] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartGrid.stroke} horizontal={false} />
          <XAxis type="number" domain={[0, "auto"]} tick={{ fill: "#a1a1aa", fontSize: 11 }} unit="%" />
          <YAxis type="category" dataKey="id" width={68} tick={{ fill: "#a1a1aa", fontSize: 10 }} />
          <Tooltip {...chartTooltip} />
          <ReferenceLine x={100} stroke="#f87171" strokeDasharray="4 4" />
          <Bar dataKey="util" fill="#38bdf8" name="Util %" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
