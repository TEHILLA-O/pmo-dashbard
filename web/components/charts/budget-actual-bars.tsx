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

/** Top projects by budget: budget vs actual spend (millions GBP). */
export function BudgetActualBars({ projects, limit = 12 }: { projects: ProjectRow[]; limit?: number }) {
  const data = [...projects]
    .sort((a, b) => Number(b.budget) - Number(a.budget))
    .slice(0, limit)
    .map((p) => ({
      id: p.project_id,
      budget: Number(p.budget) / 1_000_000,
      spend: Number(p.actual_cost) / 1_000_000,
    }));

  return (
    <div className="h-[300px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 32 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartGrid.stroke} />
          <XAxis dataKey="id" tick={{ fill: "#a1a1aa", fontSize: 10 }} angle={-35} textAnchor="end" height={60} interval={0} />
          <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} tickFormatter={(v) => `${v}m`} />
          <Tooltip {...chartTooltip} />
          <Legend wrapperStyle={{ fontSize: 12, color: "#a1a1aa" }} />
          <Bar dataKey="budget" fill="#6366f1" name="Budget (m)" radius={[2, 2, 0, 0]} />
          <Bar dataKey="spend" fill="#5eead4" name="Spend (m)" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
