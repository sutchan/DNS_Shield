// src/utils/rulesGenerator.ts v3.7.39
import { CustomDnsEntry, Settings, OutputContent, Translation } from '../types';

// 生成头部
export const generateHeader = (formatType: 'dnsmasq' | 'hosts' | 'adguard', totalDomains: number, whitelistCount: number, dateStr: string, settings: Settings, t: Translation): string => {
  const formatConfigs = {
    dnsmasq: {
      commentChar: '#',
      separator: '=====================================',
      title: t.header.dnsmasqTitle,
      description: t.header.description,
      usage: `${t.header.usage}\n${t.header.merlinUsage}\n${t.header.openwrtUsage}`
    },
    hosts: {
      commentChar: '#',
      separator: '=====================================',
      title: t.header.hostsTitle,
      description: t.header.hostsDescription,
      usage: t.header.hostsUsage
    },
    adguard: {
      commentChar: '!',
      separator: '====================================',
      title: t.header.adguardTitle,
      description: t.header.adguardDescription,
      usage: ''
    }
  };

  const config = formatConfigs[formatType];
  if (!config) return '';

  const { commentChar, separator, title, description, usage } = config;
  const lines: string[] = [];

  lines.push(`${commentChar} ${separator}`);
  lines.push(`${commentChar} ${settings.projectName} - ${title}`);
  lines.push(`${commentChar} ${separator}`);
  lines.push(`${commentChar}`);
  // 输出格式专属描述（避免与 title 行重复标注）
  lines.push(`${commentChar} ${description}`);
  lines.push(`${commentChar}`);
  lines.push(`${commentChar} ${t.header.version}: ${settings.version}`);
  lines.push(`${commentChar} ${t.header.update}: ${dateStr}`);
  lines.push(`${commentChar} ${t.header.domains}: ${totalDomains} ${t.header.uniqueDomains}`);
  if (whitelistCount > 0) {
    lines.push(`${commentChar} ${t.header.whitelist}: ${whitelistCount} ${t.header.domainsCount}`);
  }
  lines.push(`${commentChar}`);
  if (usage) {
    lines.push(usage);
    lines.push(`${commentChar}`);
  }
  lines.push(`${commentChar} ${t.header.project} https://github.com/sutchan/DNS_Shield`);
  lines.push(`${commentChar} ${t.header.demo} https://dns.ewuse.com/`);
  lines.push(`${commentChar}`);
  lines.push(`${commentChar} ${separator}`);

  return lines.join('\n') + '\n\n';
};

// 生成规则
export const generateRules = (domains: string[], whitelist: string[], customDns: CustomDnsEntry[], settings: Settings, t: Translation): OutputContent => {
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
  const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;

  let dnsmasqContent = '';
  let hostsContent = '';
  let adguardContent = '';
  let whitelistContent = '';

  if (addHeader) {
    const totalDomains = blockedDomains.length + customDns.length;
    const whitelistCount = filteredWhitelist.length;

    dnsmasqContent += generateHeader('dnsmasq', totalDomains, whitelistCount, dateStr, settings, t);
    hostsContent += generateHeader('hosts', totalDomains, whitelistCount, dateStr, settings, t);
    adguardContent += generateHeader('adguard', totalDomains, whitelistCount, dateStr, settings, t);
  }

  blockedDomains.forEach(domain => {
    dnsmasqContent += `address=/${domain}/${settings.ipv4}\n`;
    hostsContent += `${settings.ipv4} ${domain}\n`;
    adguardContent += `||${domain}^\n`;

    if (blockIPv6) {
      dnsmasqContent += `address=/${domain}/${settings.ipv6}\n`;
      hostsContent += `${settings.ipv6} ${domain}\n`;
    }
  });

  customDns.forEach((item: CustomDnsEntry) => {
    dnsmasqContent += `address=/${item.domain}/${item.ip}\n`;
    hostsContent += `${item.ip} ${item.domain}\n`;
    adguardContent += `||${item.domain}^\n`;

    if (blockIPv6) {
      dnsmasqContent += `address=/${item.domain}/${settings.ipv6}\n`;
    }
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
    });
  }

  return {
    dnsmasq: dnsmasqContent,
    hosts: hostsContent,
    adguard: adguardContent,
    whitelist: whitelistContent
  };
};



