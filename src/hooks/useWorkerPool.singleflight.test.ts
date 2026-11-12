// src/hooks/useWorkerPool.singleflight.test.ts v3.17.3
// @vitest-environment jsdom
// 回归测试（部署后页面内存 5GB bug）：
// 1) useWorkerPool 必须返回稳定引用——它是 useRuleWorker.run 的依赖，一旦每帧变化，
//    会沿 processParse → parseSourceData → loadLocalDomains → loadDomainData 传导，
//    使 useEffect([loadDomainData]) 每帧执行 loadDomainData；
// 2) Worker 任务必须单飞——每帧向 Worker postMessage 克隆整块大文本时，
//    文本副本会在 Worker 侧堆积，内存随投递次数线性放大直至 OOM。
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, useState } from 'react';
import { renderHook } from '../test-utils/renderHook';
import { useWorkerPool } from './useWorkerPool';
import { useRuleWorker } from './useRuleWorker';

/** jsdom 不提供 Worker：用记录 postMessage 的替身替换 */
class MockWorker {
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onerror: ((event: { message: string }) => void) | null = null;
  static instances: MockWorker[] = [];
  posted: Array<{ id: number; task?: string; text: string }> = [];
  constructor() {
    MockWorker.instances.push(this);
  }
  postMessage(data: { id: number; task?: string; text: string }) {
    this.posted.push(data);
  }
  terminate() {
    /* noop */
  }
}

const postedAll = () => MockWorker.instances.flatMap((w) => w.posted);

beforeEach(() => {
  MockWorker.instances = [];
  vi.stubGlobal('Worker', MockWorker);
});

afterEach(() => {
  vi.unstubAllGlobals();
  MockWorker.instances = [];
});

describe('useWorkerPool · 引用稳定性（内存 5GB 回归）', () => {
  it('重渲染间返回同一对象引用（切断 loadDomainData 每帧执行链）', () => {
    const { result } = renderHook(() => {
      const [, force] = useState(0);
      const pool = useWorkerPool();
      return { pool, force };
    });
    const first = result.current.pool;

    act(() => {
      result.current.force(1);
    });

    expect(result.current.pool).toBe(first);
  });
});

describe('useWorkerPool · 并行解析单飞', () => {
  it('同一份文本的重复请求复用进行中的任务，只派发一轮分片', () => {
    const { result } = renderHook(() => useWorkerPool());
    const pool = result.current;
    const text = Array.from({ length: 400 }, (_, i) => `d${i}.example.com`).join('\n');

    let p1!: Promise<unknown>;
    let p2!: Promise<unknown>;
    act(() => {
      p1 = pool.runParallel(text, 4);
      p2 = pool.runParallel(text, 4);
    });

    // 复用同一 promise，且只派发一轮分片（否则每帧克隆整块文本 → 内存暴涨）
    expect(p2).toBe(p1);
    expect(postedAll()).toHaveLength(4);
  });

  it('文本变化时作废旧任务：旧任务以 null 结算，不会把旧结果当作新输入的结果', async () => {
    const { result } = renderHook(() => useWorkerPool());
    const pool = result.current;
    const textA = Array.from({ length: 400 }, (_, i) => `a${i}.example.com`).join('\n');
    const textB = Array.from({ length: 400 }, (_, i) => `b${i}.example.com`).join('\n');

    let p1!: Promise<unknown>;
    let p2!: Promise<unknown>;
    act(() => {
      p1 = pool.runParallel(textA, 4);
      p2 = pool.runParallel(textB, 4);
    });

    expect(p2).not.toBe(p1);
    await expect(p1).resolves.toBeNull();
  });
});

describe('useRuleWorker · 串行路径单飞', () => {
  it('同一份文本的重复请求只 postMessage 一次', () => {
    const { result } = renderHook(() => useRuleWorker());
    const { run } = result.current;
    const text = 'single.example.com';

    act(() => {
      void run('parse', text);
      void run('parse', text);
    });

    // 未单飞时会有 2 次 postMessage（每次克隆整块文本）
    expect(postedAll()).toHaveLength(1);
  });

  it('文本变化时作废旧任务，旧调用方收到 null（过期丢弃）', async () => {
    const { result } = renderHook(() => useRuleWorker());
    const { run } = result.current;

    let p1!: Promise<{ kind: string } | null>;
    act(() => {
      p1 = run('parse', 'old.example.com');
    });
    act(() => {
      void run('parse', 'new.example.com');
    });

    await expect(p1).resolves.toBeNull();
  });
});
