/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,
  env: {
    version: '1.1.1'
  }
}

module.exports = nextConfig