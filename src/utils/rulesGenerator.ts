// src/utils/rulesGenerator.ts v3.7.42
import { CustomDnsEntry, Settings, OutputContent, Translation, FormatType } from '../types';

// 各格式的头部展示配置：注释符、分隔符、标题、描述与用法说明。
// domains/bind 等纯域或 RPZ 格式也复用注释符输出头部元信息。
const HEADER_CONFIGS: Record<
  FormatType,
  { commentChar: string; separator: string; title: string; description: string; usage: string }
> = {
  dnsmasq: {
    commentChar: '#',
    separator: '=====================================',
    title: 'header.dnsmasqTitle',
    description: 'header.dnsmasqDescription',
    usage: 'header.merlinUsage'
  },
  hosts: {
    commentChar: '#',
    separator: '=====================================',
    title: 'header.hostsTitle',
    description: 'header.hostsDescription',
    usage: 'header.hostsUsage'
  },
  adguard: {
    commentChar: '!',
    separator: '====================================',
    title: 'header.adguardTitle',
    description: 'header.adguardDescription',
    usage: ''
  },
  unbound: {
    commentChar: '#',
    separator: '=====================================',
    title: 'header.unboundTitle',
    description: 'header.unboundDescription',
    usage: 'header.unboundUsage'
  },
  pihole: {
    commentChar: '#',
    separator: '=====================================',
    title: 'header.piholeTitle',
    description: 'header.piholeDescription',
    usage: 'header.piholeUsage'
  },
  domains: {
    commentChar: '#',
    separator: '=====================================',
    title: 'header.domainsTitle',
    description: 'header.domainsDescription',
    usage: 'header.domainsUsage'
  },
  bind: {
    commentChar: ';',
    separator: '=====================================',
    title: 'header.bindTitle',
    description: 'header.bindDescription',
    usage: 'header.bindUsage'
  },
  smartdns: {
    commentChar: '#',
    separator: '=====================================',
    title: 'header.smartdnsTitle',
    description: 'header.smartdnsDescription',
    usage: 'header.smartdnsUsage'
  },
  // 白名单为独立导出，复用 hosts 头部样式（# 注释）。
  whitelist: {
    commentChar: '#',
    separator: '=====================================',
    title: 'whitelist.title',
    description: 'whitelist.label',
    usage: ''
  }
};

// 生成头部
export const generateHeader = (
  formatType: FormatType,
  totalDomains: number,
  whitelistCount: number,
  dateStr: string,
  settings: Settings,
  t: Translation
): string => {
  // 通过 i18n 键路径取值（支持 header.* 与 whitelist.*）
  const resolve = (path: string): string => {
    const [group, key] = path.split('.');
    const obj = (t as unknown as Record<string, Record<string, string>>)[group];
    return obj?.[key] ?? '';
  };

  const cfg = HEADER_CONFIGS[formatType];
  if (!cfg) return '';

  const commentChar = cfg.commentChar;
  const separator = cfg.separator;
  const title = resolve(cfg.title);
  const description = resolve(cfg.description);
  // 顶层 format 的用法说明聚合了 merlin/openwrt 等；whitelist 等无聚合用法。
  const extraUsage =
    formatType === 'dnsmasq'
      ? `${t.header.usage}\n${t.header.merlinUsage}\n${t.header.openwrtUsage}`
      : cfg.usage;

  const lines: string[] = [];
  lines.push(`${commentChar} ${separator}`);
  lines.push(`${commentChar} ${settings.projectName} - ${title}`);
  lines.push(`${commentChar} ${separator}`);
  lines.push(`${commentChar}`);
  lines.push(`${commentChar} ${description}`);
  lines.push(`${commentChar}`);
  lines.push(`${commentChar} ${t.header.version}: ${settings.version}`);
  lines.push(`${commentChar} ${t.header.update}: ${dateStr}`);
  lines.push(`${commentChar} ${t.header.domains}: ${totalDomains} ${t.header.uniqueDomains}`);
  if (whitelistCount > 0) {
    lines.push(`${commentChar} ${t.header.whitelist}: ${whitelistCount} ${t.header.domainsCount}`);
  }
  lines.push(`${commentChar}`);
  if (extraUsage) {
    lines.push(extraUsage);
    lines.push(`${commentChar}`);
  }
  lines.push(`${commentChar} ${t.header.project} https://github.com/sutchan/DNS_Shield`);
  lines.push(`${commentChar} ${t.header.demo} https://dns.ewuse.com/`);
  lines.push(`${commentChar}`);
  lines.push(`${commentChar} ${separator}`);

  return lines.join('\n') + '\n\n';
};

// 生成规则
export const generateRules = (
  domains: string[],
  whitelist: string[],
  customDns: CustomDnsEntry[],
  settings: Settings,
  t: Translation
): OutputContent => {
  const { addHeader, blockIPv6, dedupDomains, removeWildcard } = settings;

  let filteredDomains = [...domains];
  if (removeWildcard) {
    filteredDomains = filteredDomains.map(d => d.replace(/^\*\./, ''));
  }
  if (dedupDomains) {
    filteredDomains = [...new Set(filteredDomains)].sort();
  }

  let filteredWhitelist = [...whitelist];
  if (removeWildcard) {
    filteredWhitelist = filteredWhitelist.map(d => d.replace(/^\*\./, ''));
  }
  if (dedupDomains) {
    filteredWhitelist = [...new Set(filteredWhitelist)].sort();
  }

  // 黑名单生成时必须剔除白名单域名：dnsmasq 的 address=/domain/IP 黑洞规则
  // 无法被后续 server=/domain/ 可靠覆盖，hosts 也无白名单语义，因此直接从拦截
  // 列表中排除白名单域名，使白名单在 dnsmasq/hosts 格式下真正生效（而非仅注释）。
  const whitelistSet = new Set(filteredWhitelist);
  const blockedDomains = filteredDomains.filter(domain => !whitelistSet.has(domain));

  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

  let dnsmasqContent = '';
  let hostsContent = '';
  let adguardContent = '';
  let whitelistContent = '';
  let unboundContent = '';
  let piholeContent = '';
  let domainsContent = '';
  let bindContent = '';
  let smartdnsContent = '';

  if (addHeader) {
    const totalDomains = blockedDomains.length + customDns.length;
    const whitelistCount = filteredWhitelist.length;

    dnsmasqContent += generateHeader('dnsmasq', totalDomains, whitelistCount, dateStr, settings, t);
    hostsContent += generateHeader('hosts', totalDomains, whitelistCount, dateStr, settings, t);
    adguardContent += generateHeader('adguard', totalDomains, whitelistCount, dateStr, settings, t);
    unboundContent += generateHeader('unbound', totalDomains, whitelistCount, dateStr, settings, t);
    piholeContent += generateHeader('pihole', totalDomains, whitelistCount, dateStr, settings, t);
    domainsContent += generateHeader('domains', totalDomains, whitelistCount, dateStr, settings, t);
    bindContent += generateHeader('bind', totalDomains, whitelistCount, dateStr, settings, t);
    smartdnsContent += generateHeader('smartdns', totalDomains, whitelistCount, dateStr, settings, t);
  }

  // 各格式黑名单规则生成
  blockedDomains.forEach(domain => {
    dnsmasqContent += `address=/${domain}/${settings.ipv4}\n`;
    hostsContent += `${settings.ipv4} ${domain}\n`;
    adguardContent += `||${domain}^\n`;
    // Unbound: refuse 同时拒绝 A 与 AAAA（协议无关），无需单独处理 IPv6。
    unboundContent += `local-zone: "${domain}" refuse\n`;
    // Pi-hole (gravity 兼容格式)：0.0.0.0 domain
    piholeContent += `0.0.0.0 ${domain}\n`;
    // 纯域名列表
    domainsContent += `${domain}\n`;
    // Bind RPZ：将域名与其子域均 CNAME 到根（.）实现拦截
    bindContent += `${domain} CNAME .\n`;
    bindContent += `*.${domain} CNAME .\n`;
    // SmartDNS：address /domain/# 返回空地址（等效拦截）
    smartdnsContent += `address /${domain}/#\n`;

    if (blockIPv6) {
      dnsmasqContent += `address=/${domain}/${settings.ipv6}\n`;
      hostsContent += `${settings.ipv6} ${domain}\n`;
    }
  });

  customDns.forEach((item: CustomDnsEntry) => {
    dnsmasqContent += `address=/${item.domain}/${item.ip}\n`;
    hostsContent += `${item.ip} ${item.domain}\n`;
    adguardContent += `||${item.domain}^\n`;
    // Pi-hole 自定义解析：ip domain
    piholeContent += `${item.ip} ${item.domain}\n`;
    // SmartDNS 自定义上游：server /domain/ip
    smartdnsContent += `server /${item.domain}/${item.ip}\n`;
  });

  if (filteredWhitelist.length > 0) {
    if (addHeader) {
      dnsmasqContent += `\n# ${t.whitelist.title}\n`;
      // hosts 原生不支持白名单语法：注明限制，但逐行列出已排除的域名供参考
      hostsContent += `\n# ${t.whitelist.title}\n`;
      hostsContent += `# ${t.whitelist.hostsNote ?? ''}\n`;
      if (settings.adguardIncludeWhitelist) {
        adguardContent += `\n! ${t.whitelist.title}\n`;
      }
      whitelistContent += `# ${t.whitelist.title}\n`;
      unboundContent += `\n# ${t.whitelist.title}\n`;
      domainsContent += `\n# ${t.whitelist.title}\n`;
      smartdnsContent += `\n# ${t.whitelist.title}\n`;
    }
    filteredWhitelist.forEach(domain => {
      dnsmasqContent += `server=/${domain}/\n`;
      hostsContent += `# ${t.whitelist.label} ${domain}\n`;
      // ADGuard 黑名单是否附带白名单豁免规则由开关控制：关闭时仅生成拦截规则，
      // 保留纯黑名单语义（白名单仍可在独立“ADGuard 白名单”清单中单独导出）。
      if (settings.adguardIncludeWhitelist) {
        adguardContent += `@@||${domain}^\n`;
      }
      whitelistContent += `@@||${domain}^\n`;
      // Unbound 白名单：transparent 恢复常规解析
      unboundContent += `local-zone: "${domain}" transparent\n`;
      // 纯域名与 RPZ 列表无白名单语义：仅以注释形式标注已豁免
      domainsContent += `# ${t.whitelist.label} ${domain}\n`;
      smartdnsContent += `# ${t.whitelist.label} ${domain}\n`;
    });
  }

  return {
    dnsmasq: dnsmasqContent,
    hosts: hostsContent,
    adguard: adguardContent,
    whitelist: whitelistContent,
    unbound: unboundContent,
    pihole: piholeContent,
    domains: domainsContent,
    bind: bindContent,
    smartdns: smartdnsContent
  };
};
