"use client";
// Session ouverte par Google/GitHub mais pas encore validée par le code email :
// on renvoie vers /auth/verify. C'est du confort : la vraie protection est côté
// serveur (lib/api/guard.ts) et en base (policy RLS, migration 0008).
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { supabaseConfigured } from "@/lib/session";
import { emailVerified } from "@/lib/emailCode";

export default function EmailCodeGuard() {
  const pathname = usePathname() || "/";
  const router = useRouter();

  useEffect(() => {
    if (!supabaseConfigured() || pathname.startsWith("/auth")) return;
    const supabase = createClient();
    let alive = true;
    const check = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (alive && session && !emailVerified(session.access_token)) {
        router.replace(`/auth/verify?next=${encodeURIComponent(pathname)}`);
      }
    };
    void check();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void check();
    });
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  return null;
}
