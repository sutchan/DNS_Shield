// src/hooks/workerPoolFinalize.test.ts v3.18.1
// 聚合收尾契约：正常路径与单线程 parseSource 等价；聚合异常必须返回 null 而非抛出，
// 否则 useWorkerPool 中已移出 tasksRef 的任务无法被 onerror / 卸载清理结算，上层 await 永挂。
import { describe, it, expect, vi } from 'vitest';
import { collectLines, finalizeParsed, parseSource } from '../utils/parser';
import { splitIntoShards } from '../utils/parseAggregate';
import { finalizeShardResults } from './workerPoolFinalize';

vi.mock('../utils/parser', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/parser')>();
  return { ...actual, finalizeParsed: vi.fn(actual.finalizeParsed) };
});

const collectShards = (text: string, count: number) =>
  splitIntoShards(text, count).map((shard) => collectLines(shard));

const sample = [
  '# 注释行',
  '+white.example.com',
  'a.example.com',
  'b.example.com',
  'white.example.com',
  'a.example.com'
].join('\n');

describe('finalizeShardResults', () => {
  it('分片聚合结果与单线程 parseSource 等价（跨分片白名单剔除 / 去重）', () => {
    const out = finalizeShardResults(collectShards(sample, 3), Date.now());
    expect(out).not.toBeNull();
    expect(out?.data.domains).toEqual(parseSource(sample).data.domains);
    expect(out?.stats.totalLines).toBe(parseSource(sample).stats.totalLines);
    expect(out?.elapsed).toBeGreaterThanOrEqual(0);
  });

  it('聚合阶段抛异常时返回 null，保证调用方 Promise 一定结算', () => {
    vi.mocked(finalizeParsed).mockImplementationOnce(() => {
      throw new Error('aggregation failed');
    });
    expect(finalizeShardResults(collectShards(sample, 2), Date.now())).toBeNull();
  });

  it('异常后不影响下一次正常聚合', () => {
    const out = finalizeShardResults(collectShards(sample, 2), Date.now());
    expect(out?.data.domains).toEqual(parseSource(sample).data.domains);
  });
});
