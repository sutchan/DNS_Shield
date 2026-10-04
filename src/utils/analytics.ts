// src/utils/analytics.ts v3.10.3
// Google Analytics 4 衡量 ID 的读取、校验与初始化片段生成（纯逻辑，无副作用，便于单测）。
//
// 设计约束：
//   1. 衡量 ID **只**来自环境变量 NEXT_PUBLIC_GA_MEASUREMENT_ID，源码内不保留任何真实/兜底 ID；
//   2. 缺失（未配置 / 空串）或格式非法时安全降级为「不启用统计」，不抛错、不发起无效请求；
//   3. 校验通过后统一去空白 + 大写归一，避免小写或多余空白导致 GA4 侧静默失效；
//   4. 内联脚本中的 ID 经 JSON.stringify 转义，杜绝引号/反斜杠引发的脚本注入与语法错误。
//
// 注意：环境变量必须以字面量 `process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID` 形式引用，
// Next.js 构建期才能内联；用变量键动态取值会拿到空对象导致统计被误停用。
import { logger } from './logger';

/** 环境变量名（NEXT_PUBLIC_ 前缀保证构建期内联进客户端产物） */
export const GA_MEASUREMENT_ID_ENV = 'NEXT_PUBLIC_GA_MEASUREMENT_ID';

/** GA4 衡量 ID 格式：G- 前缀 + 4~32 位大写字母或数字 */
const GA_MEASUREMENT_ID_PATTERN = /^G-[A-Z0-9]{4,32}$/;

/** gtag 脚本地址模板 */
const GTAG_SCRIPT_URL = 'https://www.googletagmanager.com/gtag/js?id=';

/** 衡量 ID 不可用的原因 */
export type GaDisabledReason = 'missing' | 'invalid';

/** 衡量 ID 解析结果 */
export interface GaResolution {
  /** 是否启用统计脚本注入 */
  enabled: boolean;
  /** 归一化后的衡量 ID；未启用时为 null */
  measurementId: string | null;
  /** 启用时恒为 'env'；未启用时为缺失/非法原因 */
  reason: 'env' | GaDisabledReason;
  /** 非法值的诊断说明（仅含长度等元信息，不回显原始值） */
  detail?: string;
}

/** 去首尾空白并统一大写（GA4 衡量 ID 不区分大小写书写，但规范形式为大写） */
export function normalizeGaMeasurementId(raw: string): string {
  return raw.trim().toUpperCase();
}

/** 校验衡量 ID 是否为合法 GA4 格式 */
export function isValidGaMeasurementId(raw: string | null | undefined): boolean {
  if (typeof raw !== 'string') return false;
  return GA_MEASUREMENT_ID_PATTERN.test(normalizeGaMeasurementId(raw));
}

/**
 * 解析衡量 ID 原始值：
 * - 非字符串 / 空串 / 纯空白 → 判定为「未配置」，禁用统计；
 * - 不匹配 G-XXXX 格式 → 判定为「配置错误」，禁用统计并给出诊断说明；
 * - 合法 → 返回归一化后的 ID。
 */
export function resolveGaMeasurementId(raw: string | null | undefined): GaResolution {
  if (typeof raw !== 'string' || raw.trim() === '') {
    return { enabled: false, measurementId: null, reason: 'missing' };
  }
  const normalized = normalizeGaMeasurementId(raw);
  if (!GA_MEASUREMENT_ID_PATTERN.test(normalized)) {
    return {
      enabled: false,
      measurementId: null,
      reason: 'invalid',
      detail: `期望 G- 前缀 + 4~32 位大写字母或数字，实际值长度为 ${raw.trim().length}`,
    };
  }
  return { enabled: true, measurementId: normalized, reason: 'env' };
}

/** 读取环境变量中的衡量 ID，并对未启用情形输出开发期诊断日志（生产环境由 logger 静默） */
export function readGaMeasurementIdFromEnv(): GaResolution {
  // 必须字面量引用，供 Next.js 构建期内联
  const resolution = resolveGaMeasurementId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
  if (!resolution.enabled) {
    logger.info(
      resolution.reason === 'missing'
        ? `[analytics] ${GA_MEASUREMENT_ID_ENV} 未配置，已跳过统计脚本注入`
        : `[analytics] ${GA_MEASUREMENT_ID_ENV} 配置非法（${resolution.detail}），已跳过统计脚本注入`
    );
  }
  return resolution;
}

/** 生成 gtag 加载脚本地址（ID 编码进 query，避免非法字符破坏 URL） */
export function buildGtagScriptUrl(measurementId: string): string {
  return `${GTAG_SCRIPT_URL}${encodeURIComponent(measurementId)}`;
}

/** 生成 gtag 初始化内联片段（ID 以 JSON 字符串字面量注入，天然免疫注入攻击） */
export function buildGtagSnippet(measurementId: string): string {
  const id = JSON.stringify(measurementId);
  return `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${id});`;
}
