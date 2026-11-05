// src/hooks/useRules.settings.test.ts v3.15.0
// @vitest-environment jsdom
// 设置变更联动契约（T-P1-13）：设置项（IP、项目名、去通配/去重开关等）与界面语言
// 都会影响头部注释与规则正文，变更后必须重新生成，预览与导出不得停留在旧口径。
import { describe, it, expect, afterEach, vi } from 'vitest';
import { act, useState } from 'react';
import { renderHook } from '../test-utils/renderHook';
import { useRules } from './useRules';
import { generateSingleFormat } from '../utils/formatGenerators.single';
import { t, baseSettings, parsedData, makeStableToast } from '../test-utils/rulesTestKit';

vi.mock('../utils/formatGenerators.single', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/formatGenerators.single')>();
  return { ...actual, generateSingleFormat: vi.fn(actual.generateSingleFormat) };
});

const generateSingleFormatMock = vi.mocked(generateSingleFormat);

afterEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = '';
});

describe('useRules · 设置变更触发重新生成', () => {
  it('设置项变化后重新生成，且传入新的设置值', () => {
    const showToast = makeStableToast();
    const { result, unmount } = renderHook(() => {
      const [settings, setSettings] = useState(baseSettings);
      return { ...useRules(parsedData, settings, t, showToast), setSettings };
    });

    expect(generateSingleFormatMock).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.setSettings({ ...baseSettings, ipv4: '10.0.0.1' });
    });

    expect(generateSingleFormatMock).toHaveBeenCalledTimes(2);
    expect(generateSingleFormatMock.mock.calls[1][4].ipv4).toBe('10.0.0.1');
    unmount();
  });

  it('项目名变化后头部注释同步更新', () => {
    const showToast = makeStableToast();
    const { result, unmount } = renderHook(() => {
      const [settings, setSettings] = useState(baseSettings);
      return { ...useRules(parsedData, settings, t, showToast), setSettings };
    });

    expect(result.current.currentOutput).toContain('DNS Shield');

    act(() => {
      result.current.setSettings({ ...baseSettings, projectName: 'MyProject' });
    });

    expect(result.current.currentOutput).toContain('MyProject');
    unmount();
  });

  it('设置对象引用变化时按最新设置重新生成（值相同的等价对象同样触发一次）', () => {
    const showToast = makeStableToast();
    const { result, unmount } = renderHook(() => {
      const [settings, setSettings] = useState(baseSettings);
      return { ...useRules(parsedData, settings, t, showToast), setSettings };
    });

    act(() => {
      result.current.setSettings({ ...baseSettings });
    });

    expect(generateSingleFormatMock).toHaveBeenCalledTimes(2);
    unmount();
  });
});
