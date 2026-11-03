"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatDock from "@/components/chat/ChatDock";
import Toaster from "@/components/trip/Toaster";

// Pages plein écran, sans navbar ni footer du site (elles ont leur propre en-tête)
const STANDALONE = ["/auth", "/onboarding"];

function AutoHideNav() {
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;
    const on = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (Math.abs(y - last) > 6) { setHidden(y > last && y > 80); last = y; }
        ticking = false;
      });
    };
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <div className={`sticky top-0 z-50 transition-transform duration-300 ${hidden ? "-translate-y-full" : ""}`}>
      <Navbar />
    </div>
  );
}

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const home = pathname === "/";
  const standalone = STANDALONE.some(r => pathname.startsWith(r));
  const assistant = pathname.startsWith("/assistant");
  // Le carnet garde la navbar mais pas le grand footer : c'est un espace de travail
  const noFooter = assistant || pathname.startsWith("/dashboard");

  return (
    <>
      {!standalone && (
        home
          ? <div className="absolute inset-x-0 top-0 z-50"><Navbar overlay /></div>
          : <AutoHideNav />
      )}
      <main className="flex-1">{children}</main>
      {!standalone && !noFooter && <Footer />}
      {/* /assistant est déjà la conversation en plein écran */}
      {!assistant && <ChatDock />}
      <Toaster />
    </>
  );
}
