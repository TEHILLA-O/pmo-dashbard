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
import { chartGrid, chartTooltip } from "./chart-styles";

export function OpenRisksDistribution({ projects }: { projects: ProjectRow[] }) {
  const bins = [
    { range: "0", count: 0 },
    { range: "1–2", count: 0 },
    { range: "3–5", count: 0 },
    { range: "6+", count: 0 },
  ];
  for (const p of projects) {
    const n = Number(p.open_risks_count ?? 0);
    if (n === 0) bins[0].count += 1;
    else if (n <= 2) bins[1].count += 1;
    else if (n <= 5) bins[2].count += 1;
    else bins[3].count += 1;
  }

  return (
    <div className="h-[240px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={bins} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartGrid.stroke} />
          <XAxis dataKey="range" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fill: "#a1a1aa", fontSize: 11 }} />
          <Tooltip {...chartTooltip} />
          <Bar dataKey="count" fill="#f59e0b" name="Projects" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
