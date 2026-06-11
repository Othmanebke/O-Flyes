"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import PlaneBackground from "@/components/PlaneBackground";
import PageTransition, { FloatingParticles } from "@/components/PageTransition";
import GlobalLoader from "@/components/ui/GlobalLoader";

/* Routes qui ont leur propre layout complet — on ne leur affiche ni Navbar, ni Footer */
const STANDALONE_ROUTES = ["/onboarding", "/dashboard"];

/* Ecran d'intro cinématique : affiché une seule fois par session, au tout premier
   chargement du site (Next.js App Router rend les pages côté client, donc app/loading.tsx
   ne se déclenche jamais — c'est ici, dans le shell racine, qu'on contrôle l'intro). */
const INTRO_SEEN_KEY = "oflyes_intro_seen";

function IntroSplash({ children }: { children: React.ReactNode }) {
  // Démarre à `false` : le contenu s'affiche immédiatement (pas d'écran blanc),
  // l'intro vient ensuite se superposer par-dessus si elle n'a jamais été vue.
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
    if (!alreadySeen) setShowIntro(true);
  }, []);

  const dismissIntro = () => {
    sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    setShowIntro(false);
  };

  return (
    <>
      {children}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro-splash"
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[9999]"
          >
            <GlobalLoader onComplete={() => setTimeout(dismissIntro, 500)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalone = STANDALONE_ROUTES.some((r) => pathname.startsWith(r));

  if (isStandalone) {
    /* Dashboard / onboarding : on render juste les enfants + chatbot */
    return (
      <IntroSplash>
        <main className="flex-1">{children}</main>
        <Chatbot />
      </IntroSplash>
    );
  }

  /* Pages normales : Navbar + animations + Footer */
  return (
    <IntroSplash>
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
    </IntroSplash>
  );
}
