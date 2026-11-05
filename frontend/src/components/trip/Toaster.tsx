"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import type { ToastDetail } from "@/lib/plan";

/* Confirmation visible après chaque action (ajout au voyage, sauvegarde…). */
export default function Toaster() {
  const [toast, setToast] = useState<(ToastDetail & { id: number }) | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const on = (e: Event) => {
      const detail = (e as CustomEvent<ToastDetail>).detail;
      setToast({ ...detail, id: Date.now() });
      clearTimeout(timer);
      timer = setTimeout(() => setToast(null), 4500);
    };
    window.addEventListener("aivana-toast", on);
    return () => {
      window.removeEventListener("aivana-toast", on);
      clearTimeout(timer);
    };
  }, []);

  if (!toast) return null;
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-24 z-[250] flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div
        key={toast.id}
        className="pointer-events-auto flex animate-fade-up items-center gap-3 rounded-full bg-ink py-2 pl-2 pr-3 text-sm text-white shadow-panel"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-soft text-ink">
          <Check className="h-4 w-4" aria-hidden />
        </span>
        <span>{toast.message}</span>
        {toast.action && (
          <Link
            href={toast.action.href}
            onClick={() => setToast(null)}
            className="plain-link whitespace-nowrap rounded-full bg-white px-3 py-1 text-[13px] font-semibold !text-ink"
          >
            {toast.action.label}
          </Link>
        )}
        <button onClick={() => setToast(null)} aria-label="Fermer" className="text-white/60 hover:text-white">
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
