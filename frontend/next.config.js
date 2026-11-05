/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== "production";

// Origine Supabase (API REST + temps réel) autorisée par la CSP
let supabase = "";
try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) supabase = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).host;
} catch {
  /* URL invalide : la CSP n'autorisera simplement pas Supabase */
}

// Content Security Policy : liste blanche des sources que le navigateur a le droit
// de charger. Limite fortement l'impact d'une éventuelle faille XSS.
const csp = [
  "default-src 'self'",
  // 'unsafe-inline' : nécessaire aux scripts d'hydratation de Next sans nonce
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com https://va.vercel-scripts.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self'${supabase ? ` https://${supabase} wss://${supabase}` : ""} https://challenges.cloudflare.com https://va.vercel-scripts.com https://vitals.vercel-insights.com${isDev ? " ws:" : ""}`,
  "frame-src https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // le site ne peut pas être affiché dans une iframe d'un autre site (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // le navigateur ne devine pas le type d'un fichier (MIME sniffing)
  { key: "X-Content-Type-Options", value: "nosniff" },
  // les sites externes ne voient que le domaine d'origine, pas l'URL complète
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // fonctionnalités du navigateur inutiles au site : désactivées
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  // HTTPS obligatoire pendant 2 ans (ignoré en http://localhost)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
];

const nextConfig = {
  // NEXT_DIST_DIR permet de lancer un build de vérification sans toucher au .next
  // utilisé par `npm run dev` (sinon le serveur de dev perd ses fichiers).
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // n'annonce pas « X-Powered-By: Next.js » (information inutile pour un attaquant)
  poweredByHeader: false,
  // le dossier frontend/ est la racine de l'app (le package.json du dessus ne fait que relayer les scripts)
  outputFileTracingRoot: __dirname,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // réponses de l'API : jamais mises en cache par un proxy partagé
      { source: "/api/:path*", headers: [{ key: "Cache-Control", value: "no-store" }] },
    ];
  },
  async redirects() {
    return [{ source: "/pricing", destination: "/", permanent: false }];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

module.exports = nextConfig;
