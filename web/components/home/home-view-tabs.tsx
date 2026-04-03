"use client";

export type HomeViewTab = "widgets" | "roadmap" | "list";

const TABS: { id: HomeViewTab; label: string }[] = [
  { id: "list", label: "List" },
  { id: "roadmap", label: "Roadmap" },
  { id: "widgets", label: "Widgets" },
];

export function HomeViewTabs({
  active,
  onChange,
}: {
  active: HomeViewTab;
  onChange: (tab: HomeViewTab) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-white/10 bg-zinc-950/60 p-1">
      {TABS.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`rounded-lg px-5 py-2.5 text-sm font-medium transition ${
            active === t.id
              ? "bg-violet-600/90 text-white shadow-lg shadow-violet-950/40"
              : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
