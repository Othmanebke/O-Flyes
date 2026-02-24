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
      { source: "/api/auth/:path*", destination: `${process.env.NEXT_PUBLIC_API_AUTH || 'http://localhost:3001'}/:path*` },
      { source: "/api/db/:path*", destination: `${process.env.NEXT_PUBLIC_API_DB || 'http://localhost:3002'}/:path*` },
      { source: "/api/ai/:path*", destination: `${process.env.NEXT_PUBLIC_API_AI || 'http://localhost:3003'}/:path*` },
      { source: "/api/notif/:path*", destination: `${process.env.NEXT_PUBLIC_API_NOTIF || 'http://localhost:3004'}/:path*` },
      { source: "/api/payment/:path*", destination: `${process.env.NEXT_PUBLIC_API_PAYMENT || 'http://localhost:3005'}/:path*` },
      { source: "/api/metrics/:path*", destination: `${process.env.NEXT_PUBLIC_API_METRICS || 'http://localhost:3006'}/:path*` },
      { source: "/api/partner/:path*", destination: `${process.env.NEXT_PUBLIC_API_PARTNER || 'http://localhost:3005'}/:path*` },
    ];
  },
};

module.exports = nextConfig;
