import type { NextConfig } from "next";
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

const nextConfig: NextConfig = {
  /* config options here */
};

console.info("process.env.NODE_ENV");
console.info(process.env.NODE_ENV);
console.info(process.env.NODE_ENV);
console.info(process.env.NODE_ENV);
if (process.env.NODE_ENV === "development") {
  // allow you to access CF bindings in local development.
  (async () => {
    await setupDevPlatform();
  })();
}

export default nextConfig;
