import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard – AIVANA",
  description: "Gérez vos voyages et votre profil AIVANA.",
};

/* Le dashboard a son propre layout (sidebar + header intégrés).
   On n'affiche ni Navbar, ni Footer, ni PageTransition globale. */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
