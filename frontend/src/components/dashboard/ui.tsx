// Briques visuelles du carnet (cartes et indicateurs)
import type { ReactNode } from "react";

/* ── briques visuelles ─────────────────────────────────────────────── */
export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex min-w-0 flex-col gap-4 rounded-[24px] border border-line bg-white p-5 ${className}`}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="m-0 text-[17px] font-extrabold tracking-[-0.02em]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Kpi({
  icon,
  label,
  value,
  sub,
  children,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-[24px] border border-line bg-white p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-semibold text-muted">{label}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paper text-ink">{icon}</span>
      </div>
      <span className="tabular whitespace-nowrap text-[28px] font-extrabold leading-none tracking-[-0.03em]">
        {value}
      </span>
      {sub && <span className="text-[13px] text-muted">{sub}</span>}
      {children}
    </div>
  );
}

export const iconBtn =
  "flex h-10 w-10 items-center justify-center rounded-full border border-line-2 bg-white text-ink hover:border-ink";
