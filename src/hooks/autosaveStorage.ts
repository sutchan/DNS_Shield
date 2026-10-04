// src/hooks/autosaveStorage.ts v3.11.0
// 自动保存存储层：以 IndexedDB 为主（突破 LocalStorage 5MB 上限，支撑超长规则列表），
// 不可用时（SSR / 隐私模式 / 配额超限）自动降级 localStorage，保证功能不中断。
// 读取时若 IndexedDB 尚无数据而 localStorage 存有旧草稿，会一次性迁移到 IndexedDB。

import { idbGet, idbSet, idbDelete, STORE_KV } from '../utils/idb';

/** IndexedDB 通道的字符上限（远大于 localStorage 5MB） */
export const AUTOSAVE_MAX_LENGTH = 50_000_000;
/** 旧版 localStorage 通道上限，用于降级写入与旧数据迁移校验 */
export const LEGACY_MAX_LENGTH = 5_000_000;

export const AUTOSAVE_KEY = 'dnsShield_autosave';
export const AUTOSAVE_TIME_KEY = 'dnsShield_autosave_time';
/** 迁移标记：确保旧 localStorage 草稿只迁移一次，避免每次挂载重复搬运 */
const MIGRATED_KEY = 'dnsShield_autosave_migrated';

// 校验自动保存内容是否为合法字符串且长度合理，拒绝脏数据
export const isValidAutosave = (value: unknown): value is string => {
  return typeof value === 'string' && value.length > 0 && value.length <= AUTOSAVE_MAX_LENGTH;
};

// localStorage 安全读写（降级路径与迁移来源，隐私模式下静默失败）
const lsGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const lsSet = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* 配额超限时忽略 */
  }
};

const lsDel = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    /* 忽略 */
  }
};

const isLegacyValid = (value: unknown): value is string => {
  return typeof value === 'string' && value.length > 0 && value.length <= LEGACY_MAX_LENGTH;
};

// 解析时间戳：仅接受纯数字字符串，非法值返回 null
const parseTime = (raw: string | null): number | null => {
  if (raw && /^\d+$/.test(raw)) {
    return parseInt(raw, 10);
  }
  return null;
};

/**
 * 读取自动保存正文：IndexedDB 优先；miss 时回退 localStorage，
 * 并在首次遇到旧草稿时将其迁移进 IndexedDB。
 */
export const readAutosave = async (): Promise<string | null> => {
  const fromIdb = await idbGet<string>(STORE_KV, AUTOSAVE_KEY);
  if (isValidAutosave(fromIdb)) {
    return fromIdb;
  }

  const legacy = lsGet(AUTOSAVE_KEY);
  if (!isLegacyValid(legacy)) {
    return null;
  }

  const migrated = await idbGet<boolean>(STORE_KV, MIGRATED_KEY);
  if (!migrated) {
    await idbSet(STORE_KV, AUTOSAVE_KEY, legacy);
    await idbSet(STORE_KV, MIGRATED_KEY, true);
  }
  return legacy;
};

/** 读取并校验自动保存时间戳（IndexedDB 优先，旧值顺带回填） */
export const readAutosaveTime = async (): Promise<number | null> => {
  const idbTime = parseTime(await idbGet<string>(STORE_KV, AUTOSAVE_TIME_KEY));
  if (idbTime !== null) {
    return idbTime;
  }
  const legacyTime = parseTime(lsGet(AUTOSAVE_TIME_KEY));
  if (legacyTime !== null) {
    await idbSet(STORE_KV, AUTOSAVE_TIME_KEY, String(legacyTime));
  }
  return legacyTime;
};

/** 写入自动保存正文与时间戳：IndexedDB 失败时降级 localStorage */
export const writeAutosave = async (text: string): Promise<void> => {
  const now = Date.now().toString();
  const stored = await idbSet(STORE_KV, AUTOSAVE_KEY, text);
  if (stored) {
    await idbSet(STORE_KV, AUTOSAVE_TIME_KEY, now);
    return;
  }
  // 降级路径仅能承载 5MB，超长内容直接放弃以免抛错
  if (isLegacyValid(text)) {
    lsSet(AUTOSAVE_KEY, text);
    lsSet(AUTOSAVE_TIME_KEY, now);
  }
};

/** 清除自动保存正文与时间戳（两处存储同时清理，避免旧内容复现） */
export const clearAutosave = async (): Promise<void> => {
  await idbDelete(STORE_KV, AUTOSAVE_KEY);
  await idbDelete(STORE_KV, AUTOSAVE_TIME_KEY);
  lsDel(AUTOSAVE_KEY);
  lsDel(AUTOSAVE_TIME_KEY);
};
