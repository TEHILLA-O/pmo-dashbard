"use client";

import type { ResourceRow } from "@/lib/types";
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

export function ResourceRollupBars({ resources, limit = 14 }: { resources: ResourceRow[]; limit?: number }) {
  const data = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of resources) {
      const name = String(r.resource_name ?? "").trim();
      if (!name) continue;
      const a = Number(r.allocation_percent ?? 0);
      map.set(name, (map.get(name) ?? 0) + a);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, total]) => ({ name: name.length > 22 ? `${name.slice(0, 20)}…` : name, total }));
  }, [resources, limit]);

  return (
    <div className="h-[min(400px,55vh)] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartGrid.stroke} horizontal={false} />
          <XAxis type="number" tick={{ fill: "#a1a1aa", fontSize: 11 }} unit="%" />
          <YAxis type="category" dataKey="name" width={120} tick={{ fill: "#a1a1aa", fontSize: 10 }} />
          <Tooltip {...chartTooltip} />
          <Bar dataKey="total" fill="#a78bfa" name="Allocation %" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
