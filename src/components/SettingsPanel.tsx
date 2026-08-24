// src/components/SettingsPanel.tsx v3.9.2
// 设置面板组件 —— 从 OutputPanel 拆分
'use client';
import * as React from 'react';
import { Sun, Moon } from 'lucide-react';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Checkbox } from './ui/Checkbox';
import { Settings as SettingsType, FormatType } from '../types';
import { ALL_FORMATS } from '../types/formats';
import { useT } from '../context/AppContext';

interface SettingsPanelProps {
  isCollapsed: boolean;
  settings: SettingsType;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  updateSettings: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setSettings: React.Dispatch<React.SetStateAction<SettingsType>>;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isCollapsed,
  settings,
  theme,
  toggleTheme,
  updateSettings,
  setSettings,
}) => {
  const t = useT();
  return (
    <div
      className={`settings-panel ${isCollapsed ? 'settings-collapsed' : 'settings-expanded'}`}
      id="settings-panel"
      aria-hidden={isCollapsed}
    >
      <div className="settings-inner" id="settings-inner">
        {/* 项目信息字段（独立分组，原型无独立标题，仅视觉分隔） */}
        <div className="settings-group" id="settings-group-project">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3" id="settings-fields-grid">
          <div className="flex flex-col gap-1.5" id="settings-field-project">
            <Label htmlFor="projectNameInput" className="text-xs font-medium text-muted-foreground">{t.projectName}</Label>
            <Input
              type="text"
              id="projectNameInput"
              name="projectName"
              value={settings.projectName}
              onChange={updateSettings}
            />
          </div>
          <div className="flex flex-col gap-1.5" id="settings-field-version">
            <Label htmlFor="versionInput" className="text-xs font-medium text-muted-foreground">{t.version}</Label>
            <Input
              type="text"
              id="versionInput"
              name="version"
              value={settings.version}
              onChange={updateSettings}
            />
          </div>
          <div className="flex flex-col gap-1.5" id="settings-field-ipv4">
            <Label htmlFor="ipv4Input" className="text-xs font-medium text-muted-foreground">{t.ipV4}</Label>
            <Input
              type="text"
              id="ipv4Input"
              name="ipv4"
              value={settings.ipv4}
              onChange={updateSettings}
            />
          </div>
          <div className="flex flex-col gap-1.5" id="settings-field-ipv6">
            <Label htmlFor="ipv6Input" className="text-xs font-medium text-muted-foreground">{t.ipV6}</Label>
            <Input
              type="text"
              id="ipv6Input"
              name="ipv6"
              value={settings.ipv6}
              onChange={updateSettings}
            />
          </div>
        </div>
        {/* 输出规则类型分组（对齐原型 fmtGroup） */}
        <div className="settings-group" id="settings-group-format">
          <h3 className="settings-group-title" id="settings-group-format-title">{t.fmtGroup}</h3>
        </div>
        {/* C：生成选项渲染为带边框的卡片 checkbox 网格（对齐原型 .opt-row + .box 视觉，仅 5 项） */}
        <div className="opt-grid" id="settings-options-grid">
          <label className="opt-card" id="settings-option-addheader">
            <Checkbox
              id="addHeader"
              checked={settings.addHeader}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, addHeader: checked === true }))}
            />
            <span className="opt-card-label">{t.headerComment}</span>
          </label>
          <label className="opt-card" id="settings-option-blockipv6">
            <Checkbox
              id="blockIPv6"
              checked={settings.blockIPv6}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, blockIPv6: checked === true }))}
            />
            <span className="opt-card-label">{t.blockIPv6}</span>
          </label>
          <label className="opt-card" id="settings-option-dedup">
            <Checkbox
              id="dedupDomains"
              checked={settings.dedupDomains}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, dedupDomains: checked === true }))}
            />
            <span className="opt-card-label">{t.dedup}</span>
          </label>
          <label className="opt-card" id="settings-option-removewildcard">
            <Checkbox
              id="removeWildcard"
              checked={settings.removeWildcard}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, removeWildcard: checked === true }))}
            />
            <span className="opt-card-label">{t.removeWildcard}</span>
          </label>
          <label className="opt-card" id="settings-option-adguard-include-whitelist">
            <Checkbox
              id="adguardIncludeWhitelist"
              checked={settings.adguardIncludeWhitelist}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, adguardIncludeWhitelist: checked === true }))}
            />
            <span className="opt-card-label">{t.adguardIncludeWhitelist}</span>
          </label>
        </div>

        {/* 输出规则类型分组（对齐原型 fmtGroup：showAllFormats 开关 + 9 个格式逐格式显示/隐藏开关） */}
        <div className="settings-group" id="settings-group-outtypes">
          <h3 className="settings-group-title" id="settings-group-outtypes-title">{t.fmtGroup}</h3>
          <label className="opt-card opt-card-inline" id="settings-option-show-all-formats">
            <Checkbox
              id="showAllFormats"
              checked={settings.showAllFormats}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, showAllFormats: checked === true }))}
            />
            <span className="opt-card-label">{t.showAllFormats}</span>
          </label>
          <div className="fmt-grid" id="settings-format-toggles">
            {ALL_FORMATS.map((fmt: FormatType) => {
              const active = settings.visibleFormats.length === 0 || settings.visibleFormats.includes(fmt);
              return (
                <button
                  type="button"
                  key={fmt}
                  className={`fmt-box ${active ? 'on' : ''}`}
                  id={`settings-fmt-toggle-${fmt}`}
                  aria-pressed={active}
                  onClick={() => setSettings((prev) => {
                    const set = new Set(prev.visibleFormats);
                    if (set.has(fmt)) set.delete(fmt);
                    else set.add(fmt);
                    return { ...prev, visibleFormats: Array.from(set) };
                  })}
                >
                  <span className="fmt-box-label">{t[`${fmt}Format` as keyof typeof t] as string}</span>
                </button>
              );
            })}
          </div>
        </div>
        </div>
        {/* 外观分组（对齐原型 appearanceGroup + 主题分段切换） */}
        <div className="settings-group" id="settings-group-appearance">
          <h3 className="settings-group-title" id="settings-group-appearance-title">{t.appearanceGroup}</h3>
          <div className="inline-flex items-center gap-2" id="settings-theme-segment" role="group" aria-label={t.darkTheme}>
            <button
              type="button"
              className={`theme-seg-btn ${theme === 'light' ? 'active' : ''}`}
              onClick={() => theme !== 'light' && toggleTheme()}
              aria-pressed={theme === 'light'}
              id="themeSegLight"
            >
              <Sun className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
              <span>{t.themeLight}</span>
            </button>
            <button
              type="button"
              className={`theme-seg-btn ${theme === 'dark' ? 'active' : ''}`}
              onClick={() => theme !== 'dark' && toggleTheme()}
              aria-pressed={theme === 'dark'}
              id="themeSegDark"
            >
              <Moon className="h-4 w-4" strokeWidth={1.8} aria-hidden="true" />
              <span>{t.themeDark}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;




