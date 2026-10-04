/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs'],
  },
  images: {
    domains: ['localhost', 'via.placeholder.com', 'picsum.photos'],
  },
}

module.exports = nextConfig
