import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Désinscription",
  description: "Se désinscrire de la lettre mensuelle d'AIVANA.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
