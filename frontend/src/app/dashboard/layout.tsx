import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard – AIVANA",
  description: "Gérez vos voyages et votre profil AIVANA.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
