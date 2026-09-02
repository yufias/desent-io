import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack ignores stray lockfiles in parent directories.
  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
  },
  images: {
    // Product photography is served from the Monis CMS.
    remotePatterns: [{ protocol: "https", hostname: "strapi.monis.rent", pathname: "/uploads/**" }],
  },
};

export default nextConfig;
