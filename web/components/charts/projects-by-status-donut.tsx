"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const COLORS: Record<string, string> = {
  "On Track": "#34d399",
  "At Risk": "#fbbf24",
  Delayed: "#f87171",
};

/** Donut with centre count — “Entities by type” style. */
export function ProjectsByStatusDonut({
  onTrack,
  atRisk,
  delayed,
  totalProjects,
}: {
  onTrack: number;
  atRisk: number;
  delayed: number;
  totalProjects: number;
}) {
  const data = [
    { name: "On Track", value: onTrack },
    { name: "At Risk", value: atRisk },
    { name: "Delayed", value: delayed },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return <p className="py-12 text-center text-sm text-zinc-500">No data.</p>;
  }

  return (
    <div className="relative h-[220px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={82}
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] ?? "#888"} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#18181b", border: "1px solid #27272a" }}
            labelStyle={{ color: "#e4e4e7" }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-semibold tabular-nums text-zinc-50">{totalProjects}</p>
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">Projects</p>
        </div>
      </div>
    </div>
  );
}
