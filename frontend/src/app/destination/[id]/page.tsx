import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { byId } from "@/lib/catalog";
import DestinationView from "./DestinationView";

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const d = byId(params.id);
  return d ? { title: `${d.name}, ${d.country}`, description: d.desc } : {};
}

export default function DestinationPage({ params }: { params: { id: string } }) {
  const d = byId(params.id);
  if (!d) notFound();
  return <DestinationView id={d.id} />;
}
