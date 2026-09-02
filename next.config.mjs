/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Dealer photos are local files in public/ — no remote loaders needed.
  images: {
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },

  // The previous static build shipped .html URLs; keep those links alive.
  async redirects() {
    return ["privacy-policy", "terms-of-service", "sms-disclosure"].map((slug) => ({
      source: `/${slug}.html`,
      destination: `/${slug}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
