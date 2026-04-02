"use client";

import { usePortfolio } from "@/contexts/portfolio-context";
import Link from "next/link";

export function HomeProjectList() {
  const { bundle } = usePortfolio();
  const projects = bundle.projects;

  return (
    <section className="glass-card rounded-2xl p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Projects in portfolio
          </h2>
          <p className="mt-1 text-xs text-zinc-600">
            {projects.length} active {projects.length === 1 ? "project" : "projects"}
          </p>
        </div>
        <Link
          href="/portfolio"
          className="text-xs font-medium text-emerald-400 transition-colors duration-200 hover:text-emerald-200 hover:underline underline-offset-4"
        >
          Open full portfolio view →
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="mt-4 text-sm text-zinc-500">
          No projects yet. Add one under <strong className="text-zinc-400">Data / Admin</strong>.
        </p>
      ) : (
        <ul className="mt-4 max-h-[min(24rem,50vh)] divide-y divide-white/10 overflow-y-auto pr-1">
          {projects.map((p) => (
            <li
              key={p.project_id}
              className="project-row flex flex-col gap-1 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
            >
              <div className="min-w-0">
                <span className="font-mono text-xs text-emerald-400">{p.project_id}</span>
                <p className="mt-0.5 truncate text-sm text-zinc-200" title={p.project_name}>
                  {p.project_name}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
                <span>{p.status}</span>
                <span className="text-zinc-600">·</span>
                <span>Health {Number(p.health_score).toFixed(1)}</span>
                <span className="text-zinc-600">·</span>
                <span>{Number(p.actual_progress).toFixed(0)}% complete</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
