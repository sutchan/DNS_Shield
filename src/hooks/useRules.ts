// src/hooks/useRules.ts v3.7.15
import { useState, useEffect, useRef } from 'react';
import { generateRules as generateRulesUtil } from '../utils/rulesGenerator';
import { parseSource } from '../utils/parser';
import { downloadOutput as downloadOutputUtil, copyToClipboard } from '../utils/fileUtils';
import { generateLineNumbers } from '../utils/uiUtils';
import { OutputContent, Settings, ParsedData, Translation, FormatType } from '../types';

export const useRules = (
  parsedData: ParsedData,
  sourceInput: string,
  settings: Settings,
  t: Translation,
  showToast: (key: string, params?: { [key: string]: string | number }) => void,
  syncParsedData: (text?: string) => void
) => {
  const [outputContent, setOutputContent] = useState<OutputContent>({
    dnsmasq: '',
    hosts: '',
    adguard: '',
    whitelist: ''
  });
  const [currentFormat, setCurrentFormat] = useState<FormatType>('hosts');
  
  // 引用
  const outputPreviewRef = useRef<HTMLDivElement>(null);
  const outputLineNumbersRef = useRef<HTMLDivElement>(null);

  // 监听outputContent变化，更新输出行号
  useEffect(() => {
    generateLineNumbers(outputContent[currentFormat] || '', outputLineNumbersRef);
  }, [outputContent, currentFormat]);

  // 生成规则
  const generateRules = () => {
    // 实时解析最新输入，避免依赖防抖解析导致的陈旧 parsedData（如刚输入白名单立即点击生成时白名单为空）
    const freshData = parseSource(sourceInput);
    const { domains, whitelist, customDns } = freshData.data;
    const newOutputContent = generateRulesUtil(domains, whitelist, customDns, settings, t);
    setOutputContent(newOutputContent);
    // 同步解析结果回 parsedData/stats，确保统计与合并信息立即反映本次生成内容
    // （消除防抖延迟造成的"规则已生成但白名单计数仍为 0"的失效观感）
    syncParsedData(sourceInput);
    
    // 生成输出行号 - 使用当前生成的内容
    const content = newOutputContent[currentFormat];
    generateLineNumbers(content || '', outputLineNumbersRef);

    showToast('rulesGenerated');
  };

  // 下载输出
  const downloadOutput = () => {
    const content = outputContent[currentFormat] || '';
    const filenameMap: Record<FormatType, keyof Settings> = {
      hosts: 'hostsFilename',
      dnsmasq: 'dnsmasqFilename',
      adguard: 'adguardFilename',
      whitelist: 'whitelistFilename'
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