import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { byId } from "@/lib/catalog";
import DestinationView from "./DestinationView";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const d = byId((await params).id);
  return d ? { title: `${d.name}, ${d.country}`, description: d.desc } : {};
}

export default async function DestinationPage({ params }: { params: Promise<{ id: string }> }) {
  const d = byId((await params).id);
  if (!d) notFound();
  return <DestinationView id={d.id} />;
}
