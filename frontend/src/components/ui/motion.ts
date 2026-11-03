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
   - [data-parallax="f"] translation verticale proportionnelle au scroll
   Performance : les éléments et leurs dimensions sont lus une fois (puis au
   redimensionnement), jamais à chaque image, et seuls les éléments visibles à
   l'écran sont animés. */
export function useMotionLoop(root: RefObject<HTMLElement>) {
    useEffect(() => {
        const el = root.current;
        if (!el || reducedMotion()) return;

        interface Marquee { node: HTMLElement; speed: number; half: number; x: number; base: number; arc: { node: HTMLElement; left: number; width: number }[] | null }
        let marquees: Marquee[] = [];
        let floats: { node: HTMLElement; k: number; base: string }[] = [];
        let parallax: { node: HTMLElement; f: number }[] = [];
        const visible = new Set<Element>();
        const io = new IntersectionObserver(entries => entries.forEach(e => {
            if (e.isIntersecting) visible.add(e.target); else visible.delete(e.target);
        }), { rootMargin: "100px" });

        const measure = () => {
            for (const m of marquees) {
                m.half = m.node.scrollWidth / 2;
                // le parent n'est pas transformé : sa position sert de référence fixe
                m.base = m.node.parentElement?.getBoundingClientRect().left ?? 0;
                if (m.arc) m.arc = (Array.from(m.node.children) as HTMLElement[]).map(c => ({ node: c, left: c.offsetLeft, width: c.offsetWidth }));
            }
        };

        const collect = () => {
            io.disconnect();
            visible.clear();
            marquees = Array.from(el.querySelectorAll<HTMLElement>("[data-marquee]")).map(node => ({
                node, speed: parseFloat(node.dataset.marquee || "1"), half: 0, x: 0, base: 0,
                arc: node.hasAttribute("data-arc") ? [] : null,
            }));
            floats = Array.from(el.querySelectorAll<HTMLElement>("[data-float]")).map(node => {
                if (node.dataset.baseT === undefined) node.dataset.baseT = node.style.transform || "";
                return { node, k: parseFloat(node.dataset.float || "1"), base: node.dataset.baseT };
            });
            parallax = Array.from(el.querySelectorAll<HTMLElement>("[data-parallax]")).map(node => ({ node, f: parseFloat(node.dataset.parallax || "0") }));
            [...marquees, ...floats, ...parallax].forEach(x => io.observe(x.node));
            measure();
        };
        collect();

        let pending = 0;
        const mo = new MutationObserver(() => { clearTimeout(pending); pending = window.setTimeout(collect, 200); });
        mo.observe(el, { childList: true, subtree: true });
        window.addEventListener("resize", measure);
        // la largeur des bandeaux de texte change quand les polices arrivent
        document.fonts?.ready.then(measure).catch(() => {});

        const t0 = performance.now();
        let raf = 0;
        const loop = (now: number) => {
            const t = (now - t0) / 1000;
            const W = window.innerWidth;
            for (const m of marquees) {
                if (!visible.has(m.node) || !m.half) continue;
                m.x -= m.speed;
                if (m.x <= -m.half) m.x += m.half;
                m.node.style.transform = `translate3d(${m.x}px,0,0)`;
                if (m.arc) {
                    for (const c of m.arc) {
                        const center = m.base + c.left + m.x + c.width / 2;
                        const n = Math.max(-1.4, Math.min(1.4, (center - W / 2) / (W / 2)));
                        c.node.style.transform = `perspective(1400px) rotateY(${n * -24}deg) rotateZ(${n * -2.5}deg) scale(${1 - Math.abs(n) * 0.2})`;
                    }
                }
            }
            for (const f of floats) {
                if (!visible.has(f.node)) continue;
                f.node.style.transform = `${f.base} translateY(${Math.sin(t * 0.9 + f.k * 1.7) * 9}px)`;
            }
            if (parallax.length) {
                const y = window.scrollY;
                for (const p of parallax) if (visible.has(p.node)) p.node.style.transform = `translate3d(0,${y * p.f}px,0)`;
            }
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => {
            cancelAnimationFrame(raf);
            clearTimeout(pending);
            io.disconnect();
            mo.disconnect();
            window.removeEventListener("resize", measure);
        };
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
