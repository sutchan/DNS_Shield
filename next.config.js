/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,
  publicRuntimeConfig: {
    version: '1.1.1'
  }
}

module.exports = nextConfig