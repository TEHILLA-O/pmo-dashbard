"use client";

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

const COLORS: Record<string, string> = {
  "On Track": "#34d399",
  "At Risk": "#fbbf24",
  Delayed: "#f87171",
};

/** Horizontal bars — status distribution (Cora “Entities by status” style). */
export function StatusHorizontalBars({
  onTrack,
  atRisk,
  delayed,
}: {
  onTrack: number;
  atRisk: number;
  delayed: number;
}) {
  const data = useMemo(
    () =>
      [
        { name: "On Track", value: onTrack },
        { name: "At Risk", value: atRisk },
        { name: "Delayed", value: delayed },
      ].filter((d) => d.value > 0),
    [onTrack, atRisk, delayed]
  );

  if (data.length === 0) {
    return <p className="py-12 text-center text-sm text-zinc-500">No data.</p>;
  }

  return (
    <div className="h-[220px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={chartGrid.stroke} horizontal={false} />
          <XAxis type="number" tick={{ fill: "#a1a1aa", fontSize: 10 }} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            width={88}
            tick={{ fill: "#a1a1aa", fontSize: 10 }}
          />
          <Tooltip {...chartTooltip} />
          <Bar dataKey="value" name="Projects" radius={[0, 4, 4, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] ?? "#64748b"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
