// src/hooks/useRuleWorker.parallel.ts v3.22.4
// 超大文本 parse 的多核分片派发（从 useRuleWorker.ts 拆出，T-REFACTOR-01）。
// 仅负责调度与进度回传；状态复位与串行兜底仍由主 hook 编排。
import { decideShardCount, PARALLEL_PARSE_THRESHOLD } from '../utils/parseAggregate';
import type { useWorkerPool } from './useWorkerPool';

type Pool = ReturnType<typeof useWorkerPool>;
type PoolResult = Awaited<ReturnType<Pool['runParallel']>>;
type ProgressSetter = (value: { processed: number; total: number; elapsed: number | null }) => void;

export const shouldUseParallelParse = (task: string, lineCount: number): boolean =>
  task === 'parse' && lineCount >= PARALLEL_PARSE_THRESHOLD;

export const runParallelParse = async (
  pool: Pool,
  text: string,
  lineCount: number,
  setProgress: ProgressSetter
): Promise<PoolResult> => {
  const cores = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 1 : 1;
  return pool.runParallel(
    text,
    decideShardCount(lineCount, cores),
    (p) => setProgress({ processed: p.processed, total: p.total, elapsed: null })
  );
};
