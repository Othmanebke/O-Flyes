import { Plane } from "lucide-react";
import { clsx } from "clsx";

/* Logo « Aivana » : écriture Kaushan Script, petit avion doré incliné en haut à
   droite et trait doré légèrement penché sous le mot. */
export default function Logo({ size = 36, className }: { size?: number; className?: string }) {
    return (
        <span
            className={clsx("relative inline-block font-logo leading-none", className)}
            style={{ fontSize: size, padding: "0 14px 6px 0" }}
        >
            Aivana
            <Plane
                aria-hidden
                className="absolute text-gold"
                style={{ right: -6, top: -8, width: size * 0.42, height: size * 0.42, transform: "rotate(-30deg)" }}
            />
            <span aria-hidden className="absolute bottom-0 h-[2px] rounded-sm bg-gold" style={{ left: "8%", right: "18%", transform: "rotate(-2deg)" }} />
        </span>
    );
}

/* Pastille du copilote : carré arrondi bleu nuit, « A » doré en forme de sommet et
   arc d'horizon, avec un point vert « en ligne ». */
export function CopilotMark({ size = 40, tone = "solid", ring = "#FFFDF9" }: { size?: number; tone?: "solid" | "glass"; ring?: string }) {
    return (
        <span className="relative flex shrink-0" style={{ width: size, height: size }}>
            <span
                className="flex items-center justify-center"
                style={{ width: size, height: size, borderRadius: "30%", background: tone === "solid" ? "#0F1B2D" : "rgba(255,255,255,0.1)" }}
            >
                <svg width="62%" height="62%" viewBox="0 0 24 24" fill="none" stroke="#C9A24B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M4 20 12 4l8 16" />
                    <path d="M7.5 14c3-1.6 6-1.6 9 0" />
                </svg>
            </span>
            <span className="absolute h-[9px] w-[9px] rounded-full" style={{ right: 2, bottom: 2, background: "#3F8F5A", border: `2px solid ${ring}` }} />
        </span>
    );
}
