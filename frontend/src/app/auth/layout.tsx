import type { Metadata } from "next";

export const metadata: Metadata = { title: "Connexion", description: "Connectez-vous pour sauvegarder vos voyages et les retrouver partout." };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
