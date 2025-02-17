import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/event-ops",
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
