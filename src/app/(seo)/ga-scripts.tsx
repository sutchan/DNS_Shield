// src/app/(seo)/ga-scripts.tsx v3.19.1
// Google Analytics 4（gtag）脚本注入组件：
//   - 衡量 ID 由环境变量 NEXT_PUBLIC_GA_MEASUREMENT_ID 注入，源码不硬编码任何 ID；
//   - 环境变量缺失或格式非法时返回 null，统计整体停用（页面不发起任何 GA 请求）；
//   - 校验与降级逻辑集中在 src/utils/analytics.ts，本组件只负责渲染。
// v3.19.1：原生 <script async> 改 next/script strategy="afterInteractive"，
//   由 Next 在 hydration 后注入，不阻塞 HTML 解析（Lighthouse 渲染阻塞项优化）。
// 归入 (seo) 路由组：与站点元数据同属 <head> 注入类关注点，从 layout.tsx 拆出以保持单一职责。
import Script from 'next/script';
import {
  buildGtagScriptUrl,
  buildGtagSnippet,
  readGaMeasurementIdFromEnv,
} from '../../utils/analytics';

export default function GaScripts() {
  // 仅生产环境注入：开发环境（next dev / 本地预览）不加载跨域 gtag.js，
  // 避免内嵌浏览器/代理环境下 "Script error." 噪音，也防止本地访问污染统计数据。
  if (process.env.NODE_ENV !== 'production') return null;
  const { enabled, measurementId } = readGaMeasurementIdFromEnv();
  if (!enabled || !measurementId) return null;

  return (
    <>
      <Script
        id="ga4-loader"
        src={buildGtagScriptUrl(measurementId)}
        strategy="afterInteractive"
      />
      <Script id="ga4-snippet" strategy="afterInteractive">
        {buildGtagSnippet(measurementId)}
      </Script>
    </>
  );
}
