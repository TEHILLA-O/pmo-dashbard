"use client";

import type { ProjectRow } from "@/lib/types";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useMemo } from "react";

const COLORS: Record<string, string> = {
  "Ahead / on plan": "#38bdf8",
  Behind: "#fbbf24",
  Complete: "#34d399",
};

/** Benefits-style view: delivery vs plan (actual vs planned progress). */
export function DeliveryProgressDonut({ projects }: { projects: ProjectRow[] }) {
  const data = useMemo(() => {
    let ahead = 0;
    let behind = 0;
    let done = 0;
    for (const p of projects) {
      const a = Number(p.actual_progress);
      const pl = Number(p.planned_progress);
      if (a >= 99.5) done += 1;
      else if (a + 1 >= pl) ahead += 1;
      else behind += 1;
    }
    return [
      { name: "Ahead / on plan", value: ahead },
      { name: "Behind", value: behind },
      { name: "Complete", value: done },
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
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
