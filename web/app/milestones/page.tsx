"use client";

import { MilestonesPanel } from "@/components/milestones-panel";

export default function MilestonesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-instrument)] text-3xl text-white">Milestones</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Overdue items show the milestone name clearly. Use tabs for upcoming and completed work —
          mark a row <strong className="text-zinc-400">Complete</strong> to move it to the Completed
          tab. Changes sync to portfolio health and executive KPIs (saved in this browser).
        </p>
      </div>

      <div className="glass-card rounded-2xl p-5">
        <MilestonesPanel />
      </div>
    </div>
  );
}
