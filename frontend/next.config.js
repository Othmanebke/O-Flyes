/** @type {import('next').NextConfig} */
const nextConfig = {
  // NEXT_DIST_DIR permet de lancer un build de vérification sans toucher au .next
  // utilisé par `npm run dev` (sinon le serveur de dev perd ses fichiers).
  distDir: process.env.NEXT_DIST_DIR || ".next",
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
