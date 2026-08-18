// src/hooks/useRules.ts v3.7.50
import { useState, useEffect, useRef, useCallback } from 'react';
import { generateRules as generateRulesUtil, computeEffectiveStats } from '../utils/rulesGenerator';
import { parseSource } from '../utils/parser';
import { downloadOutput as downloadOutputUtil, copyToClipboard } from '../utils/fileUtils';
import { generateLineNumbers } from '../utils/uiUtils';
import { OutputContent, Settings, ParsedData, Translation, FormatType, Stats } from '../types';

export const useRules = (
  parsedData: ParsedData,
  sourceInput: string,
  settings: Settings,
  t: Translation,
  showToast: (key: string, params?: { [key: string]: string | number }) => void,
  syncParsedData: (text?: string) => void,
  onEffectiveStats?: (stats: Pick<Stats, 'blacklistCount' | 'whitelistCount' | 'validCount'>) => void
) => {
  const [outputContent, setOutputContent] = useState<OutputContent>({
    dnsmasq: '',
    hosts: '',
    adguard: '',
    whitelist: '',
    unbound: '',
    pihole: '',
    domains: '',
    bind: '',
    smartdns: ''
  });
  const [currentFormat, setCurrentFormat] = useState<FormatType>('hosts');
  
  // 引用
  const outputPreviewRef = useRef<HTMLDivElement>(null);
  const outputLineNumbersRef = useRef<HTMLDivElement>(null);

  // 监听outputContent变化，更新输出行号
  useEffect(() => {
    generateLineNumbers(outputContent[currentFormat] || '', outputLineNumbersRef);
  }, [outputContent, currentFormat]);

  // 生成规则的核心逻辑（不含 toast），供按钮点击与自动同步复用
  // 用 useCallback 稳定引用，避免 useEffect 依赖抖动触发 exhaustive-deps 警告
  const runGenerate = useCallback((notify: boolean) => {
    // 必须本地重新 parseSource(sourceInput) 而非复用传入的 parsedData：
    // 1) 避开 useDomainData 的 300ms 防抖延迟（刚输入即点击生成时 parsedData 尚未更新）；
    // 2) 避免 React state 闭包捕获的旧值。此为有意设计，非冗余双解析。
    const freshData = parseSource(sourceInput);
    const { domains, whitelist, customDns } = freshData.data;
    const newOutputContent = generateRulesUtil(domains, whitelist, customDns, settings, t);
    setOutputContent(newOutputContent);
    // 同步「生效后的实际统计」到 UI：与本次生成的变换（去通配/去重/白名单剔除）完全一致，
    // 修复统计数字与实际导出结果不符的问题（#2）
    onEffectiveStats?.(computeEffectiveStats(freshData.data, settings));
    // 同步解析结果回 parsedData/stats，确保统计与合并信息立即反映本次生成内容
    // （消除防抖延迟造成的"规则已生成但白名单计数仍为 0"的失效观感）
    syncParsedData(sourceInput);

    // 生成输出行号 - 使用当前生成的内容
    const content = newOutputContent[currentFormat];
    generateLineNumbers(content || '', outputLineNumbersRef);

    if (notify) showToast('rulesGenerated');
  }, [sourceInput, settings, t, currentFormat, syncParsedData, showToast, onEffectiveStats]);

  // 监听 sourceInput：只要存在可解析内容即自动生成，确保右侧预览（含白名单标签页）
  // 始终反映当前数据，避免"左侧有白名单但右侧生成窗口为空"的失效观感。
  // 使用 ref 记录上一次实际内容，仅在内容变化时重新生成，避免无谓重渲染。
  const lastSourceRef = useRef<string>('');
  useEffect(() => {
    if (sourceInput && sourceInput !== lastSourceRef.current) {
      lastSourceRef.current = sourceInput;
      runGenerate(false);
    }
  }, [sourceInput, runGenerate]);

  // 生成规则（按钮触发，带提示）
  const generateRules = () => {
    runGenerate(true);
  };

  // 下载输出
  const downloadOutput = () => {
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
      smartdns: 'smartdnsFilename'
    };
    const filename = settings[filenameMap[currentFormat]] as string;
    downloadOutputUtil(content, filename);
    showToast('downloaded', { filename });
  };

  // 复制到剪贴板
  const copyOutput = async () => {
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
  };

  // 设置格式
  const setFormat = (format: FormatType) => {
    setCurrentFormat(format);
  };

  // 同步输出滚动
  const syncOutputScroll = () => {
    if (outputPreviewRef.current && outputLineNumbersRef.current) {
      outputLineNumbersRef.current.scrollTop = outputPreviewRef.current.scrollTop;
    }
  };

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



