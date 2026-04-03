"use client";

import type { ProjectRow } from "@/lib/types";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo } from "react";
import { chartGrid, chartTooltip } from "./chart-styles";

function shortLabel(p: ProjectRow): string {
  const n = String(p.project_name ?? p.project_id);
  return n.length > 14 ? `${n.slice(0, 12)}…` : n;
}

/** Budget vs spend (millions) across projects — “Cost” overview. */
export function CostLineChart({ projects, limit = 8 }: { projects: ProjectRow[]; limit?: number }) {
  const data = useMemo(() => {
    return [...projects]
      .sort((a, b) => Number(b.budget) - Number(a.budget))
      .slice(0, limit)
      .map((p) => ({
        name: shortLabel(p),
        budget: Number(p.budget) / 1_000_000,
        spend: Number(p.actual_cost) / 1_000_000,
      }));
  }, [projects, limit]);

  return (
    <div className="h-[240px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartGrid.stroke} />
          <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 9 }} interval={0} angle={-25} textAnchor="end" height={52} />
          <YAxis tick={{ fill: "#a1a1aa", fontSize: 10 }} tickFormatter={(v) => `£${v}m`} width={44} />
          <Tooltip {...chartTooltip} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Line type="monotone" dataKey="budget" name="Budget" stroke="#818cf8" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="spend" name="Spend" stroke="#34d399" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
