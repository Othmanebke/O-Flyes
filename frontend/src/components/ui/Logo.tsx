import { useId } from "react";
import { clsx } from "clsx";

/* Logo « Aivana » : écriture Kaushan Script et trait doré légèrement penché sous le mot. */
export default function Logo({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <span
      className={clsx("relative inline-block font-logo leading-none", className)}
      style={{ fontSize: size, padding: "0 4px 6px 0" }}
    >
      Aivana
      <span
        aria-hidden
        className="absolute bottom-0 h-[2px] rounded-sm bg-gold"
        style={{ left: "8%", right: "18%", transform: "rotate(-2deg)" }}
      />
    </span>
  );
}

/* Pastille du copilote, dessinée en un seul SVG (net à toutes les tailles) :
   fond bleu nuit en dégradé, liseré doré très fin, « A » doré en forme de sommet
   avec son arc d'horizon, et point vert « en ligne » détouré.
   shape="circle" pour le bouton flottant, "square" (coins arrondis) ailleurs. */
export function CopilotMark({
  size = 40,
  shape = "square",
  ring = "#FFFDF9",
}: {
  size?: number;
  shape?: "square" | "circle";
  ring?: string;
}) {
  const id = useId().replace(/:/g, "");
  const r = shape === "circle" ? 24 : 14;
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" className="block shrink-0" aria-hidden>
      <defs>
        <linearGradient id={`bg${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1C2C44" />
          <stop offset="1" stopColor="#0F1B2D" />
        </linearGradient>
        <linearGradient id={`au${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E2C27A" />
          <stop offset="1" stopColor="#C9A24B" />
        </linearGradient>
      </defs>
      <rect
        x="0.5"
        y="0.5"
        width="47"
        height="47"
        rx={r - 0.5}
        fill={`url(#bg${id})`}
        stroke="#C9A24B"
        strokeOpacity="0.35"
      />
      <g fill="none" stroke={`url(#au${id})`} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 34 24 13l10 21" />
        <path d="M17.5 27.5c4.4-2.2 8.6-2.2 13 0" />
      </g>
      <circle
        cx={shape === "circle" ? 38.5 : 40}
        cy={shape === "circle" ? 38.5 : 40}
        r="5"
        fill="#3F8F5A"
        stroke={ring}
        strokeWidth="2.5"
      />
    </svg>
  );
}
