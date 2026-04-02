"use client";

import type { ProjectRow } from "@/lib/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo } from "react";
import { chartGrid, chartTooltip } from "./chart-styles";

const MS_DAY = 86400000;

function parseProjectDate(s: unknown): Date | null {
  if (s == null || String(s).trim() === "") return null;
  const d = new Date(String(s));
  return Number.isNaN(d.getTime()) ? null : d;
}

function fmtShort(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

type RowPayload = {
  label: string;
  fullName: string;
  id: string;
  pad: number;
  span: number;
  startStr: string;
  endStr: string;
};

function TimelineTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: RowPayload }>;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div
      className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs shadow-xl"
      style={chartTooltip.contentStyle}
    >
      <p className="font-medium text-zinc-100">{row.fullName}</p>
      <p className="mt-0.5 font-mono text-[10px] text-zinc-500">{row.id}</p>
      <p className="mt-2 text-emerald-300/90">Start: {row.startStr}</p>
      <p className="text-emerald-300/90">End: {row.endStr}</p>
    </div>
  );
}

/** Horizontal timeline: each bar runs from project start to end (earliest projects at top). */
export function ProjectTimelineBars({ projects, limit = 14 }: { projects: ProjectRow[]; limit?: number }) {
  const { data, maxEndDays, originMs } = useMemo(() => {
    const parsed: { p: ProjectRow; start: Date; end: Date }[] = [];
    for (const p of projects) {
      const s = parseProjectDate(p.start_date);
      const e = parseProjectDate(p.end_date);
      if (!s || !e) continue;
      const end = e.getTime() < s.getTime() ? new Date(s.getTime()) : e;
      parsed.push({ p, start: s, end });
    }
    parsed.sort((a, b) => a.start.getTime() - b.start.getTime());
    const slice = parsed.slice(0, limit);
    if (slice.length === 0) {
      return { data: [] as RowPayload[], maxEndDays: 1, originMs: Date.now() };
    }
    const origin = Math.min(...slice.map((r) => r.start.getTime()));
    const data: RowPayload[] = slice.map(({ p, start, end }) => {
      const padDays = (start.getTime() - origin) / MS_DAY;
      const spanDays = Math.max(0.5, (end.getTime() - start.getTime()) / MS_DAY);
      const name = String(p.project_name ?? p.project_id);
      const label = name.length > 26 ? `${name.slice(0, 24)}…` : name;
      return {
        label,
        fullName: name,
        id: p.project_id,
        pad: Number(padDays.toFixed(2)),
        span: Number(spanDays.toFixed(2)),
        startStr: fmtShort(start),
        endStr: fmtShort(end),
      };
    });
    const maxEndDays = Math.max(...data.map((d) => d.pad + d.span));
    return { data, maxEndDays, originMs: origin };
  }, [projects, limit]);

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-500">
        No projects with valid start and end dates. Set dates under{" "}
        <strong className="text-zinc-400">Data / Admin</strong>.
      </p>
    );
  }

  const xMax = Math.ceil(maxEndDays * 1.04);

  return (
    <div className="h-[min(440px,60vh)] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 8, right: 20, left: 4, bottom: 28 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={chartGrid.stroke} horizontal={false} />
          <XAxis
            type="number"
            domain={[0, xMax]}
            tick={{ fill: "#a1a1aa", fontSize: 10 }}
            tickFormatter={(v) => {
              const d = new Date(originMs + v * MS_DAY);
              return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
            }}
            label={{
              value: "Timeline (start → end)",
              position: "bottom",
              offset: 0,
              fill: "#71717a",
              fontSize: 10,
            }}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={132}
            tick={{ fill: "#a1a1aa", fontSize: 10 }}
            reversed
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            content={<TimelineTooltip />}
          />
          <Bar dataKey="pad" stackId="tl" fill="rgba(0,0,0,0)" isAnimationActive={false} />
          <Bar
            dataKey="span"
            stackId="tl"
            fill="#34d399"
            name="Planned window"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
