"use client";
import { useEffect, useRef } from "react";

/* Curseur personnalisé doré — uniquement sur desktop (pointer: fine) */
export default function PremiumCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Don't activate on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let animId: number;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
    };

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const loop = () => {
      ringX = lerp(ringX, mouseX, 0.12);
      ringY = lerp(ringY, mouseY, 0.12);
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    const onEnter = () => {
      dot.classList.add("cursor-hover");
      ring.classList.add("cursor-hover");
    };
    const onLeave = () => {
      dot.classList.remove("cursor-hover");
      ring.classList.remove("cursor-hover");
    };
    const onDown = () => {
      dot.classList.add("cursor-click");
      ring.classList.add("cursor-click");
    };
    const onUp = () => {
      dot.classList.remove("cursor-click");
      ring.classList.remove("cursor-click");
    };

    const targets = "a, button, [role='button'], input, select, label";

    const bindHover = () => {
      document.querySelectorAll<HTMLElement>(targets).forEach((el) => {
        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);
      });
    };

    bindHover();
    // Re-bind after DOM changes
    const observer = new MutationObserver(bindHover);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" aria-hidden />
      <div ref={ringRef} className="cursor-ring" aria-hidden />
    </>
  );
}
