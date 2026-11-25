# 临时文件管理规范

> 权威级别：规范 · 适用版本：v3.21.0 起 · 最后审查：2026-11-25
> 门禁实现：`scripts/check-root-clean.mjs`（CI `rootclean` job） · 管理工具：`scripts/manage-tmp.mjs`

## 1. 唯一合法临时目录

仓库根目录下的 **`.tmp/`** 是**唯一**允许存放临时文件的位置。该目录已被 `.gitignore` 忽略，且由门禁与管理脚本自动创建。

**禁止**在以下位置创建临时文件：

- 仓库根目录（如 `_scan.mjs`、`preview.log`、`_build.txt`、`*.tsbuildinfo`）
- `scripts/` 正式工具目录（`_*.mjs` 一次性脚本一律违规）
- `src/`、`docs/`、`public/` 等正式目录

约定子目录（由管理工具自动创建，按需取用）：

| 子目录 | 用途 |
|--------|------|
| `.tmp/scripts/` | 一次性探针、诊断脚本、中间产物 |
| `.tmp/logs/` | 运行日志（`vitest`、`lint`、`build`、预览服务重定向输出） |
| `.tmp/cache/` | 构建缓存（如 `tsconfig.tsbuildinfo` 指定到此） |
| `.tmp/downloads/` | 临时下载文件 |
| `.tmp/test-output/` | 测试输出、覆盖率报告（可覆写 `coverage/` 到此） |

## 2. 自动创建与清理

```bash
npm run tmp:init     # 创建 .tmp/ 及全部约定子目录（幂等，可重复执行）
npm run tmp:clean    # 清空 .tmp/ 内容并重建空子目录
node scripts/check-root-clean.mjs   # 门禁自检：根目录有散落临时文件即失败
```

- `check-root-clean.mjs` 在 CI `rootclean` job 中于 CI Gate 聚合前执行；开发者提交前应本地自检。
- `.tmp/` 内容随时可删，不影响构建与测试；会话结束建议执行 `npm run tmp:clean`。

## 3. 例外（不属于本规范约束范围）

以下 `/tmp/` 路径**不是**仓库临时文件，保留原样：

- `src/utils/scriptGenerator.ts` 生成的 OpenWrt / Merlin / Padavan / SmartDNS / Pi-hole Shell 脚本中的 `TMP_FILE="/tmp/..."`：这是**目标路由器设备**上的运行时临时路径，属于业务产物内容，不写入本仓库文件系统。

```gitignore
# .gitignore 中的临时文件规则统一收敛为一条目录级忽略：
.tmp/
.tmp/**
```

散落在根目录的 `*.log`、`*.err`、`*.tmp`、`*.tsbuildinfo` 等即使被旧规则忽略，门禁仍会判定为违规——「被忽略」不等于「被允许」。

## 4. 迁移指引

发现根目录散落临时文件时：

```bash
# 示例：把预览日志归位
mv preview.log preview.err .tmp/logs/
# 示例：把一次性脚本归位
mv _probe.mjs .tmp/scripts/
# 示例：TS 增量缓存（优先配置 tsBuildInfoFile 指向 .tmp/cache/，而非手工搬移）
```

长期证据（如审计报告、验收记录）应写入 `docs/` 或固化为测试断言，不留在 `.tmp/`。

## 5. 判定逻辑（门禁）

`check-root-clean.mjs` 采用白名单制：

1. `.git`、`.tmp` 与白名单中的合法根条目直接放行；
2. 根目录命中临时文件特征（`_*.mjs`、`*.log`、`*.err`、`*.tsbuildinfo`、`preview-*` 等）→ **违规**，即使已被 `.gitignore` 忽略；
3. `scripts/` 下的 `_*` 脚本 → **违规**；
4. 其他未被忽略且不在白名单的根级条目 → 违规。

修正提示会明确给出目标子目录路径，便于一键归位。
