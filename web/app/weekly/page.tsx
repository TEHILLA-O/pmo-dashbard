import type { DataBundle } from "@/lib/types";
import bundleJson from "@/data/bundle.json";

const bundle = bundleJson as DataBundle;

export default function WeeklyPage() {
  const rows = bundle.weekly_updates.slice(0, 40);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-instrument)] text-3xl text-white">Weekly Status Reports</h1>
        <p className="mt-1 text-sm text-zinc-500">Recent weekly narrative updates (sample)</p>
      </div>

      <div className="space-y-4">
        {rows.map((u) => (
          <article key={String(u.update_id)} className="glass-card rounded-xl p-5 text-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-mono text-xs text-teal-400">{String(u.project_id)}</span>
              <span className="text-xs text-zinc-500">{String(u.reporting_week).slice(0, 10)}</span>
            </div>
            <p className="mt-3 text-zinc-300">
              <strong className="text-zinc-500">Achievement:</strong> {String(u.key_achievement)}
            </p>
            <p className="mt-2 text-zinc-500">
              <strong>Blocker:</strong> {String(u.blocker)}
            </p>
            <p className="mt-2 text-zinc-500">
              <strong>Next:</strong> {String(u.next_step)}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
