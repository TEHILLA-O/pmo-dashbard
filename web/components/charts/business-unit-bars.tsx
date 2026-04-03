"use client";

import type { ProjectRow } from "@/lib/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo } from "react";
import { chartGrid, chartTooltip } from "./chart-styles";

/** Count of projects per business unit — vertical columns (Cora “by region” style). */
export function BusinessUnitBars({ projects }: { projects: ProjectRow[] }) {
  const data = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of projects) {
      const u = String(p.business_unit ?? "").trim() || "Unassigned";
      m.set(u, (m.get(u) ?? 0) + 1);
    }
    return Array.from(m.entries())
      .map(([name, count]) => ({ name: name.length > 12 ? `${name.slice(0, 10)}…` : name, count }))
      .sort((a, b) => b.count - a.count);
  }, [projects]);

  if (data.length === 0) {
    return <p className="py-12 text-center text-sm text-zinc-500">No data.</p>;
  }

  return (
    <div className="h-[220px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartGrid.stroke} />
          <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 9 }} interval={0} angle={-15} textAnchor="end" height={48} />
          <YAxis tick={{ fill: "#a1a1aa", fontSize: 10 }} allowDecimals={false} width={28} />
          <Tooltip {...chartTooltip} />
          <Bar dataKey="count" name="Projects" fill="#60a5fa" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
