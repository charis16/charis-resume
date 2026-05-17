import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdfkit"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/resume/**",
      },
      {
        protocol: "https",
        hostname: "**.storage.supabase.co",
        pathname: "/storage/v1/object/public/resume/**",
      },
    ],
  },
};

export default nextConfig;
