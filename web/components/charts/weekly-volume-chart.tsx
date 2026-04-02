"use client";

import type { WeeklyUpdateRow } from "@/lib/types";
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

export function WeeklyVolumeChart({ updates }: { updates: WeeklyUpdateRow[] }) {
  const data = useMemo(() => {
    const map = new Map<string, number>();
    for (const u of updates) {
      const w = String(u.reporting_week).slice(0, 10);
      if (!w) continue;
      map.set(w, (map.get(w) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, 16)
      .map(([week, count]) => ({ week, count }));
  }, [updates]);

  return (
    <div className="h-[260px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartGrid.stroke} />
          <XAxis dataKey="week" tick={{ fill: "#a1a1aa", fontSize: 9 }} angle={-40} textAnchor="end" height={55} interval={0} />
          <YAxis allowDecimals={false} tick={{ fill: "#a1a1aa", fontSize: 11 }} />
          <Tooltip {...chartTooltip} />
          <Bar dataKey="count" fill="#34d399" name="Updates" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
