"use client";

import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import type { ProjectRow } from "@/lib/types";

export function RiskScatter({ projects }: { projects: ProjectRow[] }) {
  const data = projects.map((p) => ({
    x: Number(p.risk_probability ?? 0),
    y: Number(p.risk_impact ?? 0),
    name: p.project_id,
  }));

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 16, right: 16, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis type="number" dataKey="x" name="Probability" domain={[0, 6]} tick={{ fill: "#a1a1aa", fontSize: 11 }} />
          <YAxis type="number" dataKey="y" name="Impact" domain={[0, 6]} tick={{ fill: "#a1a1aa", fontSize: 11 }} />
          <ZAxis range={[40, 40]} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "#18181b", border: "1px solid #27272a" }} />
          <Scatter data={data} fill="#fbbf24" fillOpacity={0.85} />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}
