import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journal",
  description: "Guides et conseils pratiques pour préparer vos voyages.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
