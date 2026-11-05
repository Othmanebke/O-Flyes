import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { emailVerified } from "@/lib/emailCode";

// Garde commune des routes API privées.
// 1. getUser() valide le jeton auprès de Supabase (on ne fait pas confiance au cookie seul).
// 2. Double authentification : la session doit avoir été validée par un code reçu par
//    email (lib/emailCode.ts). Une connexion Google/GitHub seule est refusée.
//    La même règle est imposée en base par une policy RLS (migration 0008).
export type Guarded = { ok: true; supabase: SupabaseClient; user: User } | { ok: false; response: NextResponse };

export async function requireUser(): Promise<Guarded> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return { ok: false, response: NextResponse.json({ error: "Connexion requise" }, { status: 401 }) };
  }
  // Le jeton vient d'être validé par getUser() : on peut lire son contenu (amr)
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!emailVerified(session?.access_token)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Code de vérification email requis", code: "email_code_required" },
        { status: 403 },
      ),
    };
  }
  return { ok: true, supabase, user };
}

// Erreur interne : le détail part dans les logs serveur, jamais dans la réponse
// (un message brut de Postgres révèle les noms de tables et de colonnes).
export function serverError(
  context: string,
  err: unknown,
  message = "Une erreur est survenue. Réessayez dans un instant.",
) {
  console.error(`[${context}]`, err);
  return NextResponse.json({ error: message }, { status: 500 });
}

export function badRequest(message = "Requête invalide") {
  return NextResponse.json({ error: message }, { status: 400 });
}

// Adresse IP du visiteur (derrière le proxy de Vercel ou d'un hébergeur)
export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] || request.headers.get("x-real-ip") || "unknown").trim();
}

// Les identifiants d'URL sont des UUID : on refuse le reste avant d'interroger la base
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (v: string) => UUID.test(v);
