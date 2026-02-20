"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plane } from "lucide-react";
import { clsx } from "clsx";

const links = [
  { href: "/explore", label: "Destinations" },
  { href: "/chat",    label: "Chatbot IA" },
  { href: "/blog",    label: "Blog" },
  { href: "/gallery", label: "Galerie" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-dark-100">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 font-semibold text-[15px] text-dark">
          <span className="w-6 h-6 bg-dark-700 rounded-full flex items-center justify-center">
            <Plane className="w-3 h-3 text-white" />
          </span>
          O-Flyes
        </Link>

        {/* Center label */}
        <span className="hidden md:block text-xs text-dark-300 tracking-wide">
          Basé sur l'IA Voyage
        </span>

        {/* Nav links */}
        <div className="flex items-center gap-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "text-[13px] font-medium transition-colors",
                pathname === href
                  ? "text-dark"
                  : "text-dark-400 hover:text-dark"
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
