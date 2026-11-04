import type { Metadata } from "next";

export const metadata: Metadata = { title: "Destinations", description: "22 destinations choisies, avec un budget estimé pour deux, vols depuis Paris compris." };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
