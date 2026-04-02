import Link from "next/link";

const LINKS = [
  { href: "/executive", label: "Executive Overview" },
  { href: "/portfolio", label: "Portfolio View" },
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
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-center text-sm text-zinc-300 transition hover:border-teal-500/40 hover:bg-teal-500/10 hover:text-teal-100"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
