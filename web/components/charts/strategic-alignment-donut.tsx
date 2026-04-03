"use client";

import type { ProjectRow } from "@/lib/types";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useMemo } from "react";

const COLORS: Record<string, string> = {
  High: "#34d399",
  Medium: "#a78bfa",
  Emerging: "#64748b",
};

function bucket(score: number): string {
  if (score >= 70) return "High";
  if (score >= 40) return "Medium";
  return "Emerging";
}

/** Groups projects by strategic alignment score bands (proxy for strategic pillars). */
export function StrategicAlignmentDonut({ projects }: { projects: ProjectRow[] }) {
  const data = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of projects) {
      const raw = (p as Record<string, unknown>).strategic_alignment_score;
      const s = Number(raw ?? 50);
      const b = bucket(Number.isFinite(s) ? s : 50);
      m.set(b, (m.get(b) ?? 0) + 1);
    }
    return Array.from(m.entries()).map(([name, value]) => ({ name, value }));
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
