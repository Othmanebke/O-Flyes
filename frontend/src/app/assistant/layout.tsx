import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Copilote IA",
  description: "Décrivez votre voyage : le copilote propose des destinations avec un coût total estimé.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
