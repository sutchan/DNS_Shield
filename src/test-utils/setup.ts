// src/test-utils/setup.ts v3.13.6
// 测试环境补齐桩：jsdom 在某些 Node / vitest 版本下对 opaque origin
// 不提供 localStorage，导致直接调用 localStorage.clear() 的用例抛
// "Cannot read properties of undefined (reading 'clear')"。
// 这里注入一个最小内存实现，保证所有 hook 测试有一致的 localStorage。
// matchMedia 同样补齐默认桩（返回非深色），单测可按需 vi.stubGlobal 覆盖。
class MemoryStorage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? (this.store.get(key) as string) : null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

if (typeof (globalThis as { localStorage?: unknown }).localStorage === 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: new MemoryStorage(),
    configurable: true,
    writable: true,
  });
}

if (typeof (globalThis as { matchMedia?: unknown }).matchMedia === 'undefined') {
  Object.defineProperty(globalThis, 'matchMedia', {
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
    configurable: true,
    writable: true,
  });
}
