// src/utils/uiUtils.ts v2.2.2
import React from 'react';

// 生成行号
export const generateLineNumbers = (text: string, ref: React.RefObject<HTMLDivElement>): void => {
  if (ref.current) {
    const lines = text.split('\n').length;
    const lineNumbersHtml = Array.from({ length: lines }, (_, i) => i + 1).join('<br>');
    ref.current.innerHTML = lineNumbersHtml;
  }
};

// 同步滚动
export const syncScroll = (textareaRef: React.RefObject<HTMLTextAreaElement>, lineNumbersRef: React.RefObject<HTMLDivElement>): void => {
  if (textareaRef.current && lineNumbersRef.current) {
    lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
  }
};

// 同步输出滚动
export const syncOutputScroll = (previewRef: React.RefObject<HTMLDivElement>, lineNumbersRef: React.RefObject<HTMLDivElement>): void => {
  if (previewRef.current && lineNumbersRef.current) {
    lineNumbersRef.current.scrollTop = previewRef.current.scrollTop;
  }
};