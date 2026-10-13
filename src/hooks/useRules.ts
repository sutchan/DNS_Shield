// src/hooks/useRules.ts v3.12.0
import { useState, useEffect, useRef, useCallback } from 'react';
import { generateRules as generateRulesUtil, computeEffectiveStats } from '../utils/rulesGenerator';
import { downloadOutput as downloadOutputUtil, copyToClipboard } from '../utils/fileUtils';
import { generateLineNumbers } from './useLineNumbers';
import { OutputContent, Settings, ParsedData, Translation, FormatType, Stats } from '../types';

const EMPTY_OUTPUT: OutputContent = {
  dnsmasq: '',
  hosts: '',
  adguard: '',
  whitelist: '',
  unbound: '',
  pihole: '',
  domains: '',
  bind: '',
  smartdns: '',
  mosdns: '',
  clash: '',
  coredns: ''
};

// 判断解析结果是否含有可生成内容（含正则规则）
const hasRenderableData = (data: ParsedData): boolean =>
  data.domains.length > 0 ||
  data.whitelist.length > 0 ||
  data.customDns.length > 0 ||
  (data.regexRules?.length ?? 0) > 0;

export const useRules = (
  parsedData: ParsedData,
  settings: Settings,
  t: Translation,
  showToast: (key: string, params?: { [key: string]: string | number }) => void,
  onEffectiveStats?: (stats: Pick<Stats, 'blacklistCount' | 'whitelistCount' | 'validCount'>) => void
) => {
  const [outputContent, setOutputContent] = useState<OutputContent>(EMPTY_OUTPUT);
  const [currentFormat, setCurrentFormat] = useState<FormatType>('dnsmasq');
  
  // 引用
  const outputPreviewRef = useRef<HTMLDivElement>(null);
  const outputLineNumbersRef = useRef<HTMLDivElement>(null);
  // 用 ref 持有最新的 settings/t，避免 runGenerate 因 settings 对象引用变化而重建，
  // 从而稳定 generateRules 等回调引用，防止击穿 OutputPanel 的 React.memo（#perf）
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const tRef = useRef(t);
  tRef.current = t;

  // 监听outputContent变化，更新输出行号
  useEffect(() => {
    generateLineNumbers(outputContent[currentFormat] || '', outputLineNumbersRef);
  }, [outputContent, currentFormat]);

  // 生成规则的核心逻辑（不含 toast），供按钮点击与自动同步复用。
  // 直接复用 useDomainData 解析出的 parsedData（单一解析源，避免重复 parseSource，T-P1-05）。
  const runGenerate = useCallback((notify: boolean) => {
    const newOutputContent = generateRulesUtil(
      parsedData.domains,
      parsedData.whitelist,
      parsedData.customDns,
      settingsRef.current,
      tRef.current,
      parsedData.regexRules ?? []
    );
    setOutputContent(newOutputContent);
    // 同步「生效后的实际统计」到 UI：与本次生成的变换（去通配/去重/白名单剔除）完全一致，
    // 修复统计数字与实际导出结果不符的问题（#2）
    onEffectiveStats?.(computeEffectiveStats(parsedData, settingsRef.current));

    // 生成输出行号 - 使用当前生成的内容
    generateLineNumbers(newOutputContent[currentFormat] || '', outputLineNumbersRef);

    if (notify) showToast('rulesGenerated');
  }, [parsedData, currentFormat, showToast, onEffectiveStats]);

  // 监听解析结果：内容变化即重新生成，确保右侧预览（含白名单标签页）始终反映当前数据。
  // 与 useDomainData 共享同一份 ParsedData，此处不再触发任何解析（T-P1-05）。
  useEffect(() => {
    if (hasRenderableData(parsedData)) {
      runGenerate(false);
    } else {
      setOutputContent(EMPTY_OUTPUT);
    }
  }, [parsedData, runGenerate]);

  // 生成规则（按钮触发，带提示）
  const generateRules = useCallback(() => {
    runGenerate(true);
  }, [runGenerate]);

  // 下载输出
  const downloadOutput = useCallback(() => {
    const content = outputContent[currentFormat] || '';
    const filenameMap: Record<FormatType, keyof Settings> = {
      hosts: 'hostsFilename',
      dnsmasq: 'dnsmasqFilename',
      adguard: 'adguardFilename',
      whitelist: 'whitelistFilename',
      unbound: 'unboundFilename',
      pihole: 'piholeFilename',
      domains: 'domainsFilename',
      bind: 'bindFilename',
      smartdns: 'smartdnsFilename',
      mosdns: 'mosdnsFilename',
      clash: 'clashFilename',
      coredns: 'corednsFilename'
    };
    const filename = settings[filenameMap[currentFormat]] as string;
    downloadOutputUtil(content, filename);
    showToast('downloaded', { filename });
  }, [outputContent, currentFormat, settings, showToast]);

  // 复制到剪贴板
  const copyOutput = useCallback(async () => {
    try {
      const content = outputContent[currentFormat] || '';
      const success = await copyToClipboard(content);
      if (success) {
        showToast('copied');
      } else {
        showToast('copyFailed');
      }
    } catch {
      showToast('copyFailed');
    }
  }, [outputContent, currentFormat, showToast]);

  // 设置格式
  const setFormat = useCallback((format: FormatType) => {
    setCurrentFormat(format);
  }, []);

  // 同步输出滚动
  const syncOutputScroll = useCallback(() => {
    if (outputPreviewRef.current && outputLineNumbersRef.current) {
      outputLineNumbersRef.current.scrollTop = outputPreviewRef.current.scrollTop;
    }
  }, []);

  return {
    outputContent,
    currentFormat,
    outputPreviewRef,
    outputLineNumbersRef,
    generateRules,
    downloadOutput,
    copyOutput,
    setFormat,
    syncOutputScroll
  };
};



