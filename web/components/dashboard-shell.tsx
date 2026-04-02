"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Home" },
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

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="liquid-shell flex min-h-screen">
      <aside className="glass-sidebar w-64 shrink-0 border-r p-6">
        <p className="brand-mark font-[family-name:var(--font-instrument)] text-lg font-normal tracking-tight text-white">
          Project Portfolio Manager
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500">KPI</p>
        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map(({ href, label }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`nav-glass-link rounded-lg px-3 py-2 text-sm ${
                  active
                    ? "nav-glass-link--active bg-violet-500/20 text-violet-100 ring-1 ring-violet-400/35"
                    : "text-violet-200/55 hover:bg-white/[0.07] hover:text-violet-50"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="liquid-main min-w-0 flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
