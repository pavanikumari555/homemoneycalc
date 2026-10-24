/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export -> pure HTML/CSS/JS. No server needed. Deploy free on Cloudflare Pages.
  output: 'export',

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
