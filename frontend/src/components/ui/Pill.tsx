import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { clsx } from "clsx";
import type { ReactNode } from "react";

type Tone = "ink" | "white" | "soft";

const TONES: Record<Tone, { body: string; circle: string }> = {
  ink: { body: "bg-ink text-white hover:bg-ink-2 hover:text-white", circle: "bg-white text-ink" },
  white: { body: "bg-white text-ink hover:bg-[#FBF6EA] hover:text-ink", circle: "bg-gold-soft text-ink" },
  soft: { body: "bg-gold-soft text-ink hover:bg-[#E8D3A4] hover:text-ink", circle: "bg-white text-ink" },
};

interface Props {
  children: ReactNode;
  tone?: Tone;
  href?: string;
  onClick?: () => void;
  className?: string;
  circle?: number; // diamètre du rond fléché
  type?: "button" | "submit";
  disabled?: boolean;
}

/* Bouton pilule avec, à droite, un rond contenant une flèche ArrowUpRight. */
export default function ArrowPill({
  children,
  tone = "ink",
  href,
  onClick,
  className,
  circle = 34,
  type = "button",
  disabled,
}: Props) {
  const t = TONES[tone];
  const cls = clsx(
    "plain-link inline-flex items-center gap-2.5 whitespace-nowrap rounded-full py-[5px] pl-4 pr-[5px] text-[13px] font-semibold transition-colors disabled:opacity-50",
    t.body,
    className,
  );
  const inner = (
    <>
      {children}
      <span
        className={clsx("flex shrink-0 items-center justify-center rounded-full", t.circle)}
        style={{ width: circle, height: circle }}
      >
        <ArrowUpRight className="h-[1.1em] w-[1.1em]" aria-hidden />
      </span>
    </>
  );
  if (href)
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {inner}
    </button>
  );
}

/* Pastille de filtre (chip) */
export function Chip({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={clsx(
        "shrink-0 whitespace-nowrap rounded-full border px-3 py-[7px] text-[13px] transition-colors",
        active ? "border-ink bg-ink text-paper" : "border-line-2 bg-transparent text-muted-2 hover:border-muted",
        className,
      )}
    >
      {children}
    </button>
  );
}
