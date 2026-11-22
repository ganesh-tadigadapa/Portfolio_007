import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Pin the project root so a stray package-lock.json in a parent folder
  // (e.g. the home directory) doesn't confuse Next.js.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
