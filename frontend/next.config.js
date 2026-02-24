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
      { source: "/api/auth/:path*", destination: `${process.env.NEXT_PUBLIC_API_AUTH || 'https://auth-service-8x7w.onrender.com'}/auth/:path*` },
      { source: "/api/db/:path*", destination: `${process.env.NEXT_PUBLIC_API_DB || 'https://database-service-uybo.onrender.com'}/:path*` },
      { source: "/api/ai/:path*", destination: `${process.env.NEXT_PUBLIC_API_AI || 'https://ai-service-qfvv.onrender.com'}/:path*` },
      { source: "/api/notif/:path*", destination: `${process.env.NEXT_PUBLIC_API_NOTIF || 'https://notifications-service-mefp.onrender.com'}/:path*` },
      { source: "/api/payment/:path*", destination: `${process.env.NEXT_PUBLIC_API_PAYMENT || 'https://payments-service-i3as.onrender.com'}/:path*` },
      { source: "/api/metrics/:path*", destination: `${process.env.NEXT_PUBLIC_API_METRICS || 'https://metrics-service-oflyes.onrender.com'}/:path*` },
      { source: "/api/partner/:path*", destination: `${process.env.NEXT_PUBLIC_API_PARTNER || 'https://partner-service-wixv.onrender.com'}/:path*` },
    ];
  },
};

module.exports = nextConfig;
