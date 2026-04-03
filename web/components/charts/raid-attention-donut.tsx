"use client";

import type { ProjectRow } from "@/lib/types";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useMemo } from "react";

const COLORS: Record<string, string> = {
  "Has open risks": "#38bdf8",
  "Has overdue milestones": "#fbbf24",
  "Clean delivery": "#34d399",
};

/** RAID-style attention: projects with risks, overdue MS, or neither. */
export function RaidAttentionDonut({ projects }: { projects: ProjectRow[] }) {
  const data = useMemo(() => {
    let risks = 0;
    let overdue = 0;
    let clean = 0;
    for (const p of projects) {
      const r = Number(p.open_risks_count ?? 0);
      const o = Number(p.overdue_milestones ?? 0);
      if (r > 0) risks += 1;
      else if (o > 0) overdue += 1;
      else clean += 1;
    }
    return [
      { name: "Has open risks", value: risks },
      { name: "Has overdue milestones", value: overdue },
      { name: "Clean delivery", value: clean },
    ].filter((d) => d.value > 0);
  }, [projects]);

  if (data.length === 0) {
    return <p className="py-12 text-center text-sm text-zinc-500">No project data.</p>;
  }

  return (
    <div className="h-[240px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={78}
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
          <Legend wrapperStyle={{ fontSize: 10 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
