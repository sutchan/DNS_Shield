// src/app/loading.tsx v3.20.1
// 路由切换加载态：Next.js 约定文件，避免导航期间白屏。
export default function Loading() {
  return (
    <main id="route-loading" className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-3 px-6 text-center" role="status" aria-live="polite">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">加载中 / Loading...</p>
    </main>
  );
}
