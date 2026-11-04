"use client";
// Si le compte a la double authentification mais que la session n'a pas encore été
// validée par le code (aal1), on renvoie vers /auth/mfa. C'est du confort : la vraie
// protection est côté serveur (requireUser) et en base (policies RLS aal2).
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { supabaseConfigured } from "@/lib/session";

export default function MfaGuard() {
  const pathname = usePathname() || "/";
  const router = useRouter();

  useEffect(() => {
    if (!supabaseConfigured() || pathname.startsWith("/auth")) return;
    const supabase = createClient();
    let alive = true;
    const check = async () => {
      const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (alive && data && data.nextLevel === "aal2" && data.currentLevel !== "aal2") {
        router.replace(`/auth/mfa?next=${encodeURIComponent(pathname)}`);
      }
    };
    void check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { void check(); });
    return () => { alive = false; subscription.unsubscribe(); };
  }, [pathname, router]);

  return null;
}
