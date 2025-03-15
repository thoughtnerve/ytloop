/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  experimental: {
    turbo: {
      // Turbo-specific configurations
      resolveAlias: {
        // Add any module aliases if needed
      },
    },
  },
}

module.exports = nextConfig 