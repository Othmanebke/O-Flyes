/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  async rewrites() {
    return [
      { source: "/api/auth/:path*", destination: `${process.env.NEXT_PUBLIC_API_AUTH}/:path*` },
      { source: "/api/db/:path*", destination: `${process.env.NEXT_PUBLIC_API_DB}/:path*` },
      { source: "/api/ai/:path*", destination: `${process.env.NEXT_PUBLIC_API_AI}/:path*` },
      { source: "/api/notif/:path*", destination: `${process.env.NEXT_PUBLIC_API_NOTIF}/:path*` },
      { source: "/api/payment/:path*", destination: `${process.env.NEXT_PUBLIC_API_PAYMENT}/:path*` },
      { source: "/api/metrics/:path*", destination: `${process.env.NEXT_PUBLIC_API_METRICS || 'http://localhost:3006'}/:path*` },
      { source: "/api/partner/:path*", destination: `${process.env.NEXT_PUBLIC_API_PARTNER || 'http://localhost:3005'}/:path*` },
    ];
  },
};

module.exports = nextConfig;
