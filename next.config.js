/** @type {import('next').NextConfig} */
const os = require('os');
const path = require('path');

// 获取用户主目录，用于存储全局缓存
const homeDir = os.homedir();
const globalCacheDir = path.join(homeDir, '.dns-shield', 'cache');
const globalDistDir = path.join(homeDir, '.dns-shield', 'dist');

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  trailingSlash: true,
  env: {
    version: '2.2.2'
  },
  devIndicators: {
    buildActivity: false
  },
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2
  },
  // 配置构建输出目录到全局位置
  distDir: globalDistDir,
  // 配置缓存目录到全局位置
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (dev) {
      // 在开发模式下配置缓存
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        cacheDirectory: path.join(globalCacheDir, 'webpack'),
      };
    }
    return config;
  }
}

module.exports = nextConfig