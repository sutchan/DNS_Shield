// src/components/InputEditor.tsx v3.9.0
// 域名编辑器组件 —— 从 InputPanel 拆分
'use client';
import * as React from 'react';
import { useT } from '../context/AppContext';

interface InputEditorProps {
  sourceInput: string;
  lineNumbersRef: React.RefObject<HTMLDivElement>;
  sourceTextareaRef: React.RefObject<HTMLTextAreaElement>;
  handleSourceInput: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  syncScroll: () => void;
}

const InputEditor: React.FC<InputEditorProps> = ({
  sourceInput,
  lineNumbersRef,
  sourceTextareaRef,
  handleSourceInput,
  syncScroll,
}) => {
  const t = useT();
  return (
    <>
      <div className="editor-container" id="editor-container">
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




