"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/* ─────────────────────────────────────────
   PageTransition
   Injecte 3 systèmes d'animation globaux :
   1. Transition de page (fade + slide)
   2. Scroll-reveal automatique (IntersectionObserver)
   3. Particules dorées flottantes en fond
───────────────────────────────────────── */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  /* ── 1. Scroll-reveal auto ── */
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("sr-visible");
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    const scan = () => {
      document.querySelectorAll("[data-sr]").forEach((el) => {
        if (!el.classList.contains("sr-visible")) {
          observerRef.current?.observe(el);
        }
      });
    };

    scan();
    // Re-scan after a short delay to catch dynamically-rendered elements
    const t = setTimeout(scan, 600);
    return () => {
      clearTimeout(t);
      observerRef.current?.disconnect();
    };
  }, [pathname]);

  /* ── 2. Page-entry animation ── */
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    el.classList.remove("page-enter-done");
    el.classList.add("page-enter");
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.add("page-enter-done");
      });
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return (
    <div ref={mainRef} className="page-enter page-enter-done">
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────
   FloatingParticles
   Petites particules dorées flottantes
───────────────────────────────────────── */
export function FloatingParticles() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1.5,
    x: Math.random() * 100,
    delay: Math.random() * 20,
    duration: 15 + Math.random() * 20,
    opacity: 0.04 + Math.random() * 0.08,
  }));

  return (
    <div className="particles-container" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}
