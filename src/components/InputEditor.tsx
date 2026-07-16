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
          className="editor-textarea"
        />
      </div>
      <div id="sourceInput-help" className="sr-only">
        {t.inputHelp}
      </div>
    </>
  );
};

export default InputEditor;
