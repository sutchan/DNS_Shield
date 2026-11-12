// src/app/llms.txt/route.ts v3.18.0
// llms.txt：给生成式引擎（LLM 检索 / 引用）读的站点简报，位于站点根路径约定位置。
// 采用 App Router Route Handler 而非 public/ 静态文件：构建产物落在 .next/ 内，
// 可同时覆盖 Vercel 与 EdgeOne（后者部署工作流只上传 .next/）两条发布路径。
// force-static 保证构建期预渲染为纯文本，不依赖运行时 Node 处理器。
import { buildLlmsTxt } from '../../config/seo-content';
import { APP_VERSION } from '../../config/version';

export const dynamic = 'force-static';

export function GET(): Response {
  return new Response(buildLlmsTxt(APP_VERSION), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400',
    },
  });
}
