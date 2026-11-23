// src/app/global-error.tsx v3.20.1
// 根布局级错误边界：捕获 layout / 全局脚本异常，须自带 <html>/<body>（Next.js 约定）。
'use client';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="zh-CN">
      <body id="global-error-body">
        <main id="global-error-page" className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-2xl font-bold">应用加载失败 / Application failed to load</h1>
          <p className="text-sm">
            请刷新页面重试。若持续失败，请通过 GitHub Issues 反馈。
            <br />
            Please refresh to retry. If it persists, report via GitHub Issues.
          </p>
          {error.digest && <code className="text-xs" id="global-error-digest">{error.digest}</code>}
          <button
            type="button"
            id="global-error-retry"
            onClick={() => reset()}
            className="rounded bg-primary px-4 py-2 text-primary-foreground"
          >
            重试 / Try again
          </button>
        </main>
      </body>
    </html>
  );
}
