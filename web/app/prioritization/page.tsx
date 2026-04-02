import type { DataBundle } from "@/lib/types";
import bundleJson from "@/data/bundle.json";

const bundle = bundleJson as DataBundle;

export default function PrioritizationPage() {
  const sorted = [...bundle.projects].sort(
    (a, b) => Number(b.strategic_alignment_score ?? 0) - Number(a.strategic_alignment_score ?? 0)
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-instrument)] text-3xl text-white">Prioritization</h1>
        <p className="mt-1 text-sm text-zinc-500">Strategic alignment and scoring (sample)</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wide text-zinc-500">
              <th className="p-3">Project</th>
              <th className="p-3">Priority</th>
              <th className="p-3 text-right">Strategic fit</th>
              <th className="p-3 text-right">ROI</th>
              <th className="p-3 text-right">Urgency</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr key={p.project_id} className="border-b border-white/5 hover:bg-white/[0.03]">
                <td className="p-3">
                  <span className="font-mono text-xs text-zinc-500">{p.project_id}</span>
                  <span className="ml-2 text-zinc-200">{p.project_name}</span>
                </td>
                <td className="p-3 text-zinc-400">{p.priority}</td>
                <td className="p-3 text-right">{Number(p.strategic_alignment_score).toFixed(0)}</td>
                <td className="p-3 text-right">{Number(p.roi_score).toFixed(0)}</td>
                <td className="p-3 text-right">{Number(p.urgency_score).toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
