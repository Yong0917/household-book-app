import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
};

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  reactStrictMode: true,
});

export default nextConfig;
