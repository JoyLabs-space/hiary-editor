import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",          // static export 활성화 → out/ 생성
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
