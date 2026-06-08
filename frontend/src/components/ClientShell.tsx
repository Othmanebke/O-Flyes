"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import PlaneBackground from "@/components/PlaneBackground";
import PageTransition, { FloatingParticles } from "@/components/PageTransition";

/* Routes qui ont leur propre layout complet — on ne leur affiche ni Navbar, ni Footer */
const STANDALONE_ROUTES = ["/onboarding"];

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalone = STANDALONE_ROUTES.some((r) => pathname.startsWith(r));

  if (isStandalone) {
    /* Dashboard / onboarding : on render juste les enfants + chatbot */
    return (
      <>
        <main className="flex-1">{children}</main>
        <Chatbot />
      </>
    );
  }

  /* Pages normales : Navbar + animations + Footer */
  return (
    <>
      <FloatingParticles />
      <PlaneBackground />
      <Navbar />
      <main className="flex-1 pt-20">
        <PageTransition>
          {children}
        </PageTransition>
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}
