"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import axios from "axios";

interface Suggestion {
  label: string;
  city: string;
  country: string;
}

/* Champ ville avec suggestions (API /api/partner/locations/suggest) */
export default function CityInput({
  id,
  label,
  value,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const typed = useRef(false);
  const ref = useRef<HTMLLabelElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  useEffect(() => {
    if (open) setRect(ref.current?.getBoundingClientRect() || null);
  }, [open, items]);

  useEffect(() => {
    if (!typed.current || value.trim().length < 2) {
      setItems([]);
      return;
    }
    const t = setTimeout(() => {
      axios
        .get<Suggestion[]>("/api/partner/locations/suggest", { params: { q: value } })
        .then(r => setItems((r.data || []).slice(0, 6)))
        .catch(() => setItems([]));
    }, 250);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <label ref={ref} htmlFor={id} className="relative flex flex-col gap-0.5 bg-cream px-3.5 py-2.5">
      <span className="text-xs text-muted">{label}</span>
      <input
        id={id}
        value={value}
        autoComplete="off"
        onChange={e => {
          typed.current = true;
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="h-6 min-w-0 border-none bg-transparent p-0 text-[15px] text-ink outline-none"
      />
      {open &&
        items.length > 0 &&
        rect &&
        createPortal(
          <ul
            style={{ position: "fixed", left: rect.left, top: rect.bottom + 4, width: Math.max(rect.width, 220) }}
            className="z-[260] overflow-hidden rounded-2xl border border-line bg-white shadow-float"
          >
            {items.map(s => (
              <li key={s.label}>
                <button
                  type="button"
                  onMouseDown={() => {
                    onChange(s.city);
                    setOpen(false);
                    typed.current = false;
                  }}
                  className="block w-full px-4 py-2.5 text-left text-sm hover:bg-paper"
                >
                  {s.city} <span className="text-muted">· {s.country}</span>
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </label>
  );
}

export function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-0.5 bg-cream px-3.5 py-2.5">
      <span className="text-xs text-muted">{label}</span>
      {children}
    </label>
  );
}

export const fieldInput = "h-6 min-w-0 border-none bg-transparent p-0 text-[15px] text-ink outline-none";
