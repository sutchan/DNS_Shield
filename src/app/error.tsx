// src/app/error.tsx v3.20.1
// 客户端错误边界：捕获 Home 客户端树的渲染/事件异常（Next.js App Router 约定文件）。
// 使用内联中英文而非 i18n：语言包加载失败本身可能是异常源，错误页须零依赖可用。
'use client';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  return (
    <main id="error-page" className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold">页面出错了 / Something went wrong</h1>
      <p className="text-sm text-muted-foreground">
        应用遇到意外错误，可尝试重新加载。若持续出现，请通过 GitHub Issues 反馈。
        <br />
        An unexpected error occurred. Try again; if it persists, please report via GitHub Issues.
      </p>
      {error.digest && (
        <code className="rounded bg-muted px-2 py-1 text-xs" id="error-digest">{error.digest}</code>
      )}
      <div className="flex gap-3">
        <button
          type="button"
          id="error-retry"
          onClick={() => reset()}
          className="rounded bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
        >
          重试 / Try again
        </button>
        <a
          href="/"
          id="error-home"
          className="rounded border border-border px-4 py-2 hover:bg-muted"
        >
          返回首页 / Back home
        </a>
      </div>
    </main>
  );
}
