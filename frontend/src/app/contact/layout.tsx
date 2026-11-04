import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact", description: "Une question, un bug, une idée : écrivez-nous." };

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
