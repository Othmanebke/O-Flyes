import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { isUuid, requireUser, serverError } from "@/lib/api/guard";

type Ctx = { params: Promise<{ tripId: string }> };

const shareSchema = z.object({
  travelers: z.number().int().min(1).max(20).optional(),
  budget: z.number().min(0).max(1000000).nullable().optional(),
  name: z.string().trim().max(80).nullable().optional(),
});

const notFound = () => NextResponse.json({ error: "Voyage introuvable" }, { status: 404 });

// Active le lien public d'un voyage (lecture seule) et renvoie son identifiant.
// L'identifiant est un UUID aléatoire (122 bits) : impossible à deviner.
export async function POST(request: Request, { params }: Ctx) {
  const { tripId } = await params;
  if (!isUuid(tripId)) return notFound();
  const g = await requireUser();
  if (!g.ok) return g.response;

  const parsed = shareSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  const body = parsed.data;

  const { data: trip, error } = await g.supabase.from("trips").select("id, share_id").eq("id", tripId).maybeSingle();
  if (error) {
    if (error.message?.includes("share_id")) {
      return NextResponse.json(
        { error: "Partage indisponible : exécutez la migration 0006 dans Supabase." },
        { status: 503 },
      );
    }
    return serverError("share:read", error);
  }
  if (!trip) return notFound();

  const shareId = trip.share_id || randomUUID();
  const { error: upd } = await g.supabase
    .from("trips")
    .update({
      share_id: shareId,
      travelers: body.travelers,
      budget: typeof body.budget === "number" ? body.budget : undefined,
      name: typeof body.name === "string" ? body.name : undefined,
    })
    .eq("id", trip.id);
  if (upd) return serverError("share:update", upd, "Partage indisponible pour le moment.");

  return NextResponse.json({ shareId });
}

// Désactive le lien : l'ancienne adresse ne mène plus à rien
export async function DELETE(_request: Request, { params }: Ctx) {
  const { tripId } = await params;
  if (!isUuid(tripId)) return notFound();
  const g = await requireUser();
  if (!g.ok) return g.response;
  const { error } = await g.supabase.from("trips").update({ share_id: null }).eq("id", tripId);
  if (error) return serverError("share:delete", error, "Impossible de désactiver le lien.");
  return new NextResponse(null, { status: 204 });
}
