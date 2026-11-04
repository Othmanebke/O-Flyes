import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carnet de voyage (PDF)",
  description: "Votre voyage sur une page, à enregistrer en PDF ou à imprimer.",
  robots: { index: false },
};

export default function CarnetLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
