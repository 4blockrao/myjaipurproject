import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This app is its own workspace root (a sibling Vite app + lockfile live one level up).
  turbopack: { root: __dirname },

  // Preserve the legacy 308 redirects the live site serves for old locality URLs.
  async redirects() {
    return [
      { source: "/localities/:slug", destination: "/jaipur/:slug", permanent: true },
      { source: "/localities", destination: "/jaipur", permanent: true },
      { source: "/locality/:slug", destination: "/jaipur/:slug", permanent: true },
      { source: "/locality", destination: "/jaipur", permanent: true },
    ];
  },
};

export default nextConfig;
