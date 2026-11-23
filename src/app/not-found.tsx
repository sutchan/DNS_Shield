// src/app/not-found.tsx v3.20.1
// 404 页面：Next.js 约定文件，无效路径时给出可操作的返回入口。
import Link from 'next/link';

export default function NotFound() {
  return (
    <main id="not-found-page" className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold">404 - 页面不存在 / Page not found</h1>
      <p className="text-sm text-muted-foreground">
        该地址不存在或已被移动。
        <br />
        This page does not exist or has been moved.
      </p>
      <Link href="/" id="not-found-home" className="rounded bg-primary px-4 py-2 text-primary-foreground hover:opacity-90">
        返回首页 / Back home
      </Link>
    </main>
  );
}
