/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export -> pure HTML/CSS/JS. No server needed. Deploy free on Cloudflare Pages.
  output: 'export',

  // Release queue ki date build ke waqt fix (lib/site.ts BUILD_DATE). Server + browser dono me same.
  env: {
    BUILD_DATE: process.env.BUILD_DATE || new Date().toISOString().slice(0, 10),
  },

  // Every route becomes /route/index.html -> clean URLs, works on any static host.
  trailingSlash: true,

  // next/image optimization needs a server; static export can't use it. Unoptimized = plain <img>.
  images: {
    unoptimized: true,
  },

  // Fail the build on TS errors so we never ship broken pages (lint runs separately: npm run lint).
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
