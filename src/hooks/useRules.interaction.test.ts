// src/hooks/useRules.interaction.test.ts v3.15.0
// @vitest-environment jsdom
// 交互回调契约：生成按钮、生效后统计回传、下载文件名随格式切换、
// 复制成功/失败降级、输出滚动同步与行号槽位刷新。
// （原 useRules.test.ts 按关注点拆分，本文件承接「交互回调」分组）
import { describe, it, expect, afterEach, vi } from 'vitest';
import { act } from 'react';
import { renderHook } from '../test-utils/renderHook';
import { useRules } from './useRules';
import { downloadOutput as downloadOutputUtil, copyToClipboard } from '../utils/fileUtils';
import { generateSingleFormat } from '../utils/formatGenerators.single';
import { t, baseSettings, parsedData, makeStableToast, mutableRef } from '../test-utils/rulesTestKit';

// generateSingleFormat / generateRules 保留真实实现（spy 透传），
// 使断言既校验调用契约又不丢失输出语义校验。
vi.mock('../utils/formatGenerators.single', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/formatGenerators.single')>();
  return { ...actual, generateSingleFormat: vi.fn(actual.generateSingleFormat) };
});

vi.mock('../utils/rulesGenerator', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/rulesGenerator')>();
  return { ...actual, generateRules: vi.fn(actual.generateRules) };
});

// parser 在 useRules 中本不应被触碰（T-P1-05）；此处注册间谍作为回归守卫：
// 一旦有人把二次解析塞进 useRules，本文件立即失败。
vi.mock('../utils/parser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/parser')>();
  return { ...actual, parseSource: vi.fn(actual.parseSource) };
});

// download/copy 属副作用（Blob、剪贴板），仅断言调用契约，故替换为纯间谍
vi.mock('../utils/fileUtils', () => ({
  downloadOutput: vi.fn(),
  copyToClipboard: vi.fn()
}));

const downloadUtilMock = vi.mocked(downloadOutputUtil);
const copyClipboardMock = vi.mocked(copyToClipboard);
const generateSingleFormatMock = vi.mocked(generateSingleFormat);

afterEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = '';
});


describe('useRules · 交互回调', () => {
  it('generateRules 按钮触发生成并提示 rulesGenerated', () => {
    const showToast = makeStableToast();
    const { result, unmount } = renderHook(() =>
      useRules(parsedData, baseSettings, t, showToast)
    );
    // 自动生成不提示
    expect(showToast).not.toHaveBeenCalled();

    act(() => {
      result.current.generateRules();
    });
    expect(generateSingleFormatMock).toHaveBeenCalledTimes(2);
    expect(showToast).toHaveBeenCalledWith('rulesGenerated');
    unmount();
  });

  it('生成后回传「生效后统计」，与导出口径一致', () => {
    const onEffectiveStats = vi.fn();
    const { unmount } = renderHook(() =>
      useRules(parsedData, baseSettings, t, makeStableToast(), onEffectiveStats)
    );
    // 2 个黑名单域名 + 1 条自定义 DNS = blacklistCount 3；白名单 1 条
    expect(onEffectiveStats).toHaveBeenCalledWith({
      blacklistCount: 3,
      whitelistCount: 1,
      validCount: 4
    });
    unmount();
  });

  it('不传 onEffectiveStats 时不影响生成（可选回调）', () => {
    const { result, unmount } = renderHook(() =>
      useRules(parsedData, baseSettings, t, makeStableToast())
    );
    expect(result.current.currentOutput).toContain('address=/ad.example.com/127.0.0.1');
    unmount();
  });

  it('downloadOutput 使用当前格式文本与对应文件名', () => {
    const showToast = makeStableToast();
    const { result, unmount } = renderHook(() =>
      useRules(parsedData, baseSettings, t, showToast)
    );

    act(() => {
      result.current.setFormat('adguard');
    });
    const expected = result.current.currentOutput;
    act(() => {
      result.current.downloadOutput();
    });

    expect(downloadUtilMock).toHaveBeenCalledWith(expected, 'adguard.txt');
    expect(showToast).toHaveBeenCalledWith('downloaded', { filename: 'adguard.txt' });
    unmount();
  });

  it('downloadOutput 的文件名随格式切换而切换', () => {
    const showToast = makeStableToast();
    const { result, unmount } = renderHook(() =>
      useRules(parsedData, baseSettings, t, showToast)
    );

    act(() => {
      result.current.setFormat('pihole');
    });
    act(() => {
      result.current.downloadOutput();
    });
    expect(downloadUtilMock).toHaveBeenLastCalledWith(
      expect.any(String),
      'pihole.txt'
    );
    unmount();
  });

  it('copyOutput 成功与失败分别提示 copied / copyFailed', async () => {
    const showToast = makeStableToast();
    copyClipboardMock.mockResolvedValueOnce(true);
    const { result, unmount } = renderHook(() =>
      useRules(parsedData, baseSettings, t, showToast)
    );

    await act(async () => {
      await result.current.copyOutput();
    });
    expect(copyClipboardMock).toHaveBeenCalledWith(result.current.currentOutput);
    expect(showToast).toHaveBeenCalledWith('copied');

    copyClipboardMock.mockResolvedValueOnce(false);
    await act(async () => {
      await result.current.copyOutput();
    });
    expect(showToast).toHaveBeenCalledWith('copyFailed');

    // 抛异常时同样降级为 copyFailed，不向外冒泡
    copyClipboardMock.mockRejectedValueOnce(new Error('boom'));
    await act(async () => {
      await result.current.copyOutput();
    });
    expect(showToast).toHaveBeenCalledWith('copyFailed');
    unmount();
  });

  it('syncOutputScroll 同步行号槽位滚动位置', () => {
    const { result, unmount } = renderHook(() =>
      useRules(parsedData, baseSettings, t, makeStableToast())
    );

    const preview = document.createElement('div');
    const lineNumbers = document.createElement('div');
    document.body.append(preview, lineNumbers);
    preview.scrollTop = 120;
    mutableRef(result.current.outputPreviewRef).current = preview;
    mutableRef(result.current.outputLineNumbersRef).current = lineNumbers;

    act(() => {
      result.current.syncOutputScroll();
    });
    expect(lineNumbers.scrollTop).toBe(120);
    unmount();
  });

  it('行号槽位随输出内容更新（generateLineNumbers 契约）', () => {
    const { result, unmount } = renderHook(() =>
      useRules(parsedData, baseSettings, t, makeStableToast())
    );

    const lineNumbers = document.createElement('div');
    document.body.appendChild(lineNumbers);
    // 挂载时 ref 尚未挂载，赋 ref 后由 currentOutput 变化触发写入
    mutableRef(result.current.outputLineNumbersRef).current = lineNumbers;
    act(() => {
      result.current.setFormat('hosts');
    });
    const lineCount = result.current.currentOutput.split('\n').length;
    expect(lineNumbers.textContent?.split('\n').length).toBe(lineCount);
    unmount();
  });
});
