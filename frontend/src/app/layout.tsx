import type { Metadata } from "next";
import { Manrope, Newsreader, Kaushan_Script } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/layout/ClientShell";
import { Analytics } from "@vercel/analytics/next";

const sans = Manrope({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-sans", display: "swap" });
const serif = Newsreader({ subsets: ["latin"], style: ["italic"], weight: ["500", "600"], variable: "--font-serif", display: "swap" });
const logo = Kaushan_Script({ subsets: ["latin"], weight: "400", variable: "--font-logo", display: "swap" });

export const metadata: Metadata = {
  title: "AIVANA – Votre copilote de voyage",
  description: "Décrivez votre budget, vos dates et vos envies : AIVANA propose des destinations avec un coût total estimé, compare vols, hôtels et activités, et range tout dans votre carnet de voyage.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${sans.variable} ${serif.variable} ${logo.variable}`}>
      <body className="flex min-h-screen flex-col">
        <ClientShell>{children}</ClientShell>
        {process.env.VERCEL && <Analytics />}
      </body>
    </html>
  );
}
