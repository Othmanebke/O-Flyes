import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Hébergements · AIVANA" },
  description: "Les logements typiques de votre destination, le bon quartier et le prix du séjour.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
