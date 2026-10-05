// src/hooks/useSettings.test.ts v3.12.0
// @vitest-environment jsdom
// 默认设置单一来源（src/config/defaults.json）的回归测试：
// 一旦前端默认值与静态产物生成脚本（gen-format-files.mjs）再次分叉，此用例即失败。
import { describe, it, expect, afterEach } from 'vitest';
import { act } from 'react';
import { renderHook } from '../test-utils/renderHook';
import { useSettings } from './useSettings';
import { APP_VERSION } from '../config/version';
import defaults from '../config/defaults.json';

afterEach(() => document.body.innerHTML = '');

describe('useSettings', () => {
  it('用 defaults.json 的值作为初始设置，version 取自 APP_VERSION', () => {
    const { result, unmount } = renderHook(() => useSettings());
    expect(result.current.settings.projectName).toBe(defaults.projectName);
    expect(result.current.settings.ipv4).toBe(defaults.ipv4);
    expect(result.current.settings.ipv6).toBe(defaults.ipv6);
    expect(result.current.settings.version).toBe(APP_VERSION);
    expect(result.current.settings.visibleFormats).toEqual([]);
    unmount();
  });

  it('全部文件名默认值与 defaults.json 逐项一致', () => {
    const { result, unmount } = renderHook(() => useSettings());
    const s = result.current.settings;
    expect(s.dnsmasqFilename).toBe(defaults.dnsmasqFilename);
    expect(s.hostsFilename).toBe(defaults.hostsFilename);
    expect(s.adguardFilename).toBe(defaults.adguardFilename);
    expect(s.whitelistFilename).toBe(defaults.whitelistFilename);
    expect(s.unboundFilename).toBe(defaults.unboundFilename);
    expect(s.piholeFilename).toBe(defaults.piholeFilename);
    expect(s.domainsFilename).toBe(defaults.domainsFilename);
    expect(s.bindFilename).toBe(defaults.bindFilename);
    expect(s.smartdnsFilename).toBe(defaults.smartdnsFilename);
    expect(s.mosdnsFilename).toBe(defaults.mosdnsFilename);
    expect(s.clashFilename).toBe(defaults.clashFilename);
    expect(s.corednsFilename).toBe(defaults.corednsFilename);
    unmount();
  });

  it('setSettings 更新单个字段而不影响其他字段', () => {
    const { result, unmount } = renderHook(() => useSettings());
    const before = result.current.settings;
    act(() => {
      result.current.setSettings((prev) => ({ ...prev, ipv4: '10.0.0.1' }));
    });
    expect(result.current.settings.ipv4).toBe('10.0.0.1');
    expect(result.current.settings.hostsFilename).toBe(before.hostsFilename);
    unmount();
  });
});
