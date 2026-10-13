// src/hooks/useRules.ts v3.13.0
import { useState, useEffect, useRef, useCallback } from 'react';
import { computeEffectiveStats } from '../utils/rulesGenerator';
import { generateSingleFormat } from '../utils/formatGenerators.single';
import { downloadOutput as downloadOutputUtil, copyToClipboard } from '../utils/fileUtils';
import { generateLineNumbers } from './useLineNumbers';
import { Settings, ParsedData, Translation, FormatType, Stats } from '../types';

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
  // 惰性生成（T-P1-06）：仅持有当前格式的规则文本，不再一次性生成全部 12 种格式；
  // 下载/复制同样只消费当前格式文本，全量生成对 UI 与导出均无必要。
  const [currentOutput, setCurrentOutput] = useState('');
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

  // 监听当前格式文本变化，更新输出行号
  useEffect(() => {
    generateLineNumbers(currentOutput, outputLineNumbersRef);
  }, [currentOutput]);

  // 生成规则的核心逻辑（不含 toast），供按钮点击与自动同步复用。
  // 惰性生成（T-P1-06）：仅生成 currentFormat 对应文本，语义与全量生成逐字节一致
  // （由 formatGenerators.single.test.ts 断言保证）；直接复用上层解析出的 parsedData
  // （单一解析源，避免重复 parseSource，T-P1-05）。
  const runGenerate = useCallback((notify: boolean) => {
    const newOutput = generateSingleFormat(
      currentFormat,
      parsedData.domains,
      parsedData.whitelist,
      parsedData.customDns,
      settingsRef.current,
      tRef.current,
      parsedData.regexRules ?? []
    );
    setCurrentOutput(newOutput);
    // 同步「生效后的实际统计」到 UI：与本次生成的变换（去通配/去重/白名单剔除）完全一致，
    // 修复统计数字与实际导出结果不符的问题（#2）
    onEffectiveStats?.(computeEffectiveStats(parsedData, settingsRef.current));

    // 生成输出行号 - 使用当前生成的内容
    generateLineNumbers(newOutput, outputLineNumbersRef);

    if (notify) showToast('rulesGenerated');
  }, [parsedData, currentFormat, showToast, onEffectiveStats]);

  // 监听解析结果：内容变化即重新生成，确保右侧预览（含白名单标签页）始终反映当前数据。
  // 与 useDomainData 共享同一份 ParsedData，此处不再触发任何解析（T-P1-05）。
  // runGenerate 依赖 currentFormat，格式切换时会自动重新生对应格式文本。
  useEffect(() => {
    if (hasRenderableData(parsedData)) {
      runGenerate(false);
    } else {
      setCurrentOutput('');
    }
  }, [parsedData, runGenerate]);

  // 生成规则（按钮触发，带提示）
  const generateRules = useCallback(() => {
    runGenerate(true);
  }, [runGenerate]);

  // 下载输出（直接使用当前格式文本，无需全量生成）
  const downloadOutput = useCallback(() => {
    const content = currentOutput;
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
  }, [currentOutput, currentFormat, settings, showToast]);

  // 复制到剪贴板（直接使用当前格式文本，无需全量生成）
  const copyOutput = useCallback(async () => {
    try {
      const content = currentOutput;
      const success = await copyToClipboard(content);
      if (success) {
        showToast('copied');
      } else {
        showToast('copyFailed');
      }
    } catch {
      showToast('copyFailed');
    }
  }, [currentOutput, showToast]);

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
    currentOutput,
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



