// src/hooks/useFlowTokens.ts v3.9.1
// 流量可视化 token 动画状态：按真实解析数据抽样，定时生成下落 token。
import { useEffect, useMemo, useRef, useState } from 'react';
import { ParsedData } from '../types';
import { buildFlowPool, FlowPoolItem } from '../utils/buildFlowPool';

const SPAWN_INTERVAL = 650;          // ms，对齐原型 spawn 频率
const TOKEN_LIFETIME = 3600;         // ms，token 存活时间（animation + 缓冲）
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

interface FlowToken {
  id: number;
  name: string;
  kind: FlowPoolItem['kind'];
  left: string;
  duration: string;
}

export function useFlowTokens(parsedData: ParsedData) {
  const pool = useMemo(() => buildFlowPool(parsedData), [parsedData]);
  const [tokens, setTokens] = useState<FlowToken[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    if (pool.length === 0) {
      setTokens([]);
      return undefined;
    }

    const reduced =
      typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION_QUERY).matches;
    if (reduced) return undefined;

    const timer = window.setInterval(() => {
      const item = pool[Math.floor(Math.random() * pool.length)];
      const nextId = (idRef.current += 1);
      const left = `${6 + Math.random() * 70}%`;
      const duration = `${2.2 + Math.random() * 1.2}s`;
      const token: FlowToken = {
        id: nextId,
        name: item.name,
        kind: item.kind,
        left,
        duration,
      };
      setTokens((prev) => [...prev, token]);

      window.setTimeout(() => {
        setTokens((prev) => prev.filter((t) => t.id !== nextId));
      }, TOKEN_LIFETIME);
    }, SPAWN_INTERVAL);

    return () => window.clearInterval(timer);
  }, [pool]);

  return tokens;
}
