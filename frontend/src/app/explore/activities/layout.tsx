import type { Metadata } from "next";

export const metadata: Metadata = { title: { absolute: "Activités · AIVANA" }, description: "Lieux à voir et idées de sorties sur place, avec la durée et un prix moyen." };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
