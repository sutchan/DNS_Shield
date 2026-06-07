# DNS Shield 全局包使用说明

## 概述

本文档介绍如何使用全局包的方式运行 DNS Shield 项目，避免在项目目录中创建 `node_modules`、`node_modules\.pnpm` 和 `.next/cache` 等目录。

## 步骤一：全局安装依赖

首先，需要全局安装项目所需的所有依赖包：

```bash
# 使用 npm 全局安装
npm run global:install

# 或使用 pnpm 全局安装
pnpm add -g next react react-dom @babel/preset-env @babel/preset-react @babel/preset-typescript @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/jest @types/node @types/react @types/react-dom autoprefixer babel-jest eslint eslint-config-next identity-obj-proxy jest jest-environment-jsdom postcss tailwindcss ts-jest typescript
```

## 步骤二：使用全局包运行项目

### 开发模式

```bash
# 使用 npm
npm run global:dev

# 或使用 pnpm
pnpm run global:dev
```

### 构建项目

```bash
# 使用 npm
npm run global:build

# 或使用 pnpm
pnpm run global:build
```

### 启动生产服务器

```bash
# 使用 npm
npm run global:start

# 或使用 pnpm
pnpm run global:start
```

### 代码检查

```bash
# 使用 npm
npm run global:lint

# 或使用 pnpm
pnpm run global:lint
```

### 运行测试

```bash
# 使用 npm
npm run global:test

# 或使用 pnpm
pnpm run global:test
```

## 缓存目录

项目的缓存文件和构建输出会存储在用户主目录下的 `.dns-shield` 文件夹中：

- 缓存目录：`~/.dns-shield/cache`
- 构建输出目录：`~/.dns-shield/dist`

这样可以避免在项目目录中创建这些文件夹，保持项目目录的干净整洁。

## 注意事项

1. 确保全局安装的依赖版本与项目 `package.json` 中指定的版本一致
2. 如果遇到依赖冲突，可以尝试更新全局依赖或使用 `npm ls -g` 检查全局依赖状态
3. 对于不同的项目，可能需要使用不同版本的依赖，这种情况下全局安装可能不是最佳选择
4. 如果需要在多个项目之间切换，建议使用 nvm 或类似工具管理 Node.js 版本

## 传统方式运行

如果需要使用传统方式运行项目（在项目目录中创建 node_modules），仍然可以使用以下命令：

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建项目
npm run build

# 启动生产服务器
npm run start
```