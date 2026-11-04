import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tarifs", description: "AIVANA est gratuit pour commencer." };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
