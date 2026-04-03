import type { ReactNode } from "react";

function IconGear() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function IconExpand() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
  );
}

function IconMore() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
    </svg>
  );
}

/** Cora-style widget: title row + toolbar icons, body area. */
export function DashboardWidgetFrame({
  title,
  subtitle,
  children,
  className = "",
  bodyClassName = "",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div
      className={`flex min-h-[260px] flex-col overflow-hidden rounded-xl border border-white/12 bg-zinc-950/40 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] ${className}`}
    >
      <div className="flex items-start justify-between gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold tracking-tight text-zinc-100">{title}</h3>
          {subtitle ? (
            <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-zinc-500">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-0.5 text-zinc-500">
          <button type="button" className="rounded-md p-1.5 hover:bg-white/10 hover:text-zinc-300" aria-label="Widget settings">
            <IconGear />
          </button>
          <button type="button" className="rounded-md p-1.5 hover:bg-white/10 hover:text-zinc-300" aria-label="Expand widget">
            <IconExpand />
          </button>
          <button type="button" className="rounded-md p-1.5 hover:bg-white/10 hover:text-zinc-300" aria-label="More options">
            <IconMore />
          </button>
        </div>
      </div>
      <div className={`min-h-0 flex-1 p-3 sm:p-4 ${bodyClassName}`}>{children}</div>
    </div>
  );
}
