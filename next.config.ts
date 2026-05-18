import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.18.9"],
  turbopack: {
    resolveAlias: {
      accounts: "./stubs/accounts.js",
    },
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      accounts: path.resolve("stubs/accounts.js"),
    };
    return config;
  },
};

export default nextConfig;
