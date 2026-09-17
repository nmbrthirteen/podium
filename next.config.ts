import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['pdfjs-dist', '@libsql/client'],
  agentRules: false,
};

export default nextConfig;
