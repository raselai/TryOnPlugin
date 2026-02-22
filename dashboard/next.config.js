/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787",
    NEXT_PUBLIC_CDN_URL: process.env.NEXT_PUBLIC_CDN_URL || "https://cdn.tryonplugin.com",
  },
};

module.exports = nextConfig;
