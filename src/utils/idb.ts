// src/utils/idb.ts v3.11.0
// 轻量 IndexedDB 封装：Promise 化读写，供自动保存与远程规则源缓存使用。
// 设计要点：
//   - 非浏览器环境（SSR）、隐私模式或配额禁用时统一降级为 null，由调用方回退 localStorage；
//   - 单例连接 + 惰性升级，避免重复 open 触发 onblocked；
//   - 所有 API 返回 Promise 且永不 reject，存储故障不阻断主流程。

export const DB_NAME = 'dns-shield';
export const DB_VERSION = 1;
/** 通用键值存储：自动保存草稿与时间戳 */
export const STORE_KV = 'kv';
/** 远程规则源缓存：正文 + ETag + 抓取时间 */
export const STORE_HTTP = 'httpCache';

let dbPromise: Promise<IDBDatabase | null> | null = null;

const isIndexedDbAvailable = (): boolean =>
  typeof window !== 'undefined' && typeof indexedDB !== 'undefined';

const openDb = (): Promise<IDBDatabase | null> => {
  if (!isIndexedDbAvailable()) return Promise.resolve(null);
  if (dbPromise) return dbPromise;
  dbPromise = new Promise<IDBDatabase | null>((resolve) => {
    let settled = false;
    const settle = (db: IDBDatabase | null) => {
      if (!settled) {
        settled = true;
        resolve(db);
      }
    };
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_KV)) db.createObjectStore(STORE_KV);
        if (!db.objectStoreNames.contains(STORE_HTTP)) db.createObjectStore(STORE_HTTP);
      };
      req.onsuccess = () => settle(req.result);
      req.onerror = () => settle(null);
      req.onblocked = () => settle(null);
    } catch {
      settle(null);
    }
  });
  return dbPromise;
};

/** 读取键值；记录不存在或 IndexedDB 不可用时返回 null */
export const idbGet = async <T>(storeName: string, key: string): Promise<T | null> => {
  const db = await openDb();
  if (!db) return null;
  return new Promise<T | null>((resolve) => {
    try {
      const req = db.transaction(storeName, 'readonly').objectStore(storeName).get(key);
      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
};

/** 写入键值；成功返回 true，配额超限等失败返回 false（调用方据此降级） */
export const idbSet = async (storeName: string, key: string, value: unknown): Promise<boolean> => {
  const db = await openDb();
  if (!db) return false;
  return new Promise<boolean>((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).put(value, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
};

/** 删除键值；成功返回 true */
export const idbDelete = async (storeName: string, key: string): Promise<boolean> => {
  const db = await openDb();
  if (!db) return false;
  return new Promise<boolean>((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).delete(key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
      tx.onabort = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
};

/** 仅供测试：重置连接单例，避免用例间共享连接 */
export const __resetIdbForTest = (): void => {
  dbPromise = null;
};
