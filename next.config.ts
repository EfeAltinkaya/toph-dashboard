import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Marketing photos are served from Unsplash's CDN and resized by the
    // Next image optimizer. The pattern pins both the host and the exact
    // query string, so the optimizer can't be pointed at arbitrary URLs —
    // omitting `search` would let anyone use this deployment to resize any
    // image on that host.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
        // Must match PHOTO_QUERY in src/lib/photos.ts. Duplicated because
        // Next compiles this file on its own and can't import from src/.
        search: "?auto=format&fit=crop&w=2400&q=80",
      },
    ],
  },
};

export default nextConfig;
