"use client";

const planes = [
  { cls: "shoot-1", size: 10 },
  { cls: "shoot-2", size: 7  },
  { cls: "shoot-3", size: 13 },
  { cls: "shoot-4", size: 8  },
  { cls: "shoot-5", size: 11 },
  { cls: "shoot-6", size: 6  },
  { cls: "shoot-7", size: 9  },
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

/* Floating planes that drift across the screen like shooting stars */
const planes = [
  { size: 10, top: "8%",  left: "-5%",  duration: 18, delay: 0,    opacity: 0.18 },
  { size: 7,  top: "22%", left: "-3%",  duration: 24, delay: 5,    opacity: 0.12 },
  { size: 13, top: "45%", left: "-8%",  duration: 15, delay: 2,    opacity: 0.22 },
  { size: 8,  top: "65%", left: "-4%",  duration: 21, delay: 8,    opacity: 0.15 },
  { size: 11, top: "80%", left: "-6%",  duration: 19, delay: 12,   opacity: 0.18 },
  { size: 6,  top: "15%", left: "-2%",  duration: 28, delay: 16,   opacity: 0.10 },
  { size: 9,  top: "55%", left: "-5%",  duration: 22, delay: 3,    opacity: 0.14 },
  { size: 14, top: "35%", left: "-7%",  duration: 17, delay: 9,    opacity: 0.20 },
];

export default function PlaneBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      {planes.map((p, i) => (
        // eslint-disable-next-line react/forbid-dom-props
        <div
          key={i}
          className="shoot"
          // @ts-expect-error css custom properties
          style={{
            "--shoot-top": p.top,
            "--shoot-left": p.left,
            "--shoot-opacity": p.opacity,
            "--shoot-duration": `${p.duration}s`,
            "--shoot-delay": `${p.delay}s`,
            top: p.top,
            left: p.left,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          <svg
            width={p.size * 2}
            height={p.size * 2}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
        </div>
      ))}
    </div>
  );
}

  { size: 10, top: "8%",  left: "-5%",  duration: 18, delay: 0,    opacity: 0.18 },
  { size: 7,  top: "22%", left: "-3%",  duration: 24, delay: 5,    opacity: 0.12 },
  { size: 13, top: "45%", left: "-8%",  duration: 15, delay: 2,    opacity: 0.22 },
  { size: 8,  top: "65%", left: "-4%",  duration: 21, delay: 8,    opacity: 0.15 },
  { size: 11, top: "80%", left: "-6%",  duration: 19, delay: 12,   opacity: 0.18 },
  { size: 6,  top: "15%", left: "-2%",  duration: 28, delay: 16,   opacity: 0.10 },
  { size: 9,  top: "55%", left: "-5%",  duration: 22, delay: 3,    opacity: 0.14 },
  { size: 14, top: "35%", left: "-7%",  duration: 17, delay: 9,    opacity: 0.20 },
];

export default function PlaneBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden>
      {planes.map((p, i) => (
        <div
          key={i}
          className="shoot"
          style={{
            top: p.top,
            left: p.left,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          <svg
            width={p.size * 2}
            height={p.size * 2}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
        </div>
      ))}
    </div>
  );
}
