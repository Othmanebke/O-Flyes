import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import PremiumCursor from "@/components/PremiumCursor";
import ClientShell from "@/components/ClientShell";

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
          <ClientShell>
            {children}
          </ClientShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
