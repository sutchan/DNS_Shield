// src/app/Home.tsx v2.2.0
'use client';
import React, { useState, useEffect, useRef } from 'react';
import './globals.css';

export default function Home() {
  // 状态管理
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isLangZh, setIsLangZh] = useState(true);

  // 在客户端初始化localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setTheme(savedTheme === 'dark' ? 'dark' : 'light');
    
    const savedLang = localStorage.getItem('lang');
    setIsLangZh(savedLang !== 'en');
  }, []);
  const [sourceInput, setSourceInput] = useState('');
  const [outputContent, setOutputContent] = useState({
    dnsmasq: '',
    hosts: '',
    adguard: '',
    whitelist: ''
  });
  const [currentFormat, setCurrentFormat] = useState<'hosts' | 'dnsmasq' | 'adguard' | 'whitelist'>('hosts');
  const [settings, setSettings] = useState({
    projectName: 'DNS Shield',
    version: '2.2.0',
    ipv4: '127.0.0.1',
    ipv6: '::',
    addHeader: true,
    blockIPv6: false,
    dedupDomains: true,
    removeWildcard: true,
    dnsmasqFilename: 'dnsmasq.conf',
    hostsFilename: 'hosts.txt',
    adguardFilename: 'adguard.txt',
    whitelistFilename: 'whitelist.txt'
  });
  interface CustomDnsEntry {
    domain: string;
    ip: string;
  }

  interface ParsedData {
    domains: string[];
    whitelist: string[];
    customDns: CustomDnsEntry[];
  }

  const [parsedData, setParsedData] = useState<ParsedData>({
    domains: [],
    whitelist: [],
    customDns: []
  });
  const [stats, setStats] = useState({
    domainCount: 0,
    validCount: 0,
    commentCount: 0,
    blacklistCount: 0,
    whitelistCount: 0
  });
  const [isUrlSectionCollapsed, setIsUrlSectionCollapsed] = useState(true);
  const [isSettingsPanelCollapsed, setIsSettingsPanelCollapsed] = useState(true);
  const [isUsageGuideCollapsed, setIsUsageGuideCollapsed] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [urls, setUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activePreset, setActivePreset] = useState('builtin');
  
  // 引用
  const sourceTextareaRef = useRef<HTMLTextAreaElement>(null);
  const outputPreviewRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const outputLineNumbersRef = useRef<HTMLDivElement>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  
  // 配置URLs
  const config = {
    domainsUrl: process.env.NEXT_PUBLIC_DOMAINS_URL || 'https://raw.githubusercontent.com/sutchan/DNS_Shield/main/domains.txt',
    presets: {
      builtin: process.env.NEXT_PUBLIC_PRESET_BUILTIN || 'https://raw.githubusercontent.com/sutchan/DNS_Shield/main/domains.txt',
      adguard: process.env.NEXT_PUBLIC_PRESET_ADGUARD || 'https://raw.githubusercontent.com/AdguardTeam/FiltersRegistry/master/filters/filter_15_DnsFilter/filter.txt',
      easylist: process.env.NEXT_PUBLIC_PRESET_EASYLIST || 'https://easylist-downloads.adblockplus.org/easylist.txt',
      neohosts: process.env.NEXT_PUBLIC_PRESET_NEOHOSTS || 'https://raw.githubusercontent.com/neoHosts/neoHosts/master/data/adblock.txt'
    }
  };

  // 加载本地域名数据
  const loadLocalDomains = async () => {
    try {
      console.warn('Loading from local domains.txt');
      const localResponse = await fetch('/domains.txt');
      if (localResponse.ok) {
        const text = await localResponse.text();
        if (text.trim()) {
          setSourceInput(text);
          parseSource(text);
          generateLineNumbers(text, lineNumbersRef);
          return true;
        }
      }
      return false;
    } catch (localError) {
      console.warn('Could not load local domains.txt:', localError);
      return false;
    }
  };

  // 加载域名数据的函数
  const loadDomainData = async () => {
    try {
      // 尝试从配置的URL加载
      const response = await fetch(config.domainsUrl);
      if (response.ok) {
        const text = await response.text();
        if (text.trim()) {
          setSourceInput(text);
          parseSource(text);
          generateLineNumbers(text, lineNumbersRef);
          return;
        }
      }
      
      // 如果远程加载失败，回退到本地文件
      await loadLocalDomains();
    } catch (error) {
      console.warn('Could not load domains.txt:', error);
      // 发生错误时回退到本地文件
      await loadLocalDomains();
    }
  };

  // 初始化
  useEffect(() => {
    // 加载域名数据
    loadDomainData();
    
    // 确保在客户端环境中使用localStorage
    if (typeof window !== 'undefined') {
      // 加载自动保存
      const autosave = localStorage.getItem('dnsShield_autosave');
      if (autosave && !sourceInput.trim()) {
        setSourceInput(autosave);
        parseSource(autosave);
        // 生成自动保存内容的行号
        generateLineNumbers(autosave, lineNumbersRef);
        const autoSaveTime = localStorage.getItem('dnsShield_autosave_time');
        if (autoSaveTime) {
          const timeAgo = Math.floor((Date.now() - parseInt(autoSaveTime)) / 60000);
          if (timeAgo > 0) {
            showToast(isLangZh ? `已恢复上次自动保存的内容 (${timeAgo}分钟前)` : `Restored auto-saved content (${timeAgo} min ago)`);
          }
        }
      }
      
      // 自动保存
      const autoSaveInterval = setInterval(() => {
        if (sourceInput.trim()) {
          localStorage.setItem('dnsShield_autosave', sourceInput);
          localStorage.setItem('dnsShield_autosave_time', Date.now().toString());
        }
      }, 30000);
      
      return () => clearInterval(autoSaveInterval);
    }
  }, []);

  // 监听sourceInput变化，更新输入行号
  useEffect(() => {
    generateLineNumbers(sourceInput, lineNumbersRef);
  }, [sourceInput]);

  // 监听outputContent变化，更新输出行号
  useEffect(() => {
    generateLineNumbers(outputContent[currentFormat] || '', outputLineNumbersRef);
  }, [outputContent, currentFormat]);

  // 监听主题变化并更新data-theme属性
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);
  
  // 语言翻译
  const translations = {
    zh: {
      subtitle: '路由器级全局广告过滤规则生成工具',
      inputTitle: '📥 输入域名清单',
      advanced: '高级选项',
      domainCount: '域名',
      validCount: '有效',
      commentCount: '注释',
      blacklistCount: '黑名单',
      whitelistCount: '白名单',
      urlPlaceholder: '输入 URL 导入域名列表...',
      fetchBtn: '获取',
      addUrl: '➕ 添加URL',
      sortUrlBtn: '⇅ 前缀优先',
      fetchAllUrls: '🌐 获取全部',
      presetLabel: '预设源:',
      builtinAd: '内置数据',
      adguard: 'AdGuard',
      easylist: 'EasyList',
      neohosts: 'NeoHosts',
      inputPlaceholder: '# 输入域名，每行一个\nad.example.com\nads.example.com\n# + 开头为白名单\n# @domain=ip 为自定义DNS',
      clearBtn: '🗑️ 清空',
      sortBtn: '↕️ 排序',
      parseBtn: '解析域名',
      dedupeBtn: '🔄 去重',
      saveBtn: '💾 保存',
      outputTitle: '📤 生成过滤规则',
      settingsTitle: '设置',
      projectName: '项目名称',
      version: '版本号',
      ipV4: 'IPv4',
      ipV6: 'IPv6',
      headerComment: '头部注释',
      blockIPv6: '阻止 IPv6',
      dedup: '自动去重',
      removeWildcard: '移除通配符',
      mergeInfo: '点击"生成规则"查看输出',
      previewPlaceholder: '// 生成的规则将显示在这里',
      generateBtn: '🔄 生成规则',
      downloadBtn: '📥 下载',
      copyBtn: '📋 复制',
      usageToggle: '📖 使用说明',
      usageStep1: '1. 输入或导入域名',
      usageStep1Desc: '在左侧文本框输入域名列表，或从预设源（AdGuard、EasyList等）导入，或直接粘贴 URL 获取域名',
      usageStep2: '2. 配置生成选项',
      usageStep2Desc: '选择输出格式（Dnsmasq/Hosts），设置目标 IP 地址，可选去重、排序、添加注释等',
      usageStep3: '3. 生成并下载规则',
      usageStep3Desc: '点击"生成规则"按钮，预览效果后下载到本地，或复制到剪贴板',
      usageTip: '💡 提示',
      usageTipContent: '生成的规则可直接用于路由器广告过滤，支持华硕、梅林、OpenWrt 等固件',
      adguardFormat: 'AdGuard 格式',
      adguardFile: 'AdGuard 文件名',
      downloadAdguard: '下载 AdGuard 格式',
      whitelistFormat: '白名单'
    },
    en: {
      subtitle: 'Router-level ad filtering rule generator',
      inputTitle: '📥 Input Domain List',
      advanced: 'Advanced',
      domainCount: 'Domains',
      validCount: 'Valid',
      commentCount: 'Comments',
      blacklistCount: 'Blacklist',
      whitelistCount: 'Whitelist',
      urlPlaceholder: 'Enter URL to import domain list...',
      fetchBtn: 'Fetch',
      addUrl: '➕ Add URL',
      sortUrlBtn: '⇅ Prefix First',
      fetchAllUrls: '🌐 Fetch All',
      presetLabel: 'Presets:',
      builtinAd: 'Built-in',
      adguard: 'AdGuard',
      easylist: 'EasyList',
      neohosts: 'NeoHosts',
      inputPlaceholder: '# Enter domains, one per line\nad.example.com\nads.example.com\n# + prefix for whitelist\n# @domain=ip for custom DNS',
      clearBtn: '🗑️ Clear',
      sortBtn: '↕️ Sort',
      parseBtn: 'Parse Domains',
      dedupeBtn: '🔄 Deduplicate',
      saveBtn: '💾 Save',
      outputTitle: '📤 Generate Filter Rules',
      settingsTitle: 'Settings',
      projectName: 'Project Name',
      version: 'Version',
      ipV4: 'IPv4',
      ipV6: 'IPv6',
      headerComment: 'Header Comments',
      blockIPv6: 'Block IPv6',
      dedup: 'Auto Deduplicate',
      removeWildcard: 'Remove Wildcards',
      mergeInfo: 'Click "Generate Rules" to view output',
      previewPlaceholder: '// Generated rules will appear here',
      generateBtn: '🔄 Generate Rules',
      downloadBtn: '📥 Download',
      copyBtn: '📋 Copy',
      usageToggle: '📖 Usage Guide',
      usageStep1: '1. Input or Import Domains',
      usageStep1Desc: 'Enter domain list in the left text box, or import from presets (AdGuard, EasyList, etc.), or paste URL to fetch domains',
      usageStep2: '2. Configure Generation Options',
      usageStep2Desc: 'Select output format (Dnsmasq/Hosts), set target IP address, optional deduplication, sorting, add comments, etc.',
      usageStep3: '3. Generate and Download Rules',
      usageStep3Desc: 'Click "Generate Rules" button, preview the result, then download to local or copy to clipboard',
      usageTip: '💡 Tip',
      usageTipContent: 'Generated rules can be directly used for router ad filtering, supporting Asus, Merlin, OpenWrt and other firmware',
      adguardFormat: 'AdGuard',
      adguardFile: 'AdGuard Filename',
      downloadAdguard: 'Download AdGuard Format',
      whitelistFormat: 'Whitelist'
    }
  };
  
  const t = isLangZh ? translations.zh : translations.en;
  
  // 切换语言
  const switchLang = () => {
    const newLang = isLangZh ? 'en' : 'zh';
    setIsLangZh(!isLangZh);
    // 确保在客户端环境中使用localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', newLang);
    }
  };
  
  // 切换主题
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    // 确保在客户端环境中使用localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  };
  
  // 显示提示
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };
  
  // 解析域名
  const parseDomainLine = (line: string) => {
    const trimmed = line.trim();
    
    if (!trimmed) {
      return { type: 'empty' as const, originalLine: line };
    }
    
    const hashIndex = trimmed.indexOf('#');
    if (hashIndex === 0) {
      return { type: 'comment' as const, originalLine: line };
    }
    
    let content = hashIndex >= 0 ? trimmed.substring(0, hashIndex).trim() : trimmed;
    
    if (!content) {
      return { type: 'comment' as const, originalLine: line };
    }
    
    if (content.startsWith('!')) {
      return { type: 'comment' as const, originalLine: line };
    }
    
    if (content.startsWith('+')) {
      const domain = content.substring(1).trim().toLowerCase().replace(/^\*\./, '');
      const isValid = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain);
      return {
        type: 'whitelist' as const,
        domain: domain,
        isValid: isValid,
        originalLine: line
      };
    }
    
    if (content.startsWith('@')) {
      const match = content.substring(1).trim().match(/^([^=]+)=(.+)$/);
      if (match) {
        const domain = match[1].toLowerCase().replace(/^\*\./, '');
        const ip = match[2].trim();
        const isValid = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain);
        return {
          type: 'customDns' as const,
          domain: domain,
          ip: ip,
          isValid: isValid,
          originalLine: line
        };
      }
      return { type: 'comment' as const, originalLine: line };
    }
    
    if (content.startsWith('0.0.0.0 ') || content.startsWith('127.0.0.1 ')) {
      const domain = content.replace(/^(0\.0\.0\.0|127\.0\.0\.1)\s+/, '').toLowerCase().replace(/^\*\./, '');
      const isValid = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain);
      return {
        type: 'hosts' as const,
        domain: domain,
        isValid: isValid,
        originalLine: line
      };
    }
    
    if (content.startsWith('address=/')) {
      const match = content.match(/address=\/([^\/]+)\//);
      if (match) {
        const domain = match[1].toLowerCase().replace(/^\*\./, '');
        const isValid = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain);
        return {
          type: 'dnsmasq' as const,
          domain: domain,
          isValid: isValid,
          originalLine: line
        };
      }
      return { type: 'comment' as const, originalLine: line };
    }
    
    if (content.startsWith('||') && content.endsWith('^')) {
      const domain = content.substring(2, content.length - 1).toLowerCase().replace(/^\*\./, '');
      const isValid = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain);
      return {
        type: 'adguard' as const,
        domain: domain,
        isValid: isValid,
        originalLine: line
      };
    }
    
    const domain = content.toLowerCase().replace(/^\*\./, '');
    const isValid = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain);
    return {
      type: 'domain' as const,
      domain: domain,
      isValid: isValid,
      originalLine: line
    };
  };

  // 解析域名
  const parseSource = (text?: string) => {
    try {
      const input = text || sourceInput;
      const lines = input.split('\n');
      
      const domains: string[] = [];
      const whitelist: string[] = [];
      const customDns: { domain: string; ip: string }[] = [];
      let commentCount = 0;

      for (const line of lines) {
        const parsed = parseDomainLine(line);
        
        if (parsed.type === 'empty') {
          commentCount++;
          continue;
        }
        
        if (parsed.type === 'comment') {
          commentCount++;
          continue;
        }
        
        if (parsed.type === 'whitelist') {
          if (parsed.isValid) {
            whitelist.push(parsed.domain);
          } else {
            commentCount++;
          }
          continue;
        }
        
        if (parsed.type === 'customDns') {
          if (parsed.isValid) {
            customDns.push({ domain: parsed.domain, ip: parsed.ip });
          } else {
            commentCount++;
          }
          continue;
        }
        
        if (parsed.type === 'hosts' || parsed.type === 'dnsmasq' || parsed.type === 'adguard' || parsed.type === 'domain') {
          if (parsed.isValid) {
            domains.push(parsed.domain);
          } else {
            commentCount++;
          }
          continue;
        }
        
        commentCount++;
      }

      // 去重和处理冲突
      const whitelistSet = new Set(whitelist.map(w => w.replace(/^\*\./, '')));
      const customDnsSet = new Set(customDns.map(c => c.domain.replace(/^\*\./, '')));
      const excludeSet = new Set([...whitelistSet, ...customDnsSet]);

      const filteredDomains = domains.filter(d => !excludeSet.has(d.replace(/^\*\./, '')));
      const uniqueWhitelist = [...new Set(whitelist)];

      setStats({
        domainCount: filteredDomains.length,
        validCount: filteredDomains.length + uniqueWhitelist.length,
        commentCount: commentCount,
        blacklistCount: filteredDomains.length,
        whitelistCount: uniqueWhitelist.length
      });

      // 保存解析结果
      setParsedData({
        domains: filteredDomains,
        whitelist: uniqueWhitelist,
        customDns: customDns
      });
    } catch (error) {
      console.error('Error parsing source:', error);
      showToast(isLangZh ? '解析失败，请检查输入格式' : 'Parsing failed, please check input format');
    }
  };
  
  // 生成头部
  const generateHeader = (formatType: 'dnsmasq' | 'hosts' | 'adguard', totalDomains: number, whitelistCount: number, dateStr: string) => {
    const formatConfigs = {
      dnsmasq: {
        commentChar: '#',
        separator: '=====================================',
        title: isLangZh ? 'Dnsmasq 广告过滤列表' : 'Dnsmasq Ad Block List',
        description: isLangZh ? '路由器级广告过滤规则' : 'Router-level ad blocking filter',
        usage: isLangZh ? `# 使用方法:\n#   - 梅林: 软件中心 -> DNS 设置\n#   - OpenWrt: 服务 -> DHCP 和 DNS` : `# Usage:\n#   - Merlin: Software Center -> DNS Settings\n#   - OpenWrt: Services -> DHCP and DNS`
      },
      hosts: {
        commentChar: '#',
        separator: '=====================================',
        title: isLangZh ? 'Hosts 广告过滤列表' : 'Hosts Ad Block List',
        description: isLangZh ? '路由器级广告过滤 hosts 文件' : 'Router-level ad blocking hosts file',
        usage: isLangZh ? '# 使用方法: 导入到路由器广告过滤设置' : '# Usage: Import to router ad blocking settings'
      },
      adguard: {
        commentChar: '!',
        separator: '====================================',
        title: isLangZh ? 'AdGuard 广告过滤规则' : 'AdGuard Ad Block Filter',
        description: isLangZh ? '兼容 AdGuard 的广告过滤规则' : 'AdGuard-compatible ad blocking filter',
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
    lines.push(`${commentChar} ${isLangZh ? '描述: ' : 'Description: '}${description}`);
    lines.push(`${commentChar}`);
    lines.push(`${commentChar} ${isLangZh ? '版本: ' : 'Version: '}${settings.version}`);
    lines.push(`${commentChar} ${isLangZh ? '更新: ' : 'Update: '}${dateStr}`);
    lines.push(`${commentChar} ${isLangZh ? '域名: ' : 'Domains: '}${totalDomains} ${isLangZh ? '个唯一域名' : 'unique domains'}`);
    if (whitelistCount > 0) {
      lines.push(`${commentChar} ${isLangZh ? '白名单: ' : 'Whitelist: '}${whitelistCount} ${isLangZh ? '个域名' : 'domains'}`);
    }
    lines.push(`${commentChar}`);
    if (usage) {
      lines.push(usage);
      lines.push(`${commentChar}`);
    }
    lines.push(`${commentChar} ${isLangZh ? '项目: ' : 'Project: '}https://github.com/sutchan/DNS_Shield`);
    lines.push(`${commentChar} ${isLangZh ? '演示: ' : 'Demo: '}https://dns.ewuse.com/`);
    lines.push(`${commentChar}`);
    lines.push(`${commentChar} ${separator}`);

    return lines.join('\n') + '\n\n';
  };

  // 生成规则
  const generateRules = () => {
    const { domains, whitelist, customDns } = parsedData;
    const addHeader = settings.addHeader;
    const blockIPv6 = settings.blockIPv6;
    const dedupDomains = settings.dedupDomains;
    const removeWildcard = settings.removeWildcard;

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

      dnsmasqContent += generateHeader('dnsmasq', totalDomains, whitelistCount, dateStr);
      hostsContent += generateHeader('hosts', totalDomains, whitelistCount, dateStr);
      adguardContent += generateHeader('adguard', totalDomains, whitelistCount, dateStr);
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
        dnsmasqContent += `address=/${item.domain}/::\n`;
      }
    });

    if (filteredWhitelist.length > 0) {
      if (addHeader) {
        dnsmasqContent += `\n# ${isLangZh ? '白名单 (允许这些域名)' : 'Whitelist (allow these domains)'}\n`;
        hostsContent += `\n# ${isLangZh ? '白名单 (允许这些域名)' : 'Whitelist (allow these domains)'}\n`;
        adguardContent += `\n! ${isLangZh ? '白名单 (允许这些域名)' : 'Whitelist (allow these domains)'}\n`;
        whitelistContent += `# ${isLangZh ? '白名单 (允许这些域名)' : 'Whitelist (allow these domains)'}\n`;
      }
      filteredWhitelist.forEach(domain => {
        dnsmasqContent += `server=/${domain}/\n`;
        hostsContent += `# ${isLangZh ? '已白名单: ' : 'Whitelisted: '}${domain}\n`;
        adguardContent += `@@||${domain}^\n`;
        whitelistContent += `@@||${domain}^\n`;
      });
    }

    setOutputContent({
      dnsmasq: dnsmasqContent,
      hosts: hostsContent,
      adguard: adguardContent,
      whitelist: whitelistContent
    });

    // 生成输出行号 - 使用当前生成的内容
    const content = {
      dnsmasq: dnsmasqContent,
      hosts: hostsContent,
      adguard: adguardContent,
      whitelist: whitelistContent
    }[currentFormat];
    generateLineNumbers(content || '', outputLineNumbersRef);

    showToast(isLangZh ? '规则生成成功！' : 'Rules generated successfully!');
  };
  
  // 下载输出
  const downloadOutput = () => {
    const content = outputContent[currentFormat] || '';
    const filename = settings[`${currentFormat}Filename` as keyof typeof settings] as string;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast(isLangZh ? `已下载 ${filename}` : `Downloaded ${filename}`);
  };
  
  // 复制到剪贴板
  const copyOutput = () => {
    const content = outputContent[currentFormat] || '';
    navigator.clipboard.writeText(content)
      .then(() => {
        showToast(isLangZh ? '已复制到剪贴板' : 'Copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        showToast(isLangZh ? '复制失败，请手动复制' : 'Copy failed, please copy manually');
      });
  };
  
  // 清空输入
  const clearAll = () => {
    setSourceInput('');
    setStats({ domainCount: 0, validCount: 0, commentCount: 0, blacklistCount: 0, whitelistCount: 0 });
  };
  
  // 排序域名
  const sortDomains = () => {
    const lines = sourceInput.split('\n');
    
    const headerComments: string[] = [];
    const bodyLines: string[] = [];
    const specialLines: string[] = [];
    
    let inHeader = true;
    
    for (const line of lines) {
      const parsed = parseDomainLine(line);
      
      if (parsed.type === 'empty') {
        bodyLines.push(line);
        continue;
      }
      
      if (parsed.type === 'whitelist' || parsed.type === 'customDns') {
        specialLines.push(line);
        continue;
      }
      
      if (parsed.type === 'comment') {
        if (inHeader) {
          headerComments.push(line);
        } else {
          bodyLines.push(line);
        }
        continue;
      }
      
      inHeader = false;
      bodyLines.push(line);
    }
    
    const plainDomains = bodyLines.filter(line => {
      const parsed = parseDomainLine(line);
      return parsed.type === 'domain' || parsed.type === 'hosts' || parsed.type === 'dnsmasq';
    });
    
    const comments = bodyLines.filter(line => {
      const parsed = parseDomainLine(line);
      return parsed.type === 'comment';
    });
    
    const sortedDomains = [...plainDomains].sort((a, b) => {
      const aParsed = parseDomainLine(a);
      const bParsed = parseDomainLine(b);
      const aDomain = 'domain' in aParsed ? aParsed.domain : '';
      const bDomain = 'domain' in bParsed ? bParsed.domain : '';
      return (aDomain || '').localeCompare(bDomain || '');
    });
    
    const result = [
      ...headerComments,
      ...sortedDomains,
      ...specialLines,
      ...comments
    ];
    
    const sortedContent = result.join('\n');
    setSourceInput(sortedContent);
    parseSource(sortedContent);
    showToast(isLangZh ? '域名已排序' : 'Domains sorted');
  };
  
  // 去重域名
  const dedupeDomains = () => {
    const lines = sourceInput.split('\n');
    
    const seen = new Set<string>();
    const uniqueLines: string[] = [];
    let removedCount = 0;
    
    for (const line of lines) {
      const parsed = parseDomainLine(line);
      
      if (parsed.type === 'empty') {
        uniqueLines.push(line);
        continue;
      }
      
      if (parsed.type === 'comment') {
        uniqueLines.push(line);
        continue;
      }
      
      if (!parsed.isValid) {
        uniqueLines.push(line);
        continue;
      }
      
      let key: string;
      if (parsed.type === 'whitelist' && 'domain' in parsed) {
        key = '+' + parsed.domain;
      } else if (parsed.type === 'customDns' && 'domain' in parsed && 'ip' in parsed) {
        key = '@' + parsed.domain + '=' + parsed.ip;
      } else if ('domain' in parsed) {
        key = parsed.domain;
      } else {
        key = line;
      }
      
      if (!seen.has(key)) {
        seen.add(key);
        uniqueLines.push(line);
      } else {
        removedCount++;
      }
    }
    
    const deduplicatedContent = uniqueLines.join('\n');
    setSourceInput(deduplicatedContent);
    parseSource(deduplicatedContent);
    showToast(isLangZh ? `已去除 ${removedCount} 个重复项` : `Removed ${removedCount} duplicates`);
  };
  
  // 保存域名
  const saveDomains = () => {
    // 这里可以实现保存到本地文件的功能
    showToast(isLangZh ? '域名已保存' : 'Domains saved');
  };
  
  // 生成行号
  const generateLineNumbers = (text: string, ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      const lines = text.split('\n').length;
      const lineNumbersHtml = Array.from({ length: lines }, (_, i) => i + 1).join('<br>');
      ref.current.innerHTML = lineNumbersHtml;
    }
  };
  
  // 同步滚动
  const syncScroll = () => {
    if (sourceTextareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = sourceTextareaRef.current.scrollTop;
    }
  };
  
  const syncOutputScroll = () => {
    if (outputPreviewRef.current && outputLineNumbersRef.current) {
      outputLineNumbersRef.current.scrollTop = outputPreviewRef.current.scrollTop;
    }
  };
  
  // 处理输入变化
  const handleSourceInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSourceInput(e.target.value);
    parseSource(e.target.value);
    generateLineNumbers(e.target.value, lineNumbersRef);
  };
  
  // 更新设置
  const updateSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSettings((prev: typeof settings) => ({
      ...prev,
      [id.replace('Input', '')]: value
    }));
  };
  
  // 切换区域
  const toggleSection = (section: string) => {
    switch (section) {
      case 'url-section':
        setIsUrlSectionCollapsed(!isUrlSectionCollapsed);
        break;
      case 'settings-panel':
        setIsSettingsPanelCollapsed(!isSettingsPanelCollapsed);
        break;
      case 'usage-guide':
        setIsUsageGuideCollapsed(!isUsageGuideCollapsed);
        break;
    }
  };
  
  // 设置格式
  const setFormat = (format: 'hosts' | 'dnsmasq' | 'adguard' | 'whitelist') => {
    setCurrentFormat(format);
  };
  
  // 加载预设
  const loadPreset = async (preset: string) => {
    setIsLoading(true);
    setActivePreset(preset);

    try {
      const url = config.presets[preset as keyof typeof config.presets];
      if (!url) {
        return;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const content = await response.text();
      setSourceInput(content);
      parseSource(content);
      // 生成行号
      generateLineNumbers(content, lineNumbersRef);
      showToast(isLangZh ? `已加载 ${preset} 预设` : `Loaded ${preset} preset`);
    } catch (error) {
      console.error('Error loading preset:', error);
      showToast(isLangZh ? '加载预设失败，请检查网络连接' : 'Failed to load preset, please check network connection');
    } finally {
      setIsLoading(false);
    }
  };

  // 从 URL 获取域名
  const fetchFromUrl = async () => {
    const url = urlInputRef.current?.value.trim();
    if (!url) {
      showToast(isLangZh ? '请输入 URL' : 'Please enter URL');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const content = await response.text();
      setSourceInput(content);
      parseSource(content);
      // 生成行号
      generateLineNumbers(content, lineNumbersRef);
      showToast(isLangZh ? '已从 URL 获取域名' : 'Fetched domains from URL');
    } catch (error) {
      console.error('Error fetching from URL:', error);
      showToast(isLangZh ? '获取失败，请检查 URL 和网络连接' : 'Failed to fetch, please check URL and network connection');
    } finally {
      setIsLoading(false);
    }
  };

  // 添加 URL
  const addUrl = () => {
    const url = urlInputRef.current?.value.trim();
    if (!url) {
      showToast(isLangZh ? '请输入 URL' : 'Please enter URL');
      return;
    }

    setUrls((prev: string[]) => [...prev, url]);
    urlInputRef.current!.value = '';
    showToast(isLangZh ? 'URL 已添加' : 'URL added');
  };

  // 排序 URLs
  const sortUrls = () => {
    setUrls((prev: string[]) => [...prev].sort());
    showToast(isLangZh ? 'URLs 已排序' : 'URLs sorted');
  };

  // 获取全部 URLs
  const fetchAllUrls = async () => {
    if (urls.length === 0) {
      showToast(isLangZh ? 'URL 列表为空' : 'URL list is empty');
      return;
    }

    setIsLoading(true);
    showToast(isLangZh ? '正在获取全部 URLs...' : 'Fetching all URLs...');
    
    try {
      let allContent = '';
      for (const url of urls) {
        const response = await fetch(url);
        if (response.ok) {
          allContent += await response.text() + '\n';
        }
      }
      
      setSourceInput(allContent);
      parseSource(allContent);
      // 生成行号
      generateLineNumbers(allContent, lineNumbersRef);
      showToast(isLangZh ? '已获取全部 URLs' : 'Fetched all URLs');
    } catch (error) {
      console.error('Error fetching all URLs:', error);
      showToast(isLangZh ? '获取失败，请检查网络连接' : 'Failed to fetch, please check network connection');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container" id="app-container">
      <header className="app-header">
        <div className="header-main">
          <h1>🛡️ DNS Shield</h1>
          <div className="header-actions">
            <button className="lang-switch" onClick={switchLang} title="切换语言">
              <span className="lang-zh">中</span>
              <span className="lang-divider">/</span>
              <span className="lang-en">EN</span>
            </button>
            <button className="icon-btn" onClick={toggleTheme} title="切换主题">
              <span className="theme-btn">{theme === 'dark' ? '☀️' : '🌙'}</span>
            </button>
          </div>
        </div>
        <p className="subtitle">{t.subtitle}</p>
      </header>

      <main className="main-content">
        <section className="panel input-section" id="input-panel">
          <div className="section-header">
            <h2>{t.inputTitle}</h2>
            <button className="collapse-btn" onClick={() => toggleSection('url-section')}>
              <span className="collapse-icon">▼</span>
              <span>{t.advanced}</span>
            </button>
          </div>

          <div className="stats-compact" id="stats-bar">
            <div className="stat-badge">
              <span className="stat-value" id="domainCount">{stats.domainCount}</span>
              <span className="stat-label">{t.domainCount}</span>
            </div>
            <div className="stat-badge">
              <span className="stat-value" id="blacklistCount">{stats.blacklistCount}</span>
              <span className="stat-label">{t.blacklistCount}</span>
            </div>
            <div className="stat-badge">
              <span className="stat-value" id="whitelistCount">{stats.whitelistCount}</span>
              <span className="stat-label">{t.whitelistCount}</span>
            </div>
            <div className="stat-badge">
              <span className="stat-value" id="validCount">{stats.validCount}</span>
              <span className="stat-label">{t.validCount}</span>
            </div>
            <div className="stat-badge">
              <span className="stat-value" id="commentCount">{stats.commentCount}</span>
              <span className="stat-label">{t.commentCount}</span>
            </div>
          </div>

          <div className={`url-section ${isUrlSectionCollapsed ? 'collapsed' : ''}`} id="url-section">
            <div className="url-input-row">
              <input 
                type="text" 
                className="url-input" 
                id="urlInput" 
                ref={urlInputRef}
                placeholder={t.urlPlaceholder} 
                defaultValue="https://raw.githubusercontent.com/sutchan/DNS_Shield/main/domains.txt"
              />
              <button className="btn btn-primary" onClick={fetchFromUrl}>{t.fetchBtn}</button>
            </div>
            <div className="url-actions">
              <button className="btn btn-sm" onClick={addUrl}>{t.addUrl}</button>
              <button className="btn btn-sm" onClick={sortUrls}>{t.sortUrlBtn}</button>
              <button className="btn btn-sm" onClick={fetchAllUrls}>{t.fetchAllUrls}</button>
            </div>
            <div className="url-list" id="urlList">
              {urls.map((url: string, index: number) => (
                <div key={index} className="url-item">
                  <span>{url}</span>
                  <button 
                    className="url-remove-btn"
                    onClick={() => setUrls((prev: string[]) => prev.filter((_: string, i: number) => i !== index))}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="preset-section">
              <span className="preset-label">{t.presetLabel}</span>
              <div className="preset-tags">
                <span className={`preset-tag ${activePreset === 'builtin' ? 'active' : ''}`} onClick={() => loadPreset('builtin')}>{t.builtinAd}</span>
                <span className={`preset-tag ${activePreset === 'adguard' ? 'active' : ''}`} onClick={() => loadPreset('adguard')}>{t.adguard}</span>
                <span className={`preset-tag ${activePreset === 'easylist' ? 'active' : ''}`} onClick={() => loadPreset('easylist')}>{t.easylist}</span>
                <span className={`preset-tag ${activePreset === 'neohosts' ? 'active' : ''}`} onClick={() => loadPreset('neohosts')}>{t.neohosts}</span>
              </div>
            </div>
          </div>

          <div className="editor-container">
            <div className="line-numbers" id="lineNumbers" ref={lineNumbersRef}></div>
            <textarea 
              id="sourceInput" 
              placeholder={t.inputPlaceholder} 
              value={sourceInput}
              onChange={handleSourceInput}
              onScroll={syncScroll}
              ref={sourceTextareaRef}
            ></textarea>
          </div>

          <div className="editor-actions">
            <button className="btn btn-outline" onClick={clearAll}>{t.clearBtn}</button>
            <button className="btn btn-outline" onClick={sortDomains}>{t.sortBtn}</button>
            <button className="btn btn-primary" onClick={() => parseSource()}>{t.parseBtn}</button>
            <button className="btn btn-outline" onClick={dedupeDomains}>{t.dedupeBtn}</button>
            <button className="btn btn-outline" onClick={saveDomains}>{t.saveBtn}</button>
          </div>
        </section>

        <section className="panel output-section" id="output-panel">
          <div className="section-header">
            <h2>{t.outputTitle}</h2>
            <div className="header-actions">
              <div className="format-tabs">
                <button 
                  className={`format-tab ${currentFormat === 'hosts' ? 'active' : ''}`} 
                  onClick={() => setFormat('hosts')}
                >
                  Hosts
                </button>
                <button 
                  className={`format-tab ${currentFormat === 'dnsmasq' ? 'active' : ''}`} 
                  onClick={() => setFormat('dnsmasq')}
                >
                  Dnsmasq
                </button>
                <button 
                  className={`format-tab ${currentFormat === 'adguard' ? 'active' : ''}`} 
                  onClick={() => setFormat('adguard')}
                >
                  {t.adguardFormat}
                </button>
                <button 
                  className={`format-tab ${currentFormat === 'whitelist' ? 'active' : ''}`} 
                  onClick={() => setFormat('whitelist')}
                >
                  {t.whitelistFormat}
                </button>
              </div>
              <button className="settings-btn" onClick={() => toggleSection('settings-panel')} title={t.settingsTitle}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>
            </div>
          </div>

          <div className={`settings-panel ${isSettingsPanelCollapsed ? 'collapsed' : ''}`} id="settings-panel">
            <div className="settings-grid">
              <div className="settings-item">
                <label>{t.projectName}</label>
                <input 
                  type="text" 
                  id="projectNameInput" 
                  defaultValue={settings.projectName}
                  onChange={updateSettings}
                />
              </div>
              <div className="settings-item">
                <label>{t.version}</label>
                <input 
                  type="text" 
                  id="versionInput" 
                  defaultValue={settings.version}
                  onChange={updateSettings}
                />
              </div>
              <div className="settings-item">
                <label>{t.ipV4}</label>
                <input 
                  type="text" 
                  id="ipv4Input" 
                  defaultValue={settings.ipv4}
                  onChange={updateSettings}
                />
              </div>
              <div className="settings-item">
                <label>{t.ipV6}</label>
                <input 
                  type="text" 
                  id="ipv6Input" 
                  defaultValue={settings.ipv6}
                  onChange={updateSettings}
                />
              </div>
            </div>
            <div className="options-row">
              <label className="checkbox-item">
                <input 
                  type="checkbox" 
                  id="addHeader" 
                  checked={settings.addHeader}
                  onChange={(e) => setSettings({...settings, addHeader: e.target.checked})}
                />
                <span>{t.headerComment}</span>
              </label>
              <label className="checkbox-item">
                <input 
                  type="checkbox" 
                  id="blockIPv6" 
                  checked={settings.blockIPv6}
                  onChange={(e) => setSettings({...settings, blockIPv6: e.target.checked})}
                />
                <span>{t.blockIPv6}</span>
              </label>
              <label className="checkbox-item">
                <input 
                  type="checkbox" 
                  id="dedupDomains" 
                  checked={settings.dedupDomains}
                  onChange={(e) => setSettings({...settings, dedupDomains: e.target.checked})}
                />
                <span>{t.dedup}</span>
              </label>
              <label className="checkbox-item">
                <input 
                  type="checkbox" 
                  id="removeWildcard" 
                  checked={settings.removeWildcard}
                  onChange={(e) => setSettings({...settings, removeWildcard: e.target.checked})}
                />
                <span>{t.removeWildcard}</span>
              </label>
            </div>
          </div>

          <div className="merge-info" id="mergeInfo">
            {outputContent[currentFormat] ? (
              <span>{isLangZh ? 
                `黑名单: ${parsedData.domains.length} | 白名单: ${parsedData.whitelist.length} | 自定义DNS: ${parsedData.customDns.length} | Dnsmasq: ${(outputContent.dnsmasq || '').split('\n').filter(line => line && !line.startsWith('#') && !line.startsWith('!')).length} 行 | Hosts: ${(outputContent.hosts || '').split('\n').filter(line => line && !line.startsWith('#') && !line.startsWith('!')).length} 行 | AdGuard: ${(outputContent.adguard || '').split('\n').filter(line => line && !line.startsWith('#') && !line.startsWith('!')).length} 行` : 
                `Blacklist: ${parsedData.domains.length} | Whitelist: ${parsedData.whitelist.length} | Custom DNS: ${parsedData.customDns.length} | Dnsmasq: ${(outputContent.dnsmasq || '').split('\n').filter(line => line && !line.startsWith('#') && !line.startsWith('!')).length} lines | Hosts: ${(outputContent.hosts || '').split('\n').filter(line => line && !line.startsWith('#') && !line.startsWith('!')).length} lines | AdGuard: ${(outputContent.adguard || '').split('\n').filter(line => line && !line.startsWith('#') && !line.startsWith('!')).length} lines`}
              </span>
            ) : (
              t.mergeInfo
            )}
          </div>

          <div className="output-container">
            <div className="line-numbers" id="outputLineNumbers" ref={outputLineNumbersRef}></div>
            <div 
              className="output-preview" 
              id="outputPreview" 
              onScroll={syncOutputScroll}
              ref={outputPreviewRef}
            >
              {outputContent[currentFormat] || t.previewPlaceholder}
            </div>
          </div>

          <div className="output-actions">
            <button className="btn btn-success" onClick={generateRules}>{t.generateBtn}</button>
            <button className="btn btn-primary" onClick={downloadOutput}>{t.downloadBtn}</button>
            <button className="btn btn-outline" onClick={copyOutput}>{t.copyBtn}</button>
          </div>
        </section>
      </main>

      <footer className="app-footer" id="about-panel">
        <button className="usage-toggle" id="usageToggle" onClick={() => toggleSection('usage-guide')}>
          <span id="usageToggleText">{t.usageToggle}</span>
          <svg className="toggle-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        <div className={`usage-guide ${isUsageGuideCollapsed ? 'collapsed' : ''}`} id="usageGuide">
          <div className="usage-steps">
            <div className="usage-step">
              <span className="step-number">1</span>
              <div className="step-content">
                <span className="step-title">{t.usageStep1}</span>
                <span className="step-desc">{t.usageStep1Desc}</span>
              </div>
            </div>
            <div className="usage-step">
              <span className="step-number">2</span>
              <div className="step-content">
                <span className="step-title">{t.usageStep2}</span>
                <span className="step-desc">{t.usageStep2Desc}</span>
              </div>
            </div>
            <div className="usage-step">
              <span className="step-number">3</span>
              <div className="step-content">
                <span className="step-title">{t.usageStep3}</span>
                <span className="step-desc">{t.usageStep3Desc}</span>
              </div>
            </div>
          </div>
          <div className="usage-tip">
            <span className="tip-label">{t.usageTip}</span>
            <span className="tip-content">{t.usageTipContent}</span>
          </div>
        </div>
        <div className="footer-content">
          <a href="https://github.com/sutchan/DNS_Shield" target="_blank" className="footer-link">
            GitHub
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
          <a href="https://dns.ewuse.com/" target="_blank" className="footer-link">
            Demo
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
          <span className="footer-version">v{settings.version}</span>
        </div>
      </footer>

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>{isLangZh ? '加载中...' : 'Loading...'}</span>
          </div>
        </div>
      )}

      {toastMessage && (
        <div className="toast" id="toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
}