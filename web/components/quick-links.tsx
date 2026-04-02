import Link from "next/link";

const LINKS = [
  { href: "/executive", label: "Executive Overview" },
  { href: "/portfolio", label: "Portfolio View" },
  { href: "/milestones", label: "Milestones" },
  { href: "/risk", label: "Risk & Health" },
  { href: "/resources", label: "Resources" },
  { href: "/prioritization", label: "Prioritization" },
  { href: "/weekly", label: "Weekly Reports" },
  { href: "/admin", label: "Data / Admin" },
  { href: "/predictive", label: "Predictive" },
];

export function QuickLinks() {
  return (
    <div className="glass-card rounded-2xl p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Jump to a section</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="quick-link-tile rounded-xl border border-white/12 bg-white/[0.06] px-4 py-3 text-center text-sm text-zinc-300 backdrop-blur-sm hover:border-violet-400/35 hover:bg-violet-500/[0.12] hover:text-violet-50"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
