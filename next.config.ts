import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['graphql-ws', 'ws'],
};

export default nextConfig;