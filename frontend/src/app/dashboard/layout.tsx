import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon carnet de voyage",
  description: "Gérez vos voyages et votre profil AIVANA.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
