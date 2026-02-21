import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import PlaneBackground from "@/components/PlaneBackground";

export const metadata: Metadata = {
  title: "O-Flyes – Votre assistant voyage intelligent",
  description: "Trouvez la destination parfaite selon votre budget, vos envies et votre période de voyage grâce à l'IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col bg-white text-dark">
        <PlaneBackground />
        <Navbar />
        <main className="flex-1 pt-20">{children}</main>
        <Footer />
        <Chatbot />
      </body>
    </html>
  );
}
