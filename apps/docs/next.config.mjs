import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  output: 'export',
  trailingSlash: true, // Firebase Hosting serves /route/index.html cleanly
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default withMDX(config);
