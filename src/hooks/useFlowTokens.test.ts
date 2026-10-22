// src/hooks/useFlowTokens.test.ts v3.13.1
// @vitest-environment jsdom
// 流量可视化契约：抽样池为空时保持空数组；非空时按 SPAWN_INTERVAL 定时生成 token，
// 每个 token 在 TOKEN_LIFETIME 后被回收；prefers-reduced-motion 下不生成任何 token。
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { act, useState } from 'react';
import { renderHook } from '../test-utils/renderHook';
import { useFlowTokens } from './useFlowTokens';
import type { ParsedData } from '../types';

const SPAWN_INTERVAL = 650;
const TOKEN_LIFETIME = 3600;

const data: ParsedData = {
  domains: ['ad.example.com', 'ads.example.net'],
  whitelist: ['safe.example.com'],
  customDns: [{ domain: 'cdn.example.com', ip: '10.0.0.1' }],
  regexRules: []
};

/** jsdom 不实现 matchMedia，按用例需要打桩 */
function stubReducedMotion(reduced: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: reduced,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  }));
}

beforeEach(() => {
  vi.useFakeTimers();
  stubReducedMotion(false);
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  document.body.innerHTML = '';
});

describe('useFlowTokens', () => {
  it('抽样池为空时不生成任何 token', () => {
    const empty: ParsedData = { domains: [], whitelist: [], customDns: [], regexRules: [] };
    const { result, unmount } = renderHook(() => useFlowTokens(empty));

    expect(result.current).toEqual([]);
    act(() => {
      vi.advanceTimersByTime(SPAWN_INTERVAL * 5);
    });
    expect(result.current).toEqual([]);
    unmount();
  });

  it('按 SPAWN_INTERVAL 定时生成 token', () => {
    const { result, unmount } = renderHook(() => useFlowTokens(data));

    expect(result.current).toEqual([]);

    act(() => {
      vi.advanceTimersByTime(SPAWN_INTERVAL);
    });
    expect(result.current).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(SPAWN_INTERVAL * 2);
    });
    expect(result.current).toHaveLength(3);
    unmount();
  });

  it('token 字段取自抽样池（name 属于域名/白名单/改道集合，kind 正确）', () => {
    const { result, unmount } = renderHook(() => useFlowTokens(data));

    act(() => {
      vi.advanceTimersByTime(SPAWN_INTERVAL);
    });

    const token = result.current[0];
    const poolNames = [
      ...data.domains,
      ...data.whitelist,
      ...data.customDns.map((c) => c.domain)
    ];
    expect(poolNames).toContain(token.name);
    expect(['block', 'allow', 'dns']).toContain(token.kind);
    // left 为百分比定位，duration 为秒制时长
    expect(token.left).toMatch(/^\d+(\.\d+)?%$/);
    expect(token.duration).toMatch(/^\d+(\.\d+)?s$/);
    unmount();
  });

  it('token id 唯一且递增', () => {
    const { result, unmount } = renderHook(() => useFlowTokens(data));

    act(() => {
      vi.advanceTimersByTime(SPAWN_INTERVAL * 4);
    });

    const ids = result.current.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    unmount();
  });

  it('token 在 TOKEN_LIFETIME 后被回收', () => {
    const { result, unmount } = renderHook(() => useFlowTokens(data));

    act(() => {
      vi.advanceTimersByTime(SPAWN_INTERVAL);
    });
    expect(result.current).toHaveLength(1);
    const firstId = result.current[0].id;

    // 首个 token 生命周期到期：其 id 应从池中消失
    // （期间按 SPAWN_INTERVAL 仍有新 token 生成，故只断言该 id 不再存在）
    act(() => {
      vi.advanceTimersByTime(TOKEN_LIFETIME);
    });
    expect(result.current.map((t) => t.id)).not.toContain(firstId);
    unmount();
  });

  it('prefers-reduced-motion 下不生成 token（无障碍尊重）', () => {
    stubReducedMotion(true);
    const { result, unmount } = renderHook(() => useFlowTokens(data));

    act(() => {
      vi.advanceTimersByTime(SPAWN_INTERVAL * 10);
    });
    expect(result.current).toEqual([]);
    unmount();
  });

  it('卸载时清理定时器（不再生成新 token）', () => {
    const { result, unmount } = renderHook(() => useFlowTokens(data));

    act(() => {
      vi.advanceTimersByTime(SPAWN_INTERVAL * 2);
    });
    const before = result.current.length;
    expect(before).toBeGreaterThan(0);

    unmount();
    act(() => {
      vi.advanceTimersByTime(SPAWN_INTERVAL * 5);
    });
    expect(result.current).toHaveLength(before);
  });

  it('数据从空变为非空时开始生成 token', () => {
    const empty: ParsedData = { domains: [], whitelist: [], customDns: [], regexRules: [] };

    const { result, unmount } = renderHook(() => {
      const [source, setSource] = useState<ParsedData>(empty);
      return { tokens: useFlowTokens(source), setSource };
    });

    expect(result.current.tokens).toEqual([]);

    act(() => {
      result.current.setSource(data);
    });
    act(() => {
      vi.advanceTimersByTime(SPAWN_INTERVAL);
    });
    expect(result.current.tokens.length).toBeGreaterThan(0);

    // 回落为空：清空已有 token 且停止生成
    act(() => {
      result.current.setSource(empty);
    });
    expect(result.current.tokens).toEqual([]);

    act(() => {
      vi.advanceTimersByTime(SPAWN_INTERVAL * 3);
    });
    expect(result.current.tokens).toEqual([]);
    unmount();
  });
});
