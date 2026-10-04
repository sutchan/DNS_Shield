// src/workers/ruleProcessor.worker.ts v3.11.0
// 规则处理 Worker：将大文本的解析 / 排序 / 去重移出主线程，
// 避免导入 10 万+ 条域名时阻塞 UI 渲染；解析过程按行数分片上报进度。
// 注意：此处刻意不引入 webworker lib（与 dom lib 存在全局类型冲突），
// 仅以最小结构化类型描述 Worker 全局作用域。

import { parseSource } from '../utils/parser';
import { sortDomains, dedupeDomains } from '../utils/sortDedupe';
import type { ParsedData } from '../types';
import type { ParseStats } from '../types/formats';

export type RuleWorkerTask = 'parse' | 'sort' | 'dedupe';

export interface RuleWorkerRequest {
  id: number;
  task: RuleWorkerTask;
  text: string;
}

export type RuleWorkerResponse =
  | { id: number; kind: 'progress'; processed: number; total: number }
  | { id: number; kind: 'parsed'; data: ParsedData; stats: ParseStats; elapsed: number }
  | { id: number; kind: 'text'; text: string; removedCount?: number; elapsed: number }
  | { id: number; kind: 'error'; message: string };

// Worker 全局作用域的最小结构（避免依赖 webworker lib 类型）
interface WorkerScope {
  onmessage: ((event: MessageEvent<RuleWorkerRequest>) => void) | null;
  postMessage: (message: unknown) => void;
}

const ctx = self as unknown as WorkerScope;

ctx.onmessage = (event: MessageEvent<RuleWorkerRequest>) => {
  const { id, task, text } = event.data;
  const startedAt = Date.now();
  try {
    if (task === 'parse') {
      const { data, stats } = parseSource(text, (processed, total) => {
        ctx.postMessage({ id, kind: 'progress', processed, total } satisfies RuleWorkerResponse);
      });
      ctx.postMessage({
        id,
        kind: 'parsed',
        data,
        stats,
        elapsed: Date.now() - startedAt
      } satisfies RuleWorkerResponse);
      return;
    }

    if (task === 'sort') {
      ctx.postMessage({
        id,
        kind: 'text',
        text: sortDomains(text),
        elapsed: Date.now() - startedAt
      } satisfies RuleWorkerResponse);
      return;
    }

    const { content, removedCount } = dedupeDomains(text);
    ctx.postMessage({
      id,
      kind: 'text',
      text: content,
      removedCount,
      elapsed: Date.now() - startedAt
    } satisfies RuleWorkerResponse);
  } catch (error) {
    ctx.postMessage({
      id,
      kind: 'error',
      message: error instanceof Error ? error.message : String(error)
    } satisfies RuleWorkerResponse);
  }
};
