# Dockerfile
# ---------------------------------------------------------------------------
# DNS Shield Web 管理工具 —— 生产镜像
#
# 多阶段构建：deps → build → runner
#   deps   : 仅依据锁定文件安装依赖，最大化 Docker 层缓存命中率
#   build  : 执行 pnpm build 产出 .next
#   runner : 只带运行时必需内容，不含 devDependencies 与源码中间产物
#
# 说明：
#   - 项目通过 pnpm 管理（pnpm-lock.yaml），用 corepack 激活 package.json 中
#     packageManager 指定的版本，避免全局 npm i -g pnpm 造成版本漂移。
#   - next.config.js 未启用 output: 'standalone'，因此 runner 保留完整
#     node_modules（生产依赖），并由 next start 启动。
#   - 启动命令直接使用 next 的 bin，运行期不依赖 pnpm，避免容器启动时
#     corepack 再次联网下载。
# ---------------------------------------------------------------------------
# syntax=docker/dockerfile:1

ARG NODE_VERSION=24-alpine

# ------------------------------------------------------------------ base
FROM node:${NODE_VERSION} AS base
ENV NEXT_TELEMETRY_DISABLED=1 \
    PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

# ------------------------------------------------------------------ deps
FROM base AS deps
WORKDIR /app
# 只复制依赖清单，源码变更不会击穿这一层
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile

# ----------------------------------------------------------------- build
FROM base AS build
WORKDIR /app
# NEXT_PUBLIC_* 变量在构建期内联进产物，必须在此声明为构建参数
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID=""
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm run build

# ---------------------------------------------------------------- runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY package.json next.config.js ./

EXPOSE 3000

# 以非 root 运行
RUN chown -R node:node /app
USER node

CMD ["node", "node_modules/next/dist/bin/next", "start"]
