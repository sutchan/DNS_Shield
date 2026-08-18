// scripts/gen-icons.mjs v3.7.43
// 从盾牌母版 (public/favicon.svg，与 public/logo.svg 盾牌逐像素一致) 重新生成 PWA 图标。
// 蓝盾 #0D5FE2 + 白勾，正方形留白居中 (12.5% 安全边距，maskable 友好)。
// 依赖 sharp：执行前需 `npm i -D sharp`（本仓库用 pnpm-lock，sharp 装于临时目录亦可）。
// 用法：node scripts/gen-icons.mjs
import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const SRC = path.join(ROOT, 'public/favicon.svg');
const OUT_DIR = path.join(ROOT, 'public/assets/icons');

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

async function render(size) {
  const pad = Math.round(size * 0.125);
  const inner = size - pad * 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="none"/>
  <g transform="translate(${pad},${pad})">
    <svg width="${inner}" height="${inner}" viewBox="0 0 24 24">
      <path d="M12 2 4 5v7c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5l-8-3z" fill="#0D5FE2"/>
      <path d="M8.5 12.2l2.3 2.3 4.4-4.4" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </g>
</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(OUT_DIR, `icon-${size}x${size}.png`));
  console.log(`generated icon-${size}x${size}.png`);
}

await Promise.all(SIZES.map(render));
console.log('done');
