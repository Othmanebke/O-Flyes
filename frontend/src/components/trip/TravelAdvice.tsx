import { ExternalLink } from "lucide-react";
import { adviceFor, type AdviceKind } from "@/lib/travel/advice";

const DOT: Record<AdviceKind, string> = {
  Formalités: "bg-ink",
  Transports: "bg-gold",
  Sécurité: "bg-danger",
  Santé: "bg-ok",
  Usages: "bg-[#7A8BA6]",
};

/* « Bon à savoir avant de partir » pour le pays du voyage, avec le lien officiel. */
export default function TravelAdvice({ country, compact = false }: { country?: string | null; compact?: boolean }) {
  const { tips, generic, url, known } = adviceFor(country);
  const list = compact ? [...tips] : [...tips, ...generic];
  return (
    <div className="flex flex-col gap-3">
      <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
        {(list.length ? list : generic).map(t => (
          <li key={t.text} className="flex gap-2.5 text-sm leading-relaxed text-muted-2">
            <span className={`mt-[7px] h-2 w-2 shrink-0 rounded-full ${DOT[t.kind]}`} aria-hidden />
            <span>
              <span className="font-bold text-ink">{t.kind} · </span>
              {t.text}
            </span>
          </li>
        ))}
      </ul>
      <p className="m-0 text-xs text-muted">
        Repères pour un voyageur français, à vérifier avant le départ : les règles changent.{" "}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold"
        >
          {known ? "Conseils officiels pour ce pays" : "Conseils aux voyageurs"} (France Diplomatie){" "}
          <ExternalLink className="h-3 w-3" aria-hidden />
        </a>
      </p>
    </div>
  );
}
