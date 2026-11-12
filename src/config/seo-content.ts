// src/config/seo-content.ts v3.18.0
// GEO/SEO 事实文本单一来源：页面可见的「关于 / 格式清单 / FAQ」、JSON-LD 的
// featureList/FAQPage/HowTo、以及 /llms.txt 全部由此派生，避免三处文案互相矛盾。
// 事实变更时同步 src/config/site.ts 的 SITE_LAST_MODIFIED 与 CHANGELOG。
import {
  SITE_URL, GITHUB_URL, CHANGELOG_URL, SITE_LAST_MODIFIED, IN_LANGUAGE,
} from './site';

export const ABOUT_ZH =
  'DNS Shield 是免费、开源的路由器级广告过滤规则生成工具（MIT 许可证）。域名解析、去重、排序与规则生成全部在浏览器本地完成，域名清单不会上传到服务器；支持 16 种界面语言，一键导出 12 种规则格式，可直接部署到梅林固件、OpenWrt、小米路由器、AdGuard Home、Pi-hole 等设备与软件。';

export const ABOUT_EN =
  'DNS Shield is a free, open-source (MIT) router-level ad-blocking rule generator. Parsing and rule generation run entirely in the browser with no uploads. It exports 12 rule formats and offers a 16-language interface.';

/** 12 种导出格式与对应的预生成文件（文件名与 src/config/defaults.json 一致） */
export const OUTPUT_FORMATS = [
  { name: 'Dnsmasq', file: 'dnsmasq.conf', target: '梅林固件 / OpenWrt' },
  { name: 'Hosts', file: 'hosts.txt', target: '系统 hosts 文件' },
  { name: 'AdGuard 黑名单', file: 'adguard.txt', target: 'AdGuard / AdGuard Home' },
  { name: 'AdGuard 白名单', file: 'whitelist.txt', target: '放行误杀域名' },
  { name: '纯域名列表', file: 'domains.txt', target: '单一数据源 / 订阅' },
  { name: 'Unbound', file: 'unbound.conf', target: 'Unbound local-zone' },
  { name: 'Pi-hole', file: 'pihole.txt', target: 'Pi-hole gravity' },
  { name: 'Bind RPZ', file: 'rpz.db', target: 'BIND 响应策略区' },
  { name: 'SmartDNS', file: 'smartdns.conf', target: 'SmartDNS address' },
  { name: 'Mosdns', file: 'mosdns_domain_set.txt', target: 'Mosdns domain-set' },
  { name: 'Clash Meta', file: 'clash_dns.yaml', target: 'Clash Meta DNS ruleset' },
  { name: 'CoreDNS', file: 'coredns_hosts.txt', target: 'CoreDNS hosts 插件' },
] as const;

export const FORMAT_NAMES = OUTPUT_FORMATS.map((f) => f.name);

/** 常见问题：中文为页面可见文本，英文供 /llms.txt 覆盖英文生成式引擎 */
export const FAQ_ITEMS = [
  {
    q: 'DNS Shield 会上传我的域名清单吗？',
    a: '不会。域名解析、去重、排序与规则生成全部在浏览器本地完成（大文本由 Web Worker 并行处理），本站没有接收域名清单的服务端接口。只有主动点击「获取」时，浏览器才会抓取你自己填写的 URL。',
    qEn: 'Does DNS Shield upload my domain list?',
    aEn: 'No. Parsing, deduplication, sorting and rule generation all run locally in the browser (large inputs use Web Workers). The site has no endpoint that receives your domain list.',
  },
  {
    q: '支持哪些路由器和 DNS 软件？',
    a: '支持梅林固件、小米路由器、OpenWrt、AdGuard Home、Pi-hole、Unbound、SmartDNS、Mosdns、Clash Meta、CoreDNS 与 BIND RPZ，共 12 种导出格式：Dnsmasq、Hosts、AdGuard 黑名单、AdGuard 白名单、纯域名列表、Unbound、Pi-hole、Bind RPZ、SmartDNS、Mosdns、Clash Meta、CoreDNS。',
    qEn: 'Which routers and DNS servers are supported?',
    aEn: 'Asuswrt-Merlin, Xiaomi routers, OpenWrt, AdGuard Home, Pi-hole, Unbound, SmartDNS, Mosdns, Clash Meta, CoreDNS and BIND RPZ — 12 export formats in total.',
  },
  {
    q: '是否免费？源码在哪里？',
    a: '完全免费、开源，采用 MIT 许可证。源码与更新日志托管在 GitHub（github.com/sutchan/DNS_Shield），也可以直接在本站生成规则后复制或下载结果，无需注册。',
    qEn: 'Is it free, and where is the source code?',
    aEn: 'Yes. DNS Shield is free and open source under the MIT license. Source code and changelog are published on GitHub; no registration is required.',
  },
  {
    q: '如何输入白名单和自定义 DNS 改道？',
    a: '每行一个域名；# 开头为注释，+example.com 表示白名单放行，@example.com=192.168.1.1 表示自定义 DNS 改道。也支持 hosts / dnsmasq / AdGuard 混合格式粘贴，以及 URL 批量导入。',
    qEn: 'How do I add a whitelist entry or a custom DNS override?',
    aEn: 'One domain per line. Lines starting with # are comments, +domain is a whitelist entry and @domain=ip sets a custom DNS override. Mixed hosts/dnsmasq/AdGuard input and URL imports are supported.',
  },
  {
    q: '预生成的规则文件可以直接订阅吗？',
    a: '可以。/domains.txt 是单一数据源，构建时由它生成 11 个格式的规则文件，例如 /dnsmasq.conf、/adguard.txt、/hosts.txt、/whitelist.txt，可作为订阅 URL 或直接用脚本拉取。',
    qEn: 'Can I subscribe to the pre-generated rule files?',
    aEn: 'Yes. /domains.txt is the single source; 11 format files such as /dnsmasq.conf, /adguard.txt, /hosts.txt and /whitelist.txt are generated at build time and can be used as subscription URLs.',
  },
] as const;

/** 与首屏「快速入门」三步一致的 HowTo 步骤 */
export const HOWTO_STEPS = [
  { name: '输入域名', text: '粘贴或导入广告域名清单，支持混合格式与 URL 批量导入。' },
  { name: '选择格式', text: '从 12 种格式中选择与路由器或 DNS 软件匹配的格式。' },
  { name: '导出部署', text: '复制或下载规则文件，部署到路由器或 DNS 服务后生效。' },
] as const;

/**
 * 生成 /llms.txt：给生成式引擎的站点简报。
 * 采用 llms.txt 约定格式（H1 + blockquote 摘要 + 分节链接列表），中英双语覆盖，
 * 版本号由 APP_VERSION 注入，不会随发版漂移。
 */
export function buildLlmsTxt(version: string): string {
  const formatLinks = OUTPUT_FORMATS.map(
    (f) => `- [${f.name}](${SITE_URL}/${f.file}): ${f.target}`,
  ).join('\n');
  const faqZh = FAQ_ITEMS.map((f) => `### ${f.q}\n${f.a}`).join('\n\n');
  const faqEn = FAQ_ITEMS.map((f) => `### ${f.qEn}\n${f.aEn}`).join('\n\n');
  const steps = HOWTO_STEPS.map((s, i) => `${i + 1}. **${s.name}**：${s.text}`).join('\n');

  return `# DNS Shield

> 免费、开源的路由器级广告过滤规则生成工具：在浏览器本地把域名清单转换为 12 种 DNS / 路由器规则格式，域名清单不上传服务器。Free, open-source router-level ad-blocking rule generator that converts domain lists into 12 rule formats entirely in the browser, without uploading data.

${ABOUT_ZH}

${ABOUT_EN}

- 版本：v${version}（以 package.json 为权威源）
- 许可证：MIT；源码：${GITHUB_URL}
- 界面语言（${IN_LANGUAGE.length} 种，默认简体中文）：${IN_LANGUAGE.join(', ')}；语言在客户端切换，无独立语言 URL
- 事实更新日期：${SITE_LAST_MODIFIED}

## 隐私与数据处理
- 解析、去重、排序、规则生成均在浏览器内完成（大文本走 Web Worker 并行处理）；无域名上传接口、无需注册、无账号体系。
- 输入语法：每行一个域名；\`#\` 注释、\`+domain\` 白名单、\`@domain=ip\` 自定义 DNS 改道；兼容 hosts / dnsmasq / AdGuard 混合格式。

## 预生成规则文件（可直接订阅）
${formatLinks}

## 使用步骤
${steps}

## 常见问题（简体中文）
${faqZh}

## FAQ (English)
${faqEn}

## 关键链接
- [首页 / Web App](${SITE_URL}): 唯一页面，含输入区、输出区、关于与常见问题
- [域名数据源](${SITE_URL}/domains.txt): 黑名单 / 白名单 / 改道的单一数据源
- [站点地图](${SITE_URL}/sitemap.xml)
- [爬虫规则](${SITE_URL}/robots.txt): 明确允许主流 AI / 生成式引擎爬虫
- [源码与许可证](${GITHUB_URL})
- [更新日志](${CHANGELOG_URL})
- [社交分享图](${SITE_URL}/og-image.png)

## 机器可读元数据
- 页面 \`<head>\` 内输出 JSON-LD（schema.org）：Organization / WebSite / SoftwareApplication / FAQPage / HowTo；FAQ 与 HowTo 内容与本页可见文本一致。
- 页面 \`<head>\` 内输出 canonical、Open Graph、Twitter Card、viewport、theme-color 与 robots 指令。
`;
}
