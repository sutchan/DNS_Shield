// src/components/InputEditor.tsx v3.13.6
// 域名编辑器组件 —— 从 InputPanel 拆分
// DOM id 统一为 kebab-case 语义命名（source-editor / input-line-numbers），
// 与项目规范及 useHomeController.scrollToInput 的 getElementById 契约一致。
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
        <div className="line-numbers" id="input-line-numbers" ref={lineNumbersRef} aria-hidden="true"></div>
        <label htmlFor="source-editor" className="sr-only">{t.inputPlaceholder}</label>
        <textarea
          id="source-editor"
          placeholder={t.inputPlaceholder}
          value={sourceInput}
          onChange={handleSourceInput}
          onScroll={syncScroll}
          ref={sourceTextareaRef}
          aria-describedby="source-editor-help"
          className="editor-textarea"
        />
      </div>
      <div id="source-editor-help" className="sr-only">
        {t.inputHelp}
      </div>
    </>
  );
};

export default InputEditor;




