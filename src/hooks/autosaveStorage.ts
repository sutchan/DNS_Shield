// src/hooks/autosaveStorage.ts v3.8.0
// 自动保存（autosave）的 localStorage 读写与 schema 校验纯逻辑，
// 从 useDomainData 抽离以保持单一职责，主 hook 仅负责编排。

// 自动保存内容字符上限（与 domainFetch 的 10MB 字节上限同量级，防止 localStorage 脏数据撑爆内存）
export const AUTOSAVE_MAX_LENGTH = 5_000_000;

export const AUTOSAVE_KEY = 'dnsShield_autosave';
export const AUTOSAVE_TIME_KEY = 'dnsShield_autosave_time';

// 校验 localStorage 自动保存内容是否为合法字符串且长度合理，拒绝脏数据
export const isValidAutosave = (value: unknown): value is string => {
  return typeof value === 'string' && value.length > 0 && value.length <= AUTOSAVE_MAX_LENGTH;
};

// 安全读取自动保存文本：隐私模式下 localStorage 不可用则静默返回 null
export const readAutosave = (): string | null => {
  try {
    const value = localStorage.getItem(AUTOSAVE_KEY);
    return isValidAutosave(value) ? value : null;
  } catch {
    return null;
  }
};

// 读取并校验自动保存时间戳（仅接受纯数字字符串）
export const readAutosaveTime = (): number | null => {
  try {
    const raw = localStorage.getItem(AUTOSAVE_TIME_KEY);
    if (raw && /^\d+$/.test(raw)) {
      return parseInt(raw, 10);
    }
  } catch {
    /* 隐私模式不可用 */
  }
  return null;
};

// 写入自动保存文本与时间戳
export const writeAutosave = (text: string): void => {
  try {
    localStorage.setItem(AUTOSAVE_KEY, text);
    localStorage.setItem(AUTOSAVE_TIME_KEY, Date.now().toString());
  } catch {
    /* 隐私模式不可用 */
  }
};

// 清除自动保存文本与时间戳
export const clearAutosave = (): void => {
  try {
    localStorage.removeItem(AUTOSAVE_KEY);
    localStorage.removeItem(AUTOSAVE_TIME_KEY);
  } catch {
    /* localStorage 不可用时忽略 */
  }
};
