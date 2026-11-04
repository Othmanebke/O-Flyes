"use client";
import Link from "next/link";
import { useState } from "react";
import { Mail } from "lucide-react";
import PageBanner from "@/components/layout/PageBanner";
import { CONTACT_EMAIL } from "@/lib/site";

const SUBJECTS = ["Une question sur le site", "Un problème technique", "Mes données personnelles", "Autre"];

/* Pas de serveur d'envoi d'emails : le formulaire prépare le message dans la
   messagerie de la personne, qui l'envoie elle-même. */
export default function ContactPage() {
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState("");
  const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`[AIVANA] ${subject}`)}&body=${encodeURIComponent(message)}`;

  return (
    <div className="bg-paper">
      <PageBanner k="notebook" />
      <div className="mx-auto grid max-w-[1100px] gap-10 px-6 pb-24 pt-12 [grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr))]">
        <div className="flex flex-col gap-4">
          <h1 className="m-0 text-[clamp(36px,4.6vw,56px)] leading-[1.05]">Nous <em className="accent">écrire</em></h1>
          <p className="m-0 text-base leading-relaxed text-muted-2">
            AIVANA est un projet étudiant réalisé à YNOV CAMPUS. Une question, un bug, une idée : on vous répond par email.
          </p>
          <a href={`mailto:${CONTACT_EMAIL}`} className="plain-link flex items-center gap-3 self-start rounded-full border border-line-2 bg-white py-2 pl-2 pr-5 text-[15px] font-semibold hover:border-ink">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-soft"><Mail className="h-4 w-4" aria-hidden /></span>
            {CONTACT_EMAIL}
          </a>
          <p className="m-0 text-sm text-muted">Avant d&apos;écrire, la réponse est peut-être dans les <Link href="/aide">questions fréquentes</Link>.</p>
        </div>

        <form onSubmit={e => { e.preventDefault(); window.location.href = href; }} className="flex flex-col gap-4 rounded-[24px] border border-line bg-white p-6">
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Sujet
            <select value={subject} onChange={e => setSubject(e.target.value)} className="h-12 rounded-full border border-line-2 bg-cream px-4 text-[15px] font-normal">
              {SUBJECTS.map(s => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold">
            Message
            <textarea required rows={6} value={message} onChange={e => setMessage(e.target.value)} placeholder="Bonjour, …" className="rounded-[18px] border border-line-2 bg-cream px-4 py-3 text-[15px] font-normal outline-none focus:border-gold-deep" />
          </label>
          <button type="submit" className="h-12 rounded-full bg-ink text-sm font-bold text-paper hover:bg-ink-2">Ouvrir dans ma messagerie</button>
          <p className="m-0 text-xs text-muted">Le message s&apos;ouvre dans votre application d&apos;email, prêt à envoyer.</p>
        </form>
      </div>
    </div>
  );
}
