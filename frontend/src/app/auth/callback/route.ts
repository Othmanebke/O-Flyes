import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/safeNext";
import { emailVerified } from "@/lib/emailCode";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // "next" : page où revenir après la connexion
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Connexion Google/GitHub : 2e étape obligatoire, le code envoyé par email
      if (!emailVerified(data.session?.access_token)) {
        return NextResponse.redirect(`${origin}/auth/verify?next=${encodeURIComponent(next)}`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=1`);
}
