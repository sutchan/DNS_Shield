/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,
  env: {
    version: '2.1.0'
  },
  devIndicators: {
    buildActivity: false
  },
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2
  }
}

module.exports = nextConfig