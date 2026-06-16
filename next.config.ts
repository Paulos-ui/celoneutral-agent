import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // wagmi/walletconnect pull in optional native deps that are safe to externalize
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
};

export default nextConfig;
