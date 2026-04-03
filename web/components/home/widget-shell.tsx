import type { ReactNode } from "react";

export function WidgetShell({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`glass-card flex min-h-[280px] flex-col rounded-xl p-4 sm:min-h-[300px] ${className}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">{title}</p>
      {subtitle ? (
        <p className="mt-0.5 text-[10px] leading-snug text-zinc-600">{subtitle}</p>
      ) : null}
      <div className="mt-2 min-h-[220px] flex-1 min-w-0">{children}</div>
    </div>
  );
}
