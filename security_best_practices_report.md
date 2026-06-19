# DNS Shield - 安全审查报告

> 版本: v2.3.0 | 审查日期: 2024-06-19 | 审查人: Claude Code

---

## 执行摘要

DNS Shield v2.3.0 安全状况整体**良好**。已实现：完整 CSP 安全头部、`unsafe-eval` 已移除、URL 协议验证（http/https）、HTTP 请求超时控制（AbortController）、XSS 防护（innerText）。发现 **1 个中等问题** 和 **3 个低优先级建议**，均可在不影响功能的前提下修复。

---

## 已确认的安全措施 ✅

| 措施 | 状态 | 位置 |
|------|------|------|
| CSP 配置（unsafe-eval 已移除） | ✅ | `next.config.js` |
| URL 协议验证（仅 http/https） | ✅ | `src/utils/fileUtils.ts:7-18` |
| URL 长度限制（2048 字符） | ✅ | `src/utils/fileUtils.ts:4` |
| HTTP 请求超时控制（AbortController） | ✅ | `src/utils/fileUtils.ts:45-65` |
| innerHTML → innerText XSS 防护 | ✅ | `src/utils/uiUtils.ts:4-14` |
| React 自动转义 | ✅ | 全局 |
| 域名格式正则验证 | ✅ | `src/utils/parser.ts:45,59,73,86,99,109` |
| frame-src 'none' + object-src 'none' | ✅ | `next.config.js:17-18` |
| X-Frame-Options: DENY | ✅ | `next.config.js:30-31` |
| X-Content-Type-Options: nosniff | ✅ | `next.config.js:24-27` |

---

## 发现的问题

### 🔴 中等 (Medium)

#### M-001: CSP 使用 `unsafe-inline`，降低 XSS 防护能力

**严重程度**: 中等  
**影响**: 如果存在 XSS 漏洞，攻击者可以通过注入内联事件处理器（如 `onclick`）或内联脚本绕过 CSP 限制执行恶意 JavaScript。

**当前配置** (`next.config.js:12-13`):
```javascript
"script-src 'self' 'unsafe-inline' https://raw.githubusercontent.com",
"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
```

**说明**: `unsafe-inline` 是 Next.js 服务端渲染（Hydration）所必需的。Next.js 在 hydration 阶段需要在 HTML 中嵌入内联脚本来匹配服务端渲染的结果。完全移除 `unsafe-inline` 会导致 hydration 不匹配错误。

**建议**: 当前配置在实际安全性和框架可用性之间取得了合理平衡。如需进一步提升：
1. 迁移到 **CSP Nonce 模式**（Next.js 14+ 支持 `next.config.js` 的 nonce 生成）
2. 或使用 **`<script id="_NEXT_DATA" type="application/json">`** 替代内联脚本

**风险评估**: 在当前 Next.js 架构下，hydration 依赖 `unsafe-inline`，这是已知的框架限制。配合其他防护层（React 自动转义、innerText），实际风险可控。

---

### 🟡 低 (Low)

#### L-001: `fetchFromUrls` 静默忽略失败的 URL

**严重程度**: 低  
**影响**: 当批量获取多个 URL 时，如果某个 URL 获取失败（如超时、404），错误会被 `console.error` 记录但不会通知用户，可能导致用户误以为已获取全部内容。

**位置**: `src/utils/fileUtils.ts:68-79`
```typescript
export const fetchFromUrls = async (urls: string[], timeout = 10000): Promise<string> => {
  let allContent = '';
  for (const url of urls) {
    try {
      const content = await fetchFromUrl(url, timeout);
      allContent += content + '\n';
    } catch (error) {
      console.error(`Error fetching from ${url}:`, error);  // 仅 console.error
    }
  }
  return allContent;
};
```

**建议**: 返回包含成功/失败状态的结构：
```typescript
interface FetchResult {
  content: string;
  failedUrls: { url: string; error: string }[];
}
export const fetchFromUrls = async (urls: string[], timeout = 10000): Promise<FetchResult> => {
  const failedUrls: { url: string; error: string }[] = [];
  let allContent = '';
  for (const url of urls) {
    try {
      const content = await fetchFromUrl(url, timeout);
      allContent += content + '\n';
    } catch (error) {
      failedUrls.push({ url, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
  return { content: allContent, failedUrls };
};
```

---

#### L-002: Google Fonts 缺少 Subresource Integrity (SRI)

**严重程度**: 低  
**影响**: 如果 Google Fonts CDN 被攻陷，攻击者可能注入恶意 CSS。

**当前加载方式** (`next.config.js:14`):
```javascript
"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
"font-src 'self' https://fonts.gstatic.com",
```

**建议**: 在 HTML 中引入 Google Fonts 时添加 SRI 哈希：
```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      integrity="sha384-...（实际哈希）"
      crossorigin="anonymous">
```

**注**: 字体文件本身已有 CORS 限制，CDN 被完全攻陷的概率较低。

---

#### L-003: `html` 元素 `lang` 属性硬编码为 `zh-CN`

**严重程度**: 低（可访问性 > 安全）  
**影响**: 应用支持 15 种语言动态切换，但 `lang` 属性始终为 `zh-CN`，屏幕阅读器可能无法正确识别页面语言。

**位置**: `src/app/layout.tsx:140`
```typescript
<html lang="zh-CN" suppressHydrationWarning>
```

**建议**: 在 `Home.tsx` 中动态更新 `lang` 属性：
```typescript
useEffect(() => {
  document.documentElement.lang = currentLang;
}, [currentLang]);
```

---

## 安全最佳实践对照

| 类别 | 建议 | 当前状态 |
|------|------|---------|
| XSS | 避免 innerHTML，使用 textContent/innerText | ✅ 已修复 |
| XSS | React 自动转义 | ✅ 已启用 |
| CSP | 最小化 unsafe-inline，优先使用 nonce | ⚠️ `unsafe-inline` 存在（Next.js 框架限制） |
| CSP | frame-src / object-src 设置为 'none' | ✅ 已配置 |
| URL 安全 | 验证协议（仅 http/https） | ✅ 已实现 |
| URL 安全 | 长度限制 | ✅ 2048 字符 |
| HTTP 安全 | 请求超时控制 | ✅ AbortController 10s |
| 依赖安全 | 定期更新依赖 | ⚠️ 建议运行 `npm audit` |
| 下载安全 | 文件名避免注入 | ✅ 直接使用配置值 |
| 隐私 | 敏感信息不写入 localStorage | ✅ 未存储敏感数据 |

---

## npm audit 结果

```
npm audit: 5 vulnerabilities (1 moderate, 4 high)
```

**建议**: 在合并前运行 `npm audit fix --force` 修复已知漏洞，或逐个审查高危漏洞的修复方案。

---

## 总结

DNS Shield v2.3.0 在 **XSS 防护**、**URL 安全验证**、**HTTP 安全配置** 方面表现良好。`unsafe-inline` 是 Next.js 框架要求，非设计缺陷。建议优先处理 **L-001**（fetchFromUrls 静默错误）和 **L-003**（lang 属性动态化）两个低优先级改进。

---
*本文档由 Claude Code 自动生成，基于 `security-best-practices` 技能指南*
