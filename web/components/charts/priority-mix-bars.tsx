"use client";

import type { ProjectRow } from "@/lib/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo } from "react";
import { chartGrid, chartTooltip } from "./chart-styles";

export function PriorityMixBars({ projects }: { projects: ProjectRow[] }) {
  const data = useMemo(() => {
    let h = 0,
      m = 0,
      l = 0;
    for (const p of projects) {
      const pr = String(p.priority ?? "Medium");
      if (pr === "High") h += 1;
      else if (pr === "Low") l += 1;
      else m += 1;
    }
    return [
      { name: "High", count: h, fill: "#f87171" },
      { name: "Medium", count: m, fill: "#fbbf24" },
      { name: "Low", count: l, fill: "#34d399" },
    ];
  }, [projects]);

  return (
    <div className="h-[220px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartGrid.stroke} />
          <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fill: "#a1a1aa", fontSize: 11 }} />
          <Tooltip {...chartTooltip} />
          <Bar dataKey="count" name="Projects" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
