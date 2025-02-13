import type { NextConfig } from "next";
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

const nextConfig: NextConfig = {
  /* config options here */
};

if (process.env.NODE_ENV === "development") {
  // allow you to access CF bindings in local development.
  await setupDevPlatform();
}

export default nextConfig;
