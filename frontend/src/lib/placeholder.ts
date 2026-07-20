const PLACEHOLDER_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#141822"/>
      <stop offset="100%" stop-color="#0A0D14"/>
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#g)"/>
  <g transform="translate(200,124) rotate(-45)">
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.9.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"
      fill="none" stroke="#C9A84C" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"
      transform="translate(-16,-16) scale(2.6)"/>
  </g>
  <text x="200" y="186" font-family="Georgia, 'Times New Roman', serif" font-size="24" letter-spacing="2" fill="#C9A84C" text-anchor="middle" font-style="italic">AIVANA</text>
</svg>`.trim();

export const AIVANA_PLACEHOLDER_IMG = `data:image/svg+xml,${encodeURIComponent(PLACEHOLDER_SVG)}`;

export function withAivanaFallback(e: React.SyntheticEvent<HTMLImageElement, Event>) {
  const img = e.currentTarget;
  if (img.src !== AIVANA_PLACEHOLDER_IMG) {
    img.onerror = null;
    img.src = AIVANA_PLACEHOLDER_IMG;
  }
}
