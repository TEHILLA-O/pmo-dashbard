"use client";

import type { ProjectRow } from "@/lib/types";
import {
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { chartGrid, chartTooltip } from "./chart-styles";

const PRIORITY_COLOR: Record<string, string> = {
  High: "#f87171",
  Medium: "#fbbf24",
  Low: "#34d399",
};

export function StrategicRoiScatter({ projects }: { projects: ProjectRow[] }) {
  const data = projects.map((p) => ({
    x: Number(p.strategic_alignment_score ?? 0),
    y: Number(p.roi_score ?? 0),
    z: Number(p.urgency_score ?? 0),
    name: p.project_id,
    priority: String(p.priority ?? "Medium"),
  }));

  return (
    <div className="h-[300px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 16, right: 16, bottom: 24, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartGrid.stroke} />
          <XAxis
            type="number"
            dataKey="x"
            domain={[0, 100]}
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            label={{ value: "Strategic alignment", fill: "#71717a", fontSize: 11, position: "bottom", offset: 0 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[0, 100]}
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            label={{ value: "ROI score", fill: "#71717a", fontSize: 11, angle: -90, position: "insideLeft" }}
          />
          <ZAxis type="number" dataKey="z" range={[40, 400]} />
          <Tooltip
            {...chartTooltip}
            labelFormatter={(_, payload) => {
              const p = payload?.[0]?.payload as { name?: string; priority?: string } | undefined;
              return p ? `${p.name} (${p.priority})` : "";
            }}
          />
          <Scatter name="Projects" data={data}>
            {data.map((entry, i) => (
              <Cell key={i} fill={PRIORITY_COLOR[entry.priority] ?? "#94a3b8"} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
