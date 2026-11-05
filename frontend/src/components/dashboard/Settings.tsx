"use client";
// Paramètres du compte : profil, méthodes de connexion, données personnelles (RGPD)
import Link from "next/link";
import { useState } from "react";
import AccountSecurity from "@/components/account/AccountSecurity";
import { createClient } from "@/lib/supabase/browser";

export default function Settings({
  name,
  email,
  onLogout,
  onClose,
}: {
  name: string;
  email: string;
  onLogout: () => void;
  onClose: () => void;
}) {
  const [n, setN] = useState(name);
  const [status, setStatus] = useState<string | null>(null);
  const save = async () => {
    setStatus("Enregistrement…");
    const { error } = await createClient().auth.updateUser({ data: { full_name: n.trim() || name } });
    setStatus(error ? "L'enregistrement a échoué." : "Profil mis à jour.");
  };
  return (
    <div className="flex max-w-[640px] flex-col gap-5">
      <div className="flex flex-col gap-5 rounded-[24px] border border-line bg-white p-6">
        <div className="flex items-center justify-between">
          <h1 className="m-0 text-[24px]">Paramètres</h1>
          <button onClick={onClose} className="text-sm text-muted-2 hover:text-ink">
            Retour au voyage
          </button>
        </div>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Nom
          <input
            value={n}
            onChange={e => setN(e.target.value)}
            className="h-[46px] rounded-full border border-line-2 bg-cream px-4 text-[15px] font-normal"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-semibold">
          Adresse email
          <input
            value={email}
            disabled
            className="h-[46px] rounded-full border border-line bg-paper px-4 text-[15px] font-normal text-muted"
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={save}
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-paper hover:bg-ink-2"
          >
            Enregistrer
          </button>
          <Link href="/onboarding" className="text-sm">
            Mes préférences de voyage
          </Link>
          {status && <span className="text-sm text-muted">{status}</span>}
        </div>
        <button
          onClick={onLogout}
          className="self-start rounded-full border border-line-2 px-5 py-2.5 text-sm hover:border-danger hover:text-danger"
        >
          Se déconnecter
        </button>
      </div>
      <AccountSecurity />
    </div>
  );
}
