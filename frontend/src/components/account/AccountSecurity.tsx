"use client";
// Paramètres du compte : méthodes de connexion
// et droits RGPD (export des données, suppression du compte).
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Download, KeyRound, Link2, Trash2 } from "lucide-react";
import type { UserIdentity } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/browser";
import { GitHubMark, GoogleMark } from "@/components/ui/BrandIcons";

const card = "flex flex-col gap-4 rounded-[24px] border border-line bg-white p-6";
const btn = "inline-flex items-center gap-2 self-start rounded-full px-5 py-2.5 text-sm font-bold disabled:opacity-60";
const PROVIDERS: { id: "google" | "github"; label: string; icon: React.ReactNode }[] = [
  { id: "google", label: "Google", icon: <GoogleMark size={18} /> },
  { id: "github", label: "GitHub", icon: <GitHubMark size={18} /> },
];

export default function AccountSecurity() {
  return (
    <>
      <SignInMethods />
      <MyData />
    </>
  );
}

/* ── Méthodes de connexion ────────────────────────────────────────── */
function SignInMethods() {
  const [identities, setIdentities] = useState<UserIdentity[] | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await createClient().auth.getUserIdentities();
    setIdentities(data?.identities || []);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const link = async (provider: "google" | "github") => {
    setMsg(null);
    const { error } = await createClient().auth.linkIdentity({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent("/dashboard?settings=1")}` },
    });
    if (error) setMsg("Liaison impossible pour le moment (la liaison manuelle doit être activée dans Supabase).");
  };

  const unlink = async (identity: UserIdentity) => {
    if (!confirm(`Retirer la connexion ${identity.provider} ?`)) return;
    const { error } = await createClient().auth.unlinkIdentity(identity);
    setMsg(error ? "Impossible de retirer cette méthode." : "Méthode retirée.");
    void load();
  };

  const has = (p: string) => identities?.find(i => i.provider === p);
  const emailIdentity = has("email");

  return (
    <section className={card} aria-labelledby="sec-methods">
      <h2 id="sec-methods" className="m-0 flex items-center gap-2 text-[20px]"><Link2 className="h-5 w-5" aria-hidden /> Méthodes de connexion</h2>
      <p className="m-0 text-sm text-muted-2">Associez plusieurs comptes pour toujours pouvoir vous connecter, même si l&apos;un d&apos;eux devient inaccessible.</p>
      {identities === null ? <p className="m-0 text-sm text-muted">Chargement…</p> : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {emailIdentity && (
            <li className="flex items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3 text-sm">
              <span className="flex items-center gap-2.5 font-semibold"><KeyRound className="h-[18px] w-[18px]" aria-hidden /> Code par email</span>
              <span className="text-ok">Actif</span>
            </li>
          )}
          {PROVIDERS.map(p => {
            const id = has(p.id);
            return (
              <li key={p.id} className="flex items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3 text-sm">
                <span className="flex items-center gap-2.5 font-semibold">{p.icon} {p.label}</span>
                {id ? (
                  identities.length > 1
                    ? <button onClick={() => unlink(id)} className="text-muted-2 hover:text-danger">Retirer</button>
                    : <span className="text-ok">Actif</span>
                ) : (
                  <button onClick={() => link(p.id)} className="font-semibold hover:text-gold-deep">Associer</button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {msg && <p className="m-0 text-sm text-muted-2">{msg}</p>}
    </section>
  );
}

/* ── Mes données (RGPD) ───────────────────────────────────────────── */
function MyData() {
  const [confirmText, setConfirmText] = useState("");
  const [state, setState] = useState<"idle" | "deleting" | "error">("idle");
  const [error, setError] = useState("");

  const remove = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText !== "SUPPRIMER") return;
    setState("deleting");
    try {
      await axios.delete("/api/account", { data: { confirm: confirmText } });
      await createClient().auth.signOut().catch(() => undefined);
      // On efface aussi ce que le navigateur garde (voyage en cours, préférences)
      Object.keys(localStorage).filter(k => k.startsWith("aivana") || k.startsWith("roadtrip_")).forEach(k => localStorage.removeItem(k));
      window.location.replace("/?compte=supprime");
    } catch (err) {
      setError(axios.isAxiosError(err) && err.response?.data?.error ? err.response.data.error : "La suppression a échoué.");
      setState("error");
    }
  };

  return (
    <section className={card} aria-labelledby="sec-data">
      <h2 id="sec-data" className="m-0 flex items-center gap-2 text-[20px]"><Download className="h-5 w-5" aria-hidden /> Mes données</h2>
      <p className="m-0 text-sm text-muted-2">
        Conformément au RGPD, vous pouvez télécharger toutes les données que nous conservons sur vous
        (compte, voyages, itinéraires, abonnement) ou supprimer définitivement votre compte.
      </p>
      <a href="/api/account/export" download className={`plain-link ${btn} border border-line-2 !text-ink hover:border-ink`}>
        <Download className="h-4 w-4" aria-hidden /> Télécharger mes données (JSON)
      </a>

      <form onSubmit={remove} className="mt-2 flex flex-col gap-2.5 rounded-2xl border border-danger/30 bg-danger/[0.04] p-4">
        <strong className="text-sm text-danger">Supprimer mon compte</strong>
        <p className="m-0 text-sm text-muted-2">Vos voyages, éléments et itinéraires seront effacés immédiatement et définitivement. Les liens de partage cesseront de fonctionner.</p>
        <label htmlFor="delete-confirm" className="text-sm">Tapez <strong>SUPPRIMER</strong> pour confirmer</label>
        <div className="flex flex-wrap gap-2">
          <input id="delete-confirm" value={confirmText} onChange={e => setConfirmText(e.target.value)} autoComplete="off" className="h-[42px] w-[180px] rounded-full border border-line-2 bg-white px-4 text-sm" />
          <button type="submit" disabled={confirmText !== "SUPPRIMER" || state === "deleting"} className={`${btn} bg-danger text-white hover:opacity-90`}>
            <Trash2 className="h-4 w-4" aria-hidden /> {state === "deleting" ? "Suppression…" : "Supprimer définitivement"}
          </button>
        </div>
        {state === "error" && <p className="m-0 text-sm text-danger">{error}</p>}
      </form>
    </section>
  );
}
