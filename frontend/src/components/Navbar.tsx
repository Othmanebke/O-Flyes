"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plane, Menu, X, Sparkles } from "lucide-react";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const links = [
  { href: "/explore", label: "Destinations" },
  { href: "/explore/activities", label: "Activités" },
  { href: "/explore/hotels", label: "Hôtels" },
  { href: "/explore/flights", label: "Vols" },
  { href: "/blog", label: "Blog" },
  { href: "/gallery", label: "Galerie" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
  }, [pathname]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [mobileMenuOpen]);

  return (
    <nav
      className={clsx(
        "fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-6xl px-6 h-16 flex items-center justify-between",
        "rounded-[24px] transition-all duration-700 ease-out",
        scrolled
          ? [
            "bg-[#141822]/80 backdrop-blur-2xl px-8",
            "border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
          ].join(" ")
          : [
            "bg-white/5 backdrop-blur-md px-6",
            "border border-white/5 shadow-sm",
          ].join(" ")
      )}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 font-serif text-lg tracking-tight text-white group">
        <div className="w-10 h-10 bg-gold/10 rounded-2xl flex items-center justify-center border border-gold/20 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(184,134,11,0.1)]">
          <Plane className="w-5 h-5 text-gold group-hover:rotate-12 transition-transform" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold leading-none">AI<span className="text-gold">VANA</span></span>
          <span className="text-[7px] uppercase tracking-[0.4em] text-gold/60 font-sans mt-0.5">Luxe & Liberté</span>
        </div>
      </Link>

      {/* Nav links - Desktop */}
      <div className="hidden lg:flex items-center gap-8">
        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "text-[11px] font-black uppercase tracking-[0.2em] transition-all relative group py-2",
              pathname === href ? "text-gold" : "text-white/40 hover:text-white"
            )}
          >
            {label}
            <span
              className={clsx(
                "absolute -bottom-1 left-1/2 -translate-x-1/2 h-[2px] bg-gold transition-all duration-500 rounded-full",
                pathname === href ? "w-1/2 opacity-100" : "w-0 opacity-0 group-hover:w-1/3 group-hover:opacity-50"
              )}
            />
          </Link>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <Link
            href="/dashboard"
            className="flex items-center gap-3 bg-white/5 hover:bg-gold transition-all pl-2 pr-5 py-2 rounded-2xl border border-white/10 group active:scale-95"
          >
            <div className="w-8 h-8 bg-gold text-dark rounded-xl flex items-center justify-center text-[10px] font-black">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-[10px] uppercase font-black tracking-widest text-white group-hover:text-dark">Profil</span>
          </Link>
        ) : (
          <Link
            href="/auth/login"
            className="hidden sm:flex items-center gap-2 bg-gold text-dark px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gold-300 transition-all shadow-xl shadow-gold/10 active:scale-95"
          >
            Se connecter
          </Link>
        )}

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden w-10 h-10 flex items-center justify-center text-white bg-white/5 rounded-xl border border-white/10"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[200] bg-[#0A0D14]/98 backdrop-blur-3xl flex flex-col items-center justify-center gap-10 p-10"
          >
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-10 right-10 text-white/40 hover:text-gold transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            <div className="flex flex-col items-center gap-8">
              {links.map(({ href, label }, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={href}
                >
                  <Link
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={clsx(
                      "text-4xl font-serif transition-all",
                      pathname === href ? "text-gold italic" : "text-white/40 hover:text-white"
                    )}
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
            </div>

            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-12 bg-gold text-dark px-16 py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-gold/20 flex items-center gap-3"
            >
              <Sparkles className="w-4 h-4" /> Accès Membre
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
