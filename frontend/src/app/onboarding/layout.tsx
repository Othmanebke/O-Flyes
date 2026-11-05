import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bienvenue",
  description: "Trois questions pour que le copilote vise juste.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
