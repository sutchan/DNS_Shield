// src/components/SettingsPanel.tsx v3.11.1
// 设置面板组件 —— 模态外壳 + 无障碍 Hook（useModalA11y）+ 内部表单（SettingsForm）。
// 从 OutputPanel 拆分；无障碍逻辑与表单内容已抽离以保持主文件 ≤200 行。
'use client';
import * as React from 'react';
import SettingsForm from './SettingsForm';
import { useModalA11y } from '../hooks/useModalA11y';
import { Settings as SettingsType } from '../types';
import { useT } from '../context/AppContext';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsType;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setSettings: React.Dispatch<React.SetStateAction<SettingsType>>;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  settings,
  theme,
  toggleTheme,
  setSettings,
}) => {
  const t = useT();
  const { dialogRef, closeBtnRef } = useModalA11y(isOpen, onClose);

  if (!isOpen) return null;
  return (
    <div
      className="settings-modal"
      id="settings-panel"
      role="dialog"
      aria-modal="true"
      aria-label={t.settingsTitle}
      ref={dialogRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="settings-dialog" id="settings-dialog">
        <div className="settings-dialog-header" id="settings-dialog-header">
          <span className="settings-dialog-title" id="settings-dialog-title">{t.settingsTitle}</span>
          <button
            type="button"
            className="settings-close"
            onClick={onClose}
            aria-label={t.closeBtn}
            id="settings-close-btn"
            ref={closeBtnRef}
          >
            <svg className="h-4 w-4" strokeWidth={2} aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <SettingsForm
          settings={settings}
          setSettings={setSettings}
          t={t}
          theme={theme}
          toggleTheme={toggleTheme}
        />
      </div>
    </div>
  );
};

export default SettingsPanel;
