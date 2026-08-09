// src/utils/rulesGenerator.ts v3.7.6
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

  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;

  let dnsmasqContent = '';
  let hostsContent = '';
  let adguardContent = '';
  let whitelistContent = '';

  if (addHeader) {
    const totalDomains = filteredDomains.length + customDns.length;
    const whitelistCount = filteredWhitelist.length;

    dnsmasqContent += generateHeader('dnsmasq', totalDomains, whitelistCount, dateStr, settings, t);
    hostsContent += generateHeader('hosts', totalDomains, whitelistCount, dateStr, settings, t);
    adguardContent += generateHeader('adguard', totalDomains, whitelistCount, dateStr, settings, t);
  }

  filteredDomains.forEach(domain => {
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
      hostsContent += `\n# ${t.whitelist.title}\n`;
      adguardContent += `\n! ${t.whitelist.title}\n`;
      whitelistContent += `# ${t.whitelist.title}\n`;
    }
    filteredWhitelist.forEach(domain => {
      dnsmasqContent += `server=/${domain}/\n`;
      hostsContent += `# ${t.whitelist.label} ${domain}\n`;
      adguardContent += `@@||${domain}^\n`;
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