import type { NextConfig } from 'next';

// The site ships as plain files (GitHub Pages), so every build is an export.
const nextConfig: NextConfig = { output: 'export' };

export default nextConfig;
