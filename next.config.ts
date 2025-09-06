import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["images.unsplash.com","img.clerk.com","res.cloudinary.com", "images.clerk.dev","www.gravatar.com"]
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  // Disable telemetry
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Output configuration for better compatibility
  output: undefined, // Ensure we don't accidentally set static export
  trailingSlash: false,
  poweredByHeader: false,
};

export default nextConfig;
