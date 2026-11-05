import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, serverError } from "@/lib/api/guard";
import { rateLimit, tooManyRequests } from "@/lib/api/rateLimit";
import { createAdminClient } from "@/lib/supabase/admin";

// RGPD, article 17 (droit à l'effacement) : suppression définitive du compte.
// La suppression de l'utilisateur dans auth.users entraîne, par les clés étrangères
// ON DELETE CASCADE, celle de ses voyages (trips) et de leurs éléments (trip_items).
// L'abonnement à la newsletter est retiré aussi.
const schema = z.object({ confirm: z.literal("SUPPRIMER") });

export async function DELETE(request: Request) {
  const g = await requireUser();
  if (!g.ok) return g.response;
  const { user } = g;

  if (!(await rateLimit(`account:delete:${user.id}`, 5, 3600))) return tooManyRequests(3600);

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Tapez SUPPRIMER pour confirmer." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin)
    return NextResponse.json({ error: "Suppression indisponible : clé serveur Supabase manquante." }, { status: 503 });

  if (user.email) {
    await admin.from("newsletter_subscribers").delete().eq("email", user.email.toLowerCase());
  }
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return serverError("account:delete", error, "La suppression a échoué. Réessayez ou contactez-nous.");

  return new NextResponse(null, { status: 204 });
}
