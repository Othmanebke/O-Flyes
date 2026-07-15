"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Chatbot from "@/components/chat/Chatbot";
import PlaneBackground from "@/components/layout/PlaneBackground";
import PageTransition, { FloatingParticles } from "@/components/layout/PageTransition";
import GlobalLoader from "@/components/ui/GlobalLoader";

const STANDALONE_ROUTES = ["/onboarding", "/dashboard"];
const INTRO_SEEN_KEY = "oflyes_intro_seen";

function IntroSplash({ children }: { children: React.ReactNode }) {
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
    return (
      <IntroSplash>
        <main className="flex-1">{children}</main>
        <Chatbot />
      </IntroSplash>
    );
  }

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
