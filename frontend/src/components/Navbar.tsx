"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plane, UserCircle, Menu, X } from "lucide-react";
import { clsx } from "clsx";
import { useEffect, useState } from "react";

const links = [
  { href: "/explore", label: "Destinations" },
  { href: "/explore/activities", label: "Activités" },
  { href: "/explore/hotels", label: "Hôtels" },
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
  }, [pathname]); // re-check on route change

  // Close menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
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
        "fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl px-5 h-14 flex items-center justify-between",
        "rounded-2xl transition-all duration-500 ease-out",
        scrolled
          ? [
            // Glass pill — iOS style
            "bg-sand-50/70 backdrop-blur-2xl",
            // Outer border — clean side edges
            "border border-white/40",
            // Soft inner highlight (ring = inset border)
            "ring-1 ring-inset ring-white/60",
            // Elevation shadow
            "shadow-[0_8px_32px_rgba(0,0,0,0.12),0_1px_2px_rgba(255,255,255,0.6)_inset]",
          ].join(" ")
          : [
            // Transparent at top
            "bg-sand-50/20 backdrop-blur-sm",
            "border border-white/20",
            "ring-1 ring-inset ring-white/30",
            "shadow-sm",
          ].join(" ")
      )}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-1.5 font-semibold text-[15px] text-dark">
        <span className="w-7 h-7 bg-dark rounded-xl flex items-center justify-center">
          <Plane className="w-3.5 h-3.5 text-white" />
        </span>
        <span>AI<span className="text-gold">VANA</span></span>
      </Link>

      {/* Center label */}
      <span className="hidden md:block text-xs text-dark-300 tracking-wide">
        Basé sur l&rsquo;IA Voyage
      </span>

      {/* Nav links - Desktop */}
      <div className="hidden md:flex items-center gap-5">
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
            <span className="w-5 h-5 bg-gold-400 rounded-full flex items-center justify-center text-dark-900 text-[10px] font-bold">
              {userName.charAt(0).toUpperCase() || "?"}
            </span>
            <span>Dashboard</span>
          </Link>
        ) : (
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

      {/* Mobile Menu Controls */}
      <div className="flex md:hidden items-center gap-3">
        {isLoggedIn ? (
          <Link href="/dashboard" className="w-8 h-8 bg-gold-400 rounded-full flex items-center justify-center text-dark-900 text-[10px] font-bold">
            {userName.charAt(0).toUpperCase() || "?"}
          </Link>
        ) : (
          <Link href="/auth/login" className="text-dark-400">
            <UserCircle className="w-5 h-5" />
          </Link>
        )}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-10 h-10 flex items-center justify-center text-dark"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={clsx(
          "fixed inset-0 z-50 bg-sand-50/95 backdrop-blur-xl transition-all duration-500 ease-in-out md:hidden flex flex-col items-center justify-center gap-8",
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        style={{ top: "0", left: "0", width: "100%", height: "100vh" }}
      >
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="absolute top-6 right-8 text-dark"
        >
          <X className="w-6 h-6" />
        </button>

        {links.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={clsx(
              "text-2xl font-serif transition-colors",
              pathname === href ? "text-gold" : "text-dark hover:text-gold"
            )}
          >
            {label}
          </Link>
        ))}

        <Link
          href="/auth/login"
          className="mt-4 btn-dark py-3 px-10 text-base"
        >
          {isLoggedIn ? "Mon Dashboard" : "Se connecter"}
        </Link>
      </div>
    </nav>
  );
}
