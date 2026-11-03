import { notFound } from "next/navigation";
import { byId } from "@/lib/catalog";
import DestinationView from "./DestinationView";

export default function DestinationPage({ params }: { params: { id: string } }) {
  const d = byId(params.id);
  if (!d) notFound();
  return <DestinationView id={d.id} />;
}
