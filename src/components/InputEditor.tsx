// src/components/InputEditor.tsx v3.4.0
// 域名编辑器组件 —— 从 InputPanel 拆分
'use client';
import * as React from 'react';
import { Translation } from '../types';

interface InputEditorProps {
  sourceInput: string;
  t: Translation;
  lineNumbersRef: React.RefObject<HTMLDivElement>;
  sourceTextareaRef: React.RefObject<HTMLTextAreaElement>;
  handleSourceInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  syncScroll: () => void;
}

const InputEditor: React.FC<InputEditorProps> = ({
  sourceInput,
  t,
  lineNumbersRef,
  sourceTextareaRef,
  handleSourceInput,
  syncScroll,
}) => {
  return (
    <>
      <div className="editor-container">
        <div className="line-numbers" id="inputLineNumbers" ref={lineNumbersRef} aria-hidden="true"></div>
        <label htmlFor="sourceInput" className="sr-only">{t.inputPlaceholder}</label>
        <textarea
          id="sourceInput"
          placeholder={t.inputPlaceholder}
          value={sourceInput}
          onChange={handleSourceInput}
          onScroll={syncScroll}
          ref={sourceTextareaRef}
          aria-describedby="sourceInput-help"
          className="w-full min-h-[200px] py-3 pl-14 pr-3 text-sm font-mono bg-background resize-y focus:outline-none"
        />
      </div>
      <div id="sourceInput-help" className="sr-only">
        输入域名列表，每行一个
      </div>
    </>
  );
};

export default InputEditor;
