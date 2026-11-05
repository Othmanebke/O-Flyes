import { NextResponse } from "next/server";
import { z } from "zod";
import { isUuid, requireUser, serverError } from "@/lib/api/guard";

type Ctx = { params: Promise<{ tripId: string; itemId: string }> };

const notFound = () => NextResponse.json({ error: "Élément introuvable" }, { status: 404 });

export async function DELETE(_request: Request, { params }: Ctx) {
  const { tripId, itemId } = await params;
  if (!isUuid(tripId) || !isUuid(itemId)) return notFound();
  const g = await requireUser();
  if (!g.ok) return g.response;

  const { error } = await g.supabase.from("trip_items").delete().eq("id", itemId).eq("trip_id", tripId);

  if (error) return serverError("items:delete", error);
  return new NextResponse(null, { status: 204 });
}

const patchSchema = z
  .object({
    // date de l'élément dans le séjour (AAAA-MM-JJ), null pour « à placer »
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional(),
    // réservé chez le partenaire (déclaré par l'utilisateur)
    booked: z.boolean().optional(),
  })
  .strict()
  .refine(v => v.date !== undefined || v.booked !== undefined);

// Change le jour d'un élément dans l'itinéraire, ou le marque comme réservé
export async function PATCH(request: Request, { params }: Ctx) {
  const { tripId, itemId } = await params;
  if (!isUuid(tripId) || !isUuid(itemId)) return notFound();
  const g = await requireUser();
  if (!g.ok) return g.response;

  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Modification invalide" }, { status: 400 });

  // La RLS limite la lecture et l'écriture aux éléments des voyages de l'utilisateur
  const { data: item } = await g.supabase
    .from("trip_items")
    .select("metadata")
    .eq("id", itemId)
    .eq("trip_id", tripId)
    .maybeSingle();
  if (!item) return notFound();

  const { error } = await g.supabase
    .from("trip_items")
    .update({ metadata: { ...(item.metadata || {}), ...parsed.data } })
    .eq("id", itemId)
    .eq("trip_id", tripId);
  if (error) return serverError("items:patch", error);

  return NextResponse.json({ ok: true });
}
