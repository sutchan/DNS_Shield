// src/app/(seo)/ga-scripts.tsx v3.10.3
// Google Analytics 4（gtag）脚本注入组件：
//   - 衡量 ID 由环境变量 NEXT_PUBLIC_GA_MEASUREMENT_ID 注入，源码不硬编码任何 ID；
//   - 环境变量缺失或格式非法时返回 null，统计整体停用（页面不发起任何 GA 请求）；
//   - 校验与降级逻辑集中在 src/utils/analytics.ts，本组件只负责渲染。
// 归入 (seo) 路由组：与站点元数据同属 <head> 注入类关注点，从 layout.tsx 拆出以保持单一职责。
import {
  buildGtagScriptUrl,
  buildGtagSnippet,
  readGaMeasurementIdFromEnv,
} from '../../utils/analytics';

export default function GaScripts() {
  const { enabled, measurementId } = readGaMeasurementIdFromEnv();
  if (!enabled || !measurementId) return null;

  return (
    <>
      <script async src={buildGtagScriptUrl(measurementId)} />
      <script dangerouslySetInnerHTML={{ __html: buildGtagSnippet(measurementId) }} />
    </>
  );
}
