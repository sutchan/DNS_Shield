// src/hooks/useRules.ts v3.6.0
import { useState, useEffect, useRef } from 'react';
import { generateRules as generateRulesUtil } from '../utils/rulesGenerator';
import { downloadOutput as downloadOutputUtil, copyToClipboard } from '../utils/fileUtils';
import { generateLineNumbers } from '../utils/uiUtils';
import { OutputContent, Settings, ParsedData, Translation, FormatType } from '../types';

export const useRules = (parsedData: ParsedData, settings: Settings, t: Translation, showToast: (key: string, params?: { [key: string]: string | number }) => void) => {
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