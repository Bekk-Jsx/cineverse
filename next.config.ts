import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['graphql-ws', 'ws'],
};

export default nextConfig;