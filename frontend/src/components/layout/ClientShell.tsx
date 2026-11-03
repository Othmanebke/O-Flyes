"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatDock from "@/components/chat/ChatDock";
import Toaster from "@/components/trip/Toaster";

// Pages plein écran, sans navbar ni footer du site (elles ont leur propre en-tête)
const STANDALONE = ["/dashboard", "/auth", "/onboarding"];

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";
  const home = pathname === "/";
  const standalone = STANDALONE.some(r => pathname.startsWith(r));
  const assistant = pathname.startsWith("/assistant");

  return (
    <>
      {!standalone && (
        home
          ? <div className="absolute inset-x-0 top-0 z-50"><Navbar overlay /></div>
          : <div className="sticky top-0 z-50"><Navbar /></div>
      )}
      <main className="flex-1">{children}</main>
      {!standalone && !assistant && <Footer />}
      {/* /assistant est déjà la conversation en plein écran */}
      {!assistant && <ChatDock />}
      <Toaster />
    </>
  );
}
