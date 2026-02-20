"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plane } from "lucide-react";
import { clsx } from "clsx";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/explore", label: "Explorer" },
  { href: "/chat", label: "Chatbot" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-50 glass border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
          <Plane className="w-6 h-6 text-brand-400" />
          O-Flyes
        </Link>
        <div className="flex items-center gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-brand-500/20 text-brand-300"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/pricing"
            className="ml-4 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Pro
          </Link>
        </div>
      </div>
    </nav>
  );
}
