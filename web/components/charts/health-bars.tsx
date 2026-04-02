"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProjectRow } from "@/lib/types";

export function HealthBars({ projects }: { projects: ProjectRow[] }) {
  const bins = [
    { range: "0–59", count: 0 },
    { range: "60–69", count: 0 },
    { range: "70–79", count: 0 },
    { range: "80–89", count: 0 },
    { range: "90–100", count: 0 },
  ];
  for (const p of projects) {
    const h = p.health_score ?? 0;
    if (h < 60) bins[0].count += 1;
    else if (h < 70) bins[1].count += 1;
    else if (h < 80) bins[2].count += 1;
    else if (h < 90) bins[3].count += 1;
    else bins[4].count += 1;
  }

  return (
    <div className="h-[260px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={bins}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="range" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fill: "#a1a1aa", fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: "#18181b", border: "1px solid #27272a" }}
            labelStyle={{ color: "#e4e4e7" }}
          />
          <Bar dataKey="count" fill="#34d399" radius={[4, 4, 0, 0]} name="Projects" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
