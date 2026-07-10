/** @type {import('next').NextConfig} */
const nextConfig = {
  // The @listgrid/* workspace packages ship TS/TSX source (main → src/index.ts),
  // so Next must transpile them rather than treating them as prebuilt deps.
  transpilePackages: [
    '@listgrid/schema-core',
    '@listgrid/state',
    '@listgrid/react',
    '@listgrid/ui-default',
    '@listgrid/backend-rcm',
    '@listgrid/next',
  ],
};

export default nextConfig;
