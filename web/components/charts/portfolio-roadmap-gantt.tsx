"use client";

import type { ProjectRow } from "@/lib/types";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useMemo } from "react";
import { chartGrid, chartTooltip } from "./chart-styles";

const MS_DAY = 86400000;

const RAG_FILL: Record<string, string> = {
  Green: "#34d399",
  Amber: "#fbbf24",
  Red: "#f87171",
};

function parseProjectDate(s: unknown): Date | null {
  if (s == null || String(s).trim() === "") return null;
  const d = new Date(String(s));
  return Number.isNaN(d.getTime()) ? null : d;
}

function fmtShort(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function ragOf(p: ProjectRow): keyof typeof RAG_FILL {
  const r = String(p.rag_health ?? "").trim();
  if (r === "Green" || r === "Amber" || r === "Red") return r;
  const h = Number(p.health_score);
  if (Number.isFinite(h) && h >= 80) return "Green";
  if (Number.isFinite(h) && h >= 60) return "Amber";
  return "Red";
}

type RowPayload = {
  label: string;
  fullName: string;
  id: string;
  pad: number;
  span: number;
  startStr: string;
  endStr: string;
  rag: string;
};

function GanttTooltip({
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
      <p className="mt-2 text-zinc-400">
        RAG: <span className="text-zinc-200">{row.rag}</span>
      </p>
      <p className="mt-1 text-emerald-300/90">Start: {row.startStr}</p>
      <p className="text-emerald-300/90">End: {row.endStr}</p>
    </div>
  );
}

/** Gantt-style roadmap with RAG-colored bars and a “today” reference line. */
export function PortfolioRoadmapGantt({ projects, limit = 12 }: { projects: ProjectRow[]; limit?: number }) {
  const { data, domainMax, originMs, todayX } = useMemo(() => {
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
      return {
        data: [] as RowPayload[],
        domainMax: 1,
        originMs: Date.now(),
        todayX: null as number | null,
      };
    }
    const origin = Math.min(...slice.map((r) => r.start.getTime()));
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();
    const todayXVal = (todayMs - origin) / MS_DAY;

    const data: RowPayload[] = slice.map(({ p, start, end }) => {
      const padDays = (start.getTime() - origin) / MS_DAY;
      const spanDays = Math.max(0.5, (end.getTime() - start.getTime()) / MS_DAY);
      const name = String(p.project_name ?? p.project_id);
      const label = name.length > 24 ? `${name.slice(0, 22)}…` : name;
      const rag = ragOf(p);
      return {
        label,
        fullName: name,
        id: p.project_id,
        pad: Number(padDays.toFixed(2)),
        span: Number(spanDays.toFixed(2)),
        startStr: fmtShort(start),
        endStr: fmtShort(end),
        rag,
      };
    });
    const maxSpan = Math.max(...data.map((d) => d.pad + d.span));
    const domainMax = Math.ceil(maxSpan * 1.04);
    const showToday = todayXVal >= 0 && todayXVal <= domainMax;
    return {
      data,
      domainMax,
      originMs: origin,
      todayX: showToday ? todayXVal : null,
    };
  }, [projects, limit]);

  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-zinc-500">
        Add start and end dates under <strong className="text-zinc-400">Data / Admin</strong> to see the roadmap.
      </p>
    );
  }

  return (
    <div className="flex h-[min(480px,62vh)] min-h-[320px] w-full min-w-0 flex-col">
      <div className="mb-2 flex items-center justify-end gap-2 text-[10px] text-zinc-500">
        <span className="rounded border border-white/10 bg-white/[0.04] px-2 py-0.5">Color by: RAG</span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-emerald-400" /> Green
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-amber-400" /> Amber
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-red-400" /> Red
        </span>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 8, right: 16, left: 4, bottom: 28 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={chartGrid.stroke} horizontal={false} />
            <XAxis
              type="number"
              domain={[0, domainMax]}
              tick={{ fill: "#a1a1aa", fontSize: 10 }}
              tickFormatter={(v) => {
                const d = new Date(originMs + v * MS_DAY);
                return d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
              }}
              label={{
                value: "Timeline",
                position: "bottom",
                offset: 0,
                fill: "#71717a",
                fontSize: 10,
              }}
            />
            <YAxis
              type="category"
              dataKey="label"
              width={128}
              tick={{ fill: "#a1a1aa", fontSize: 9 }}
              reversed
            />
            {todayX != null ? (
              <ReferenceLine
                x={todayX}
                stroke="#f87171"
                strokeDasharray="5 5"
                strokeWidth={1.5}
                label={{
                  value: "Today",
                  position: "top",
                  fill: "#fca5a5",
                  fontSize: 10,
                }}
              />
            ) : null}
            <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} content={<GanttTooltip />} />
            <Bar dataKey="pad" stackId="tl" fill="rgba(0,0,0,0)" isAnimationActive={false} />
            <Bar dataKey="span" stackId="tl" radius={[0, 4, 4, 0]} isAnimationActive={false}>
              {data.map((entry, i) => (
                <Cell key={`c-${entry.id}-${i}`} fill={RAG_FILL[entry.rag] ?? "#64748b"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
