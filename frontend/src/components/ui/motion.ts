"use client";
import { useEffect, useState, type RefObject } from "react";

const reducedMotion = () =>
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/* Apparition au défilement des éléments [data-reveal] du conteneur :
   opacity 0 → 1 et translateY 28px → 0, décalage de 80 ms entre voisins. */
export function useReveal(root: RefObject<HTMLElement>) {
    useEffect(() => {
        const el = root.current;
        if (!el || reducedMotion()) return;
        const io = new IntersectionObserver(entries => entries.forEach(e => {
            if (!e.isIntersecting) return;
            const t = e.target as HTMLElement;
            t.style.opacity = "1";
            t.style.transform = "none";
            t.setAttribute("data-shown", "1");
            io.unobserve(t);
        }), { threshold: 0.12 });
        // On ne marque un élément « fait » qu'une fois affiché : si l'effet est rejoué
        // (React le lance deux fois en développement), les éléments encore cachés sont
        // de nouveau observés au lieu de rester invisibles.
        const observed = new WeakSet<Element>();
        const prep = () => el.querySelectorAll<HTMLElement>("[data-reveal]:not([data-shown])").forEach((t, i) => {
            if (observed.has(t)) return;
            observed.add(t);
            t.style.opacity = "0";
            t.style.transform = "translateY(28px)";
            const delay = (i % 4) * 0.08;
            t.style.transition = `opacity 0.9s ease ${delay}s, transform 0.9s cubic-bezier(0.22,1,0.36,1) ${delay}s`;
            io.observe(t);
        });
        prep();
        const mo = new MutationObserver(prep);
        mo.observe(el, { childList: true, subtree: true });
        return () => { io.disconnect(); mo.disconnect(); };
    }, [root]);
}

/* Boucle d'animation partagée :
   - [data-float="k"]   flottement doux (sin, ±9 px)
   - [data-marquee="v"] défilement infini (contenu dupliqué deux fois)
   - [data-arc]         sur un marquee : carrousel courbé selon la distance au centre
   - [data-parallax="f"] translation verticale proportionnelle au scroll */
export function useMotionLoop(root: RefObject<HTMLElement>) {
    useEffect(() => {
        const el = root.current;
        if (!el || reducedMotion()) return;
        const offsets = new WeakMap<Element, number>();
        const t0 = performance.now();
        let raf = 0;
        const loop = (now: number) => {
            const t = (now - t0) / 1000;
            el.querySelectorAll<HTMLElement>("[data-marquee]").forEach(m => {
                const speed = parseFloat(m.dataset.marquee || "1");
                const half = m.scrollWidth / 2;
                let x = (offsets.get(m) || 0) - speed;
                if (half > 0 && x <= -half) x += half;
                offsets.set(m, x);
                m.style.transform = `translateX(${x}px)`;
                if (m.hasAttribute("data-arc")) {
                    const W = window.innerWidth;
                    for (const c of Array.from(m.children) as HTMLElement[]) {
                        const r = c.getBoundingClientRect();
                        if (!r.width) continue;
                        let n = (r.left + r.width / 2 - W / 2) / (W / 2);
                        n = Math.max(-1.4, Math.min(1.4, n));
                        c.style.transform = `perspective(1400px) rotateY(${n * -24}deg) rotateZ(${n * -2.5}deg) scale(${1 - Math.abs(n) * 0.2})`;
                    }
                }
            });
            el.querySelectorAll<HTMLElement>("[data-float]").forEach(f => {
                const k = parseFloat(f.dataset.float || "1");
                if (f.dataset.baseT === undefined) f.dataset.baseT = f.style.transform || "";
                f.style.transform = `${f.dataset.baseT} translateY(${Math.sin(t * 0.9 + k * 1.7) * 9}px)`;
            });
            const y = window.scrollY;
            el.querySelectorAll<HTMLElement>("[data-parallax]").forEach(p => {
                p.style.transform = `translateY(${y * parseFloat(p.dataset.parallax || "0")}px)`;
            });
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, [root]);
}

/* Largeur de fenêtre (0 côté serveur) */
export function useWidth() {
    const [w, setW] = useState(0);
    useEffect(() => {
        const on = () => setW(window.innerWidth);
        on();
        window.addEventListener("resize", on);
        return () => window.removeEventListener("resize", on);
    }, []);
    return w;
}
