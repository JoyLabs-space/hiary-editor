import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",          // static export 활성화 → out/ 생성
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: "/editor",
  assetPrefix: "/editor/",
};

export default nextConfig;
