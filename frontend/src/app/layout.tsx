import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import PlaneBackground from "@/components/PlaneBackground";
import ThemeProvider from "@/components/ThemeProvider";
import PageTransition, { FloatingParticles } from "@/components/PageTransition";
import PremiumCursor from "@/components/PremiumCursor";

export const metadata: Metadata = {
  title: "AIVANA – Votre assistant voyage intelligent",
  description: "Trouvez la destination parfaite selon votre budget, vos envies et votre période de voyage grâce à l'IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="dark">
      <body className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <ThemeProvider>
          <PremiumCursor />
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
        </ThemeProvider>
      </body>
    </html>
  );
}
