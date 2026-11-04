"use client";
// Paramètres du compte : méthodes de connexion, double authentification (TOTP),
// et droits RGPD (export des données, suppression du compte).
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Download, KeyRound, Link2, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import type { Factor, UserIdentity } from "@supabase/supabase-js";
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
      <TwoFactor />
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
              <span className="flex items-center gap-2.5 font-semibold"><KeyRound className="h-[18px] w-[18px]" aria-hidden /> Lien magique par email</span>
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

/* ── Double authentification (TOTP) ───────────────────────────────── */
function TwoFactor() {
  const [factor, setFactor] = useState<Factor | null | undefined>(undefined);
  const [enroll, setEnroll] = useState<{ id: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    const { data } = await createClient().auth.mfa.listFactors();
    setFactor(data?.totp?.find(f => f.status === "verified") || null);
  }, []);
  useEffect(() => { void load(); }, [load]);

  const start = async () => {
    setBusy(true); setMsg(null);
    const supabase = createClient();
    // Un essai précédent non terminé bloquerait la nouvelle inscription : on le retire
    const { data: list } = await supabase.auth.mfa.listFactors();
    for (const f of list?.all || []) if (f.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: f.id });
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `AIVANA ${new Date().toLocaleDateString("fr-FR")}` });
    setBusy(false);
    if (error || !data) { setMsg({ ok: false, text: "Activation indisponible (la 2FA TOTP doit être activée dans Supabase)." }); return; }
    setEnroll({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };

  const confirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enroll || code.length !== 6) return;
    setBusy(true);
    const { error } = await createClient().auth.mfa.challengeAndVerify({ factorId: enroll.id, code });
    setBusy(false);
    if (error) { setMsg({ ok: false, text: "Code incorrect. Saisissez le code affiché en ce moment dans l'application." }); setCode(""); return; }
    setEnroll(null); setCode("");
    setMsg({ ok: true, text: "Double authentification activée. Le code vous sera demandé à chaque connexion." });
    void load();
  };

  const cancelEnroll = async () => {
    if (enroll) await createClient().auth.mfa.unenroll({ factorId: enroll.id });
    setEnroll(null); setCode(""); setMsg(null);
  };

  const disable = async () => {
    if (!factor || !confirm("Désactiver la double authentification ? Votre compte sera moins protégé.")) return;
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.mfa.unenroll({ factorId: factor.id });
    setBusy(false);
    if (error) { setMsg({ ok: false, text: "Désactivation refusée : reconnectez-vous avec votre code puis réessayez." }); return; }
    await supabase.auth.refreshSession();
    setMsg({ ok: true, text: "Double authentification désactivée." });
    void load();
  };

  return (
    <section className={card} aria-labelledby="sec-2fa">
      <h2 id="sec-2fa" className="m-0 flex items-center gap-2 text-[20px]"><ShieldCheck className="h-5 w-5" aria-hidden /> Double authentification</h2>
      <p className="m-0 text-sm text-muted-2">
        En plus de votre lien ou de votre compte Google/GitHub, un code à 6 chiffres généré par une application
        (Google Authenticator, Microsoft Authenticator, 1Password…) est demandé à chaque connexion.
      </p>

      {factor === undefined ? <p className="m-0 text-sm text-muted">Chargement…</p>
        : factor ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ok/40 bg-ok/[0.06] px-4 py-3 text-sm">
            <span><strong className="text-ok">Activée</strong> depuis le {new Date(factor.created_at).toLocaleDateString("fr-FR")}</span>
            <button onClick={disable} disabled={busy} className="inline-flex items-center gap-1.5 text-muted-2 hover:text-danger"><ShieldOff className="h-4 w-4" aria-hidden /> Désactiver</button>
          </div>
        ) : enroll ? (
          <form onSubmit={confirmCode} className="flex flex-col gap-3">
            <ol className="m-0 flex flex-col gap-1 pl-5 text-sm text-muted-2">
              <li>Scannez ce QR code avec votre application d&apos;authentification.</li>
              <li>Saisissez le code à 6 chiffres qu&apos;elle affiche.</li>
            </ol>
            {/* eslint-disable-next-line @next/next/no-img-element -- QR code SVG renvoyé par Supabase (data URI) */}
            <img src={enroll.qr} alt="QR code à scanner avec l'application d'authentification" width={180} height={180} className="rounded-2xl border border-line bg-white p-2" />
            <details className="text-sm text-muted-2">
              <summary className="cursor-pointer">Impossible de scanner ? Saisir la clé manuellement</summary>
              <code className="mt-2 block break-all rounded-xl bg-paper px-3 py-2 font-mono text-[13px] text-ink">{enroll.secret}</code>
            </details>
            <label htmlFor="totp-code" className="text-sm font-semibold">Code de vérification</label>
            <div className="flex flex-wrap gap-2">
              <input
                id="totp-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required
                value={code} onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456"
                className="h-[46px] w-[160px] rounded-full border border-line-2 bg-cream px-4 text-center font-mono text-lg tracking-[0.3em]"
              />
              <button type="submit" disabled={busy || code.length !== 6} className={`${btn} bg-ink text-paper hover:bg-ink-2`}>Activer</button>
              <button type="button" onClick={cancelEnroll} className={`${btn} border border-line-2 hover:border-ink`}>Annuler</button>
            </div>
          </form>
        ) : (
          <button onClick={start} disabled={busy} className={`${btn} bg-ink text-paper hover:bg-ink-2`}><ShieldCheck className="h-4 w-4" aria-hidden /> Activer la double authentification</button>
        )}
      {msg && <p className={`m-0 text-sm ${msg.ok ? "text-ok" : "text-danger"}`}>{msg.text}</p>}
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
