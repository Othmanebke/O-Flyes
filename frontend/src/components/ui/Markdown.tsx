import Link from "next/link";
import { Fragment, type ReactNode } from "react";

/* Rendu Markdown minimal et sûr pour les réponses du copilote :
   **gras**, _italique_ / *italique*, [lien](url), listes « - » et retours à la ligne.
   Aucun HTML n'est interprété. */
function inline(text: string, keyBase: string): ReactNode[] {
    const out: ReactNode[] = [];
    const re = /(\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)|_([^_]+)_|\*([^*]+)\*)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    let i = 0;
    while ((m = re.exec(text))) {
        if (m.index > last) out.push(text.slice(last, m.index));
        const k = `${keyBase}-${i++}`;
        if (m[2]) out.push(<strong key={k} className="font-semibold">{m[2]}</strong>);
        else if (m[3]) {
            const href = m[4];
            out.push(href.startsWith("/")
                ? <Link key={k} href={href} className="underline underline-offset-2">{m[3]}</Link>
                : <a key={k} href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{m[3]}</a>);
        } else out.push(<em key={k}>{m[5] || m[6]}</em>);
        last = m.index + m[0].length;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
}

export default function Markdown({ text }: { text: string }) {
    const lines = text.replace(/^#+\s*/gm, "").split("\n");
    const blocks: ReactNode[] = [];
    let list: string[] = [];
    const flush = (k: number) => {
        if (!list.length) return;
        blocks.push(<ul key={`ul-${k}`} className="my-1 list-disc space-y-1 pl-5">{list.map((l, j) => <li key={j}>{inline(l, `li-${k}-${j}`)}</li>)}</ul>);
        list = [];
    };
    lines.forEach((line, k) => {
        const li = line.match(/^\s*[-•*]\s+(.*)/);
        if (li) { list.push(li[1]); return; }
        flush(k);
        if (!line.trim()) { blocks.push(<span key={`br-${k}`} className="block h-2" />); return; }
        blocks.push(<Fragment key={`p-${k}`}><span className="block">{inline(line, `p-${k}`)}</span></Fragment>);
    });
    flush(lines.length);
    return <>{blocks}</>;
}
