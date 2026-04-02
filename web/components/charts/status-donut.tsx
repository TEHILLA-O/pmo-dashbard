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
  "On Track": "#2dd4bf",
  "At Risk": "#fbbf24",
  Delayed: "#f87171",
};

export function StatusDonut({
  onTrack,
  atRisk,
  delayed,
}: {
  onTrack: number;
  atRisk: number;
  delayed: number;
}) {
  const data = [
    { name: "On Track", value: onTrack },
    { name: "At Risk", value: atRisk },
    { name: "Delayed", value: delayed },
  ].filter((d) => d.value > 0);

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
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
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
