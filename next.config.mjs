/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'vip_store_secret_2026_super_secure_key_min32chars',
  },
  experimental: {
    outputFileTracingIncludes: {
      '/**': ['./prisma/dev.db'],
    },
  },
};

export default nextConfig;
