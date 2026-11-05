import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Vols · AIVANA" },
  description:
    "Comparez les compagnies qui desservent votre destination depuis Paris, en aller-retour ou aller simple.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
