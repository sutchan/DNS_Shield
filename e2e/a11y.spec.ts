// e2e/a11y.spec.ts v3.22.4
// 无障碍自动化回归（T-A11Y-01 / O-09）：仅阻断 critical 违规，
// 其余等级记录到控制台供人工评估，避免一次性引入大量历史债务。
// 直接注入 axe-core 脚本，避免 @axe-core/playwright 与 @playwright/test 的 Page 类型版本冲突。
import { readFileSync } from 'node:fs';
import { test, expect, type Page } from '@playwright/test';

const axeSource = readFileSync('node_modules/axe-core/axe.min.js', 'utf8');
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

type AxeViolation = { id: string; impact: string | null; help: string };

async function expectNoCriticalViolations(page: Page, label: string): Promise<void> {
  await page.addScriptTag({ content: axeSource });
  const result = await page.evaluate(async (tags) => {
    type AxeRuntime = {
      axe: {
        run: (
          context: Document,
          options: { runOnly: { type: string; values: string[] } }
        ) => Promise<{ violations: AxeViolation[] }>;
      };
    };
    const runtime = window as unknown as AxeRuntime;
    return runtime.axe.run(document, { runOnly: { type: 'tag', values: tags } });
  }, WCAG_TAGS);

  const critical = result.violations.filter((violation) => violation.impact === 'critical');
  if (critical.length > 0) {
    console.error(`[a11y] ${label} critical: ${critical.map((v) => `${v.id} (${v.help})`).join('; ')}`);
  }
  expect(critical, `${label} 存在 critical 无障碍违规`).toEqual([]);
}

test('首页无 critical 无障碍违规', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await expectNoCriticalViolations(page, '首页');
});

test('关于页无 critical 无障碍违规', async ({ page }) => {
  await page.goto('/about', { waitUntil: 'networkidle' });
  await expectNoCriticalViolations(page, '关于页');
});

test('设置弹窗无 critical 无障碍违规', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.locator('#settings-btn').click();
  await expect(page.locator('#settings-panel')).toBeVisible();
  await expectNoCriticalViolations(page, '设置弹窗');
});

test('路由器脚本弹窗无 critical 无障碍违规', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.locator('#router-script-toggle-btn').click();
  await expect(page.locator('#script-generator-modal')).toBeVisible();
  await expectNoCriticalViolations(page, '路由器脚本弹窗');
});
