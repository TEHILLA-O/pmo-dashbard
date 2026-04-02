"use client";

import type { ProjectRow } from "@/lib/types";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo } from "react";
import { chartGrid, chartTooltip } from "./chart-styles";

/** Projects ordered by health (low → high): index vs health score. */
export function HealthRankLine({ projects }: { projects: ProjectRow[] }) {
  const data = useMemo(() => {
    return [...projects]
      .sort((a, b) => Number(a.health_score) - Number(b.health_score))
      .map((p, i) => ({
        i: i + 1,
        health: Number(p.health_score),
        id: p.project_id,
      }));
  }, [projects]);

  return (
    <div className="h-[260px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartGrid.stroke} />
          <XAxis dataKey="i" tick={{ fill: "#a1a1aa", fontSize: 10 }} label={{ value: "Rank (lowest health first)", fill: "#52525b", fontSize: 10, position: "bottom" }} />
          <YAxis domain={[0, 100]} tick={{ fill: "#a1a1aa", fontSize: 11 }} label={{ value: "Health", fill: "#52525b", fontSize: 10, angle: -90, position: "insideLeft" }} />
          <Tooltip
            {...chartTooltip}
            labelFormatter={(label, payload) => {
              const id = (payload?.[0]?.payload as { id?: string })?.id;
              return id ? `${id} (rank ${label})` : String(label);
            }}
          />
          <Line type="monotone" dataKey="health" stroke="#5eead4" strokeWidth={2} dot={{ r: 3, fill: "#5eead4" }} name="Health" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
