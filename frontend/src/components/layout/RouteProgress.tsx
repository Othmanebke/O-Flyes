"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/* Fine barre dorée en haut de l'écran pendant le passage d'une page à l'autre.
   Elle démarre au clic sur un lien interne et se termine quand l'adresse change. */
function Bar() {
  const pathname = usePathname();
  const params = useSearchParams();
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const timers = useRef<number[]>([]);

  const clear = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // Démarrage : clic sur un lien de la même origine qui mène ailleurs
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement).closest("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      clear();
      setVisible(true);
      setWidth(12);
      timers.current.push(
        window.setTimeout(() => setWidth(45), 120),
        window.setTimeout(() => setWidth(70), 600),
        window.setTimeout(() => setWidth(85), 1600),
      );
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Fin : la nouvelle page est affichée
  useEffect(() => {
    clear();
    setWidth(w => (w > 0 ? 100 : 0));
    timers.current.push(
      window.setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 280),
    );
    return clear;
  }, [pathname, params]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[400] h-[3px]">
      <div
        className="h-full bg-gold shadow-[0_0_8px_rgba(201,162,75,0.7)] transition-[width,opacity] duration-300 ease-out"
        style={{ width: `${width}%`, opacity: visible ? 1 : 0 }}
      />
    </div>
  );
}

export default function RouteProgress() {
  return (
    <Suspense>
      <Bar />
    </Suspense>
  );
}
