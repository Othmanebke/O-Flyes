"use client";
// Session Supabase partagée (navbar, chat, carnet). Sans clés Supabase configurées,
// on reste simplement « déconnecté » au lieu de planter.
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export interface SessionUser {
    id: string;
    email: string;
    name: string;
    onboarded?: boolean;
}

export const supabaseConfigured = () => !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function useSession() {
    const [user, setUser] = useState<SessionUser | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!supabaseConfigured()) { setReady(true); return; }
        const supabase = createClient();
        const toUser = (u: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null | undefined): SessionUser | null => u ? {
            id: u.id,
            email: u.email || "",
            name: (u.user_metadata?.full_name as string) || u.email?.split("@")[0] || "Voyageur",
            onboarded: !!u.user_metadata?.onboarded,
        } : null;
        supabase.auth.getSession().then(({ data }) => { setUser(toUser(data.session?.user)); setReady(true); });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(toUser(session?.user)));
        return () => subscription.unsubscribe();
    }, []);

    return { user, ready };
}
