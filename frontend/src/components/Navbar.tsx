"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plane, Menu, X, Sparkles, Sun, Moon } from "lucide-react";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeProvider";
import { createClient } from "@/lib/supabase/browser";

const links = [
  { href: "/explore", label: "Destinations" },
  { href: "/explore/flights", label: "Vols" },
  { href: "/explore/hotels", label: "Hôtels" },
  { href: "/blog", label: "Blog" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
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
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsLoggedIn(true);
        setUserName(session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "");
      } else {
        setIsLoggedIn(false);
        setUserName("");
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsLoggedIn(true);
        setUserName(session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "");
      } else {
        setIsLoggedIn(false);
        setUserName("");
      }
    });
    return () => subscription.unsubscribe();
  }, []);

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
    <>
      <nav
        className={clsx(
          "fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-6xl px-6 h-16 flex items-center justify-between",
          "rounded-[24px] transition-all duration-700 ease-out",
          scrolled
            ? [
              "backdrop-blur-2xl px-8",
              "shadow-[0_20px_50px_var(--shadow-color)]",
            ].join(" ")
            : [
              "backdrop-blur-md px-6",
              "shadow-sm",
            ].join(" ")
        )}
        style={{
          backgroundColor: scrolled ? 'var(--glass-bg)' : (theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.40)'),
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: scrolled ? 'var(--glass-border)' : (theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(230,224,209,0.30)'),
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 font-serif text-lg tracking-tight group" style={{ color: 'var(--text-primary)' }}>
          <div className="w-10 h-10 bg-gold/10 rounded-2xl flex items-center justify-center border border-gold/20 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(184,134,11,0.1)]">
            <Plane className="w-5 h-5 text-gold group-hover:rotate-12 transition-transform" />
          </div>
          <div className="flex flex-col justify-center">
            <span className="font-bold leading-none">AI<span className="text-gold">VANA</span></span>
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
                pathname === href ? "text-gold" : ""
              )}
              style={pathname !== href ? { color: 'var(--text-muted)' } : undefined}
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
        <div className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
            style={{
              backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(10,17,40,0.05)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: theme === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(10,17,40,0.10)',
              color: 'var(--text-primary)',
            }}
            title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
          >
            {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>

          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-3 hover:bg-gold transition-all pl-2 pr-5 py-2 rounded-2xl group active:scale-95"
              style={{
                backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(10,17,40,0.05)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--border-color)',
              }}
            >
              <div className="w-8 h-8 bg-gold rounded-xl flex items-center justify-center text-[10px] font-black" style={{ color: 'var(--text-inverse)' }}>
                {userName.charAt(0).toUpperCase()}
              </div>
              <span className="text-[10px] uppercase font-black tracking-widest group-hover:text-dark" style={{ color: 'var(--text-primary)' }}>Profil</span>
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="hidden sm:flex items-center gap-2 bg-gold px-6 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-gold-300 transition-all shadow-xl shadow-gold/10 active:scale-95"
              style={{ color: 'var(--text-inverse)' }}
            >
              Se connecter
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl"
            style={{
              color: 'var(--text-primary)',
              backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(10,17,40,0.05)',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: 'var(--border-color)',
            }}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[200] backdrop-blur-3xl flex flex-col items-center justify-center gap-10 p-10"
            style={{ backgroundColor: 'var(--overlay-light)' }}
          >
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-10 right-10 hover:text-gold transition-colors"
              style={{ color: 'var(--text-muted)' }}
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
                      pathname === href ? "text-gold italic" : ""
                    )}
                    style={pathname !== href ? { color: 'var(--text-muted)' } : undefined}
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Theme toggle in mobile menu */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all"
              style={{
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
              }}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span className="text-xs font-black uppercase tracking-widest">
                {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
              </span>
            </button>

            <Link
              href={isLoggedIn ? "/dashboard" : "/auth/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="mt-4 bg-gold px-16 py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-gold/20 flex items-center gap-3"
              style={{ color: 'var(--text-inverse)' }}
            >
              <Sparkles className="w-4 h-4" /> Dashboard
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
