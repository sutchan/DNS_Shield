// src/components/SettingsPanel.tsx v3.8.0
// 设置面板组件 —— 从 OutputPanel 拆分
'use client';
import * as React from 'react';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Checkbox } from './ui/Checkbox';
import { Settings as SettingsType } from '../types';
import { useT } from '../context/AppContext';

interface SettingsPanelProps {
  isCollapsed: boolean;
  settings: SettingsType;
  updateSettings: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setSettings: React.Dispatch<React.SetStateAction<SettingsType>>;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isCollapsed,
  settings,
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
        <div className="flex flex-wrap gap-4" id="settings-options-row">
          <div className="inline-flex items-center gap-2 text-sm cursor-pointer select-none" id="settings-option-addheader">
            <Checkbox
              id="addHeader"
              checked={settings.addHeader}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, addHeader: checked === true }))}
            />
            <Label htmlFor="addHeader" className="text-sm text-muted-foreground cursor-pointer">{t.headerComment}</Label>
          </div>
          <div className="inline-flex items-center gap-2 text-sm cursor-pointer select-none" id="settings-option-blockipv6">
            <Checkbox
              id="blockIPv6"
              checked={settings.blockIPv6}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, blockIPv6: checked === true }))}
            />
            <Label htmlFor="blockIPv6" className="text-sm text-muted-foreground cursor-pointer">{t.blockIPv6}</Label>
          </div>
          <div className="inline-flex items-center gap-2 text-sm cursor-pointer select-none" id="settings-option-dedup">
            <Checkbox
              id="dedupDomains"
              checked={settings.dedupDomains}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, dedupDomains: checked === true }))}
            />
            <Label htmlFor="dedupDomains" className="text-sm text-muted-foreground cursor-pointer">{t.dedup}</Label>
          </div>
          <div className="inline-flex items-center gap-2 text-sm cursor-pointer select-none" id="settings-option-removewildcard">
            <Checkbox
              id="removeWildcard"
              checked={settings.removeWildcard}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, removeWildcard: checked === true }))}
            />
            <Label htmlFor="removeWildcard" className="text-sm text-muted-foreground cursor-pointer">{t.removeWildcard}</Label>
          </div>
          <div className="inline-flex items-center gap-2 text-sm cursor-pointer select-none" id="settings-option-adguard-include-whitelist">
            <Checkbox
              id="adguardIncludeWhitelist"
              checked={settings.adguardIncludeWhitelist}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, adguardIncludeWhitelist: checked === true }))}
            />
            <Label htmlFor="adguardIncludeWhitelist" className="text-sm text-muted-foreground cursor-pointer">{t.adguardIncludeWhitelist}</Label>
          </div>
          <div className="inline-flex items-center gap-2 text-sm cursor-pointer select-none" id="settings-option-show-all-formats">
            <Checkbox
              id="showAllFormats"
              checked={settings.showAllFormats}
              onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, showAllFormats: checked === true }))}
            />
            <Label htmlFor="showAllFormats" className="text-sm text-muted-foreground cursor-pointer">{t.showAllFormats}</Label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;




