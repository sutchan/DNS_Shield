// src/app/Home.tsx v2.2.1
'use client';
import React, { useState, useEffect, useRef } from 'react';
import './globals.css';

// 导入工具函数
import { parseSource, sortDomains as sortDomainsUtil, dedupeDomains as dedupeDomainsUtil } from '../utils/parser';
import { generateRules as generateRulesUtil } from '../utils/rulesGenerator';
import { downloadOutput as downloadOutputUtil, copyToClipboard, fetchFromUrl as fetchFromUrlUtil, fetchFromUrls } from '../utils/fileUtils';
import { generateLineNumbers, syncScroll as syncScrollUtil, syncOutputScroll as syncOutputScrollUtil } from '../utils/uiUtils';
import { supportedLanguages, getTranslation, isChineseLanguage } from '../utils/i18n';

// 导入类型
import { OutputContent, ParsedData, Stats, Settings } from '../types';

export default function Home() {
  // 状态管理
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currentLang, setCurrentLang] = useState('zh-cn');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // 在客户端初始化localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    setTheme(savedTheme === 'dark' ? 'dark' : 'light');
    
    const savedLang = localStorage.getItem('lang');
    setCurrentLang(savedLang || 'zh-cn');
  }, []);


  const [sourceInput, setSourceInput] = useState('');
  const [outputContent, setOutputContent] = useState<OutputContent>({
    dnsmasq: '',
    hosts: '',
    adguard: '',
    whitelist: ''
  });
  const [currentFormat, setCurrentFormat] = useState<'hosts' | 'dnsmasq' | 'adguard' | 'whitelist'>('hosts');
  const [settings, setSettings] = useState<Settings>({
    projectName: 'DNS Shield',
    version: '2.2.1',
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

  const [parsedData, setParsedData] = useState<ParsedData>({
    domains: [],
    whitelist: [],
    customDns: []
  });
  const [stats, setStats] = useState<Stats>({
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
          parseSourceData(text);
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
          parseSourceData(text);
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
        parseSourceData(autosave);
        // 生成自动保存内容的行号
        generateLineNumbers(autosave, lineNumbersRef);
        const autoSaveTime = localStorage.getItem('dnsShield_autosave_time');
        if (autoSaveTime) {
          const timeAgo = Math.floor((Date.now() - parseInt(autoSaveTime)) / 60000);
          if (timeAgo > 0) {
            showToast('autosaveRestored', { time: timeAgo });
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

  // 监听点击事件，点击其他地方关闭语言选择器下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const langSelector = document.querySelector('.lang-selector');
      if (langSelector && !langSelector.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };

    if (typeof window !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, []);
  
  // 获取当前语言的翻译
  const t = getTranslation(currentLang);
  
  // 检查是否为中文语言
  const isLangZh = isChineseLanguage(currentLang);
  
  // 切换语言
  const switchLang = (lang: string) => {
    setCurrentLang(lang);
    // 确保在客户端环境中使用localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('lang', lang);
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
  const showToast = (key: string, params?: { [key: string]: string | number }) => {
    let message = t.toast[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        message = message.replace(`{${k}}`, String(v));
      });
    }
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };
  
  // 解析域名数据
  const parseSourceData = (text?: string) => {
    try {
      const input = text || sourceInput;
      const { data, stats: newStats } = parseSource(input);
      setParsedData(data);
      setStats(newStats);
    } catch (error) {
      console.error('Error parsing source:', error);
      showToast('parseFailed');
    }
  };
  
  // 生成规则
  const generateRules = () => {
    const { domains, whitelist, customDns } = parsedData;
    const newOutputContent = generateRulesUtil(domains, whitelist, customDns, settings, t);
    setOutputContent(newOutputContent);
    
    // 生成输出行号 - 使用当前生成的内容
    const content = newOutputContent[currentFormat];
    generateLineNumbers(content || '', outputLineNumbersRef);

    showToast('rulesGenerated');
  };
  
  // 下载输出
  const downloadOutput = () => {
    const content = outputContent[currentFormat] || '';
    const filename = settings[`${currentFormat}Filename` as keyof Settings] as string;
    downloadOutputUtil(content, filename);
    showToast('downloaded', { filename });
  };
  
  // 复制到剪贴板
  const copyOutput = async () => {
    const content = outputContent[currentFormat] || '';
    const success = await copyToClipboard(content);
    if (success) {
      showToast('copied');
    } else {
      showToast('copyFailed');
    }
  };
  
  // 清空输入
  const clearAll = () => {
    setSourceInput('');
    setStats({ domainCount: 0, validCount: 0, commentCount: 0, blacklistCount: 0, whitelistCount: 0 });
  };
  
  // 排序域名
  const sortDomains = () => {
    const sortedContent = sortDomainsUtil(sourceInput);
    setSourceInput(sortedContent);
    parseSourceData(sortedContent);
    showToast('domainsSorted');
  };
  
  // 去重域名
  const dedupeDomains = () => {
    const { content, removedCount } = dedupeDomainsUtil(sourceInput);
    setSourceInput(content);
    parseSourceData(content);
    showToast('duplicatesRemoved', { count: removedCount });
  };
  
  // 保存域名
  const saveDomains = () => {
    // 这里可以实现保存到本地文件的功能
    showToast('domainsSaved');
  };
  
  // 同步滚动
  const syncScroll = () => {
    syncScrollUtil(sourceTextareaRef, lineNumbersRef);
  };
  
  const syncOutputScroll = () => {
    syncOutputScrollUtil(outputPreviewRef, outputLineNumbersRef);
  };
  
  // 处理输入变化
  const handleSourceInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSourceInput(e.target.value);
    parseSourceData(e.target.value);
    generateLineNumbers(e.target.value, lineNumbersRef);
  };
  
  // 更新设置
  const updateSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSettings((prev: Settings) => ({
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

      const content = await fetchFromUrlUtil(url);
      setSourceInput(content);
      parseSourceData(content);
      // 生成行号
      generateLineNumbers(content, lineNumbersRef);
      showToast('presetLoaded', { preset });
    } catch (error) {
      console.error('Error loading preset:', error);
      showToast('presetFailed');
    } finally {
      setIsLoading(false);
    }
  };

  // 从 URL 获取域名
  const fetchFromUrl = async () => {
    const url = urlInputRef.current?.value.trim();
    if (!url) {
      showToast('urlEnter');
      return;
    }

    setIsLoading(true);
    try {
      const content = await fetchFromUrlUtil(url);
      setSourceInput(content);
      parseSourceData(content);
      // 生成行号
      generateLineNumbers(content, lineNumbersRef);
      showToast('domainsFetched');
    } catch (error) {
      console.error('Error fetching from URL:', error);
      showToast('fetchFailed');
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
    showToast('urlAdded');
  };

  // 排序 URLs
  const sortUrls = () => {
    setUrls((prev: string[]) => [...prev].sort());
    showToast('urlsSorted');
  };

  // 获取全部 URLs
  const fetchAllUrls = async () => {
    if (urls.length === 0) {
      showToast('urlListEmpty');
      return;
    }

    setIsLoading(true);
    showToast('loading');
    
    try {
      const allContent = await fetchFromUrls(urls);
      setSourceInput(allContent);
      parseSourceData(allContent);
      // 生成行号
      generateLineNumbers(allContent, lineNumbersRef);
      showToast('urlsFetched');
    } catch (error) {
      console.error('Error fetching all URLs:', error);
      showToast('fetchFailed');
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
            <div className="lang-selector">
              <button 
                className="lang-selector-btn" 
                title={t.settingsTitle}
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              >
                <span className="lang-icon">{supportedLanguages.find(lang => lang.code === currentLang)?.icon || ''}</span>
                <span className="lang-name">{supportedLanguages.find(lang => lang.code === currentLang)?.name || currentLang}</span>
              </button>
              {isLangDropdownOpen && (
                <div className="lang-selector-dropdown">
                  {supportedLanguages.map(lang => (
                    <button
                      key={lang.code}
                      className={`lang-option ${currentLang === lang.code ? 'active' : ''}`}
                      onClick={() => {
                        switchLang(lang.code);
                        setIsLangDropdownOpen(false);
                      }}
                    >
                      <span className="lang-icon">{lang.icon || ''}</span>
                      <span className="lang-name">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
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