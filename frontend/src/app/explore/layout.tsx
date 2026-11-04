import type { Metadata } from "next";
import { DESTINATIONS } from "@/lib/catalog";

export const metadata: Metadata = { title: "Destinations", description: `${DESTINATIONS.length} destinations, avec un budget estimé pour deux, vols depuis Paris compris.` };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
