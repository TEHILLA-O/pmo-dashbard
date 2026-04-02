"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/executive", label: "Executive Overview" },
  { href: "/portfolio", label: "Portfolio View" },
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
    <div className="flex min-h-screen">
      <aside className="glass-sidebar w-64 shrink-0 border-r border-white/10 p-6">
        <p className="font-[family-name:var(--font-instrument)] text-lg font-normal tracking-tight text-white">
          PMO Portfolio
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500">Governance</p>
        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map(({ href, label }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-2 text-sm transition ${
                  active
                    ? "bg-teal-500/15 text-teal-200 ring-1 ring-teal-400/30"
                    : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="min-w-0 flex-1 p-6 md:p-10">{children}</main>
    </div>
  );
}
