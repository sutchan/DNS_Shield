// src/config/fetchHosts.ts v3.22.4
// 客户端出站 host 白名单（T-AUD-M02）：与 next.config.js / edgeone.json 的
// CSP connect-src 同源枚举。默认覆盖全部预设镜像；环境变量提供自定义预设时
// 自动把其 host 加入会话级白名单，避免合法部署因收紧 CSP 而失效。
const hostOf = (url: string | undefined): string | null => {
  if (!url) return null;
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return null;
  }
};

const DEFAULT_HOSTS = [
  'raw.githubusercontent.com',
  'cdn.jsdelivr.net',
  'easylist-downloads.adblockplus.org',
];

const envHosts = [
  process.env.NEXT_PUBLIC_DOMAINS_URL,
  process.env.NEXT_PUBLIC_PRESET_BUILTIN,
  process.env.NEXT_PUBLIC_PRESET_ADGUARD,
  process.env.NEXT_PUBLIC_PRESET_EASYLIST,
  process.env.NEXT_PUBLIC_PRESET_NEOHOSTS,
].map(hostOf).filter((h): h is string => h !== null);

export const ALLOWED_FETCH_HOSTS: ReadonlySet<string> = new Set([...DEFAULT_HOSTS, ...envHosts]);
