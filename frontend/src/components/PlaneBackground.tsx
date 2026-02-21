"use client";

const planes = [
  { cls: "shoot-1", size: 10 },
  { cls: "shoot-2", size: 7 },
  { cls: "shoot-3", size: 13 },
  { cls: "shoot-4", size: 8 },
  { cls: "shoot-5", size: 11 },
  { cls: "shoot-6", size: 6 },
  { cls: "shoot-7", size: 9 },
  { cls: "shoot-8", size: 14 },
];

export default function PlaneBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      {planes.map((p, i) => (
        <div key={i} className={`shoot ${p.cls}`}>
          <svg width={p.size * 2} height={p.size * 2} viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
        </div>
      ))}
    </div>
  );
}