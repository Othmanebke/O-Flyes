"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plane, UserCircle, LayoutDashboard } from "lucide-react";
import { clsx } from "clsx";
import { useEffect, useState } from "react";

const links = [
  { href: "/explore", label: "Destinations" },
  { href: "/blog", label: "Blog" },
  { href: "/gallery", label: "Galerie" },
  { href: "/pricing", label: "Tarifs" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setIsLoggedIn(true);
        setUserName(payload.name || "");
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, [pathname]); // re-check on route change

  return (
    <nav
      className={clsx(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl px-5 h-14 flex items-center justify-between",
        "rounded-2xl border transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-md border-gold-100 shadow-lg shadow-black/5"
          : "bg-white/60 backdrop-blur-sm border-white/80 shadow-md shadow-black/5"
      )}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-1.5 font-semibold text-[15px] text-dark">
        <span className="w-7 h-7 bg-dark rounded-xl flex items-center justify-center">
          <Plane className="w-3.5 h-3.5 text-white" />
        </span>
        <span>O&ndash;<span className="text-gold">Flyes</span></span>
      </Link>

      {/* Center label */}
      <span className="hidden md:block text-xs text-dark-300 tracking-wide">
        Basé sur l&rsquo;IA Voyage
      </span>

      {/* Nav links */}
      <div className="flex items-center gap-5">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "text-[13px] font-medium transition-colors relative group",
              pathname === href ? "text-dark" : "text-dark-400 hover:text-dark"
            )}
          >
            {label}
            <span
              className={clsx(
                "absolute -bottom-0.5 left-0 h-px bg-gold transition-all duration-300",
                pathname === href ? "w-full" : "w-0 group-hover:w-full"
              )}
            />
          </Link>
        ))}

        {isLoggedIn ? (
          // Utilisateur connecté → bouton Dashboard avec initiale
          <Link
            href="/dashboard"
            className={clsx(
              "flex items-center gap-2 text-[13px] font-semibold px-3 py-1.5 rounded-xl border-2 transition-all duration-200 hover:scale-105",
              pathname.startsWith("/dashboard")
                ? "border-gold text-gold bg-gold/10"
                : "border-gold/50 text-gold hover:border-gold hover:bg-gold/10"
            )}
            title="Mon dashboard"
          >
            <span className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 text-[10px] font-bold">
              {userName.charAt(0).toUpperCase() || "?"}
            </span>
            <span className="hidden sm:block">Dashboard</span>
          </Link>
        ) : (
          // Non connecté → icône connexion
          <Link
            href="/auth/login"
            className={clsx(
              "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 hover:scale-105",
              pathname.startsWith("/auth")
                ? "border-gold text-gold bg-gold/10"
                : "border-gold/50 text-gold hover:border-gold hover:bg-gold/10"
            )}
            title="Se connecter"
          >
            <UserCircle className="w-4 h-4" />
          </Link>
        )}
      </div>
    </nav>
  );
}
