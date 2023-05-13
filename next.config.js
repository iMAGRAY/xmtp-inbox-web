/** @type {import('next').NextConfig} */

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  // Add runtime caching with network-first strategy
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "https-calls",
        networkTimeoutSeconds: 15,
        expiration: {
          maxEntries: 150,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 1 month
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
});

const nextConfig = withPWA({
  // Not setting reactStrictMode here due to issues with modal compatibility, but rest of app is wrapped in strict mode.
  images: {
    loader: "akamai",
    path: "",
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Fixes npm packages that depend on `fs` module
      // https://github.com/vercel/next.js/issues/7755#issuecomment-937721514
      config.resolve.fallback.fs = false;
    }
    // Define the main fields to be used for module resolution.
    // This can help in cases where certain modules have different entry points defined in their package.json
    config.resolve.mainFields = ["browser", "main", "module"];
    return config;
  },
});

module.exports = nextConfig;
