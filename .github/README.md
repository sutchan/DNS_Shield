# .github 目录

本目录存放 DNS Shield 的 **Community Health Files**（社区健康文件）与 GitHub 协作配置，集中管理项目的治理与协作规范。

## 文件说明

| 文件 | 说明 |
|------|------|
| `CODE_OF_CONDUCT.md` | 行为准则（Contributor Covenant 2.1）。GitHub 在仓库「Code of conduct」自动识别 |
| `CONTRIBUTING.md` | 贡献指南：报告问题、提交代码、开发/维护流程。GitHub 在「Contribute」自动识别 |
| `SECURITY.md` | 安全指南与漏洞报告流程。GitHub 在「Security policy」自动识别 |
| `SUPPORT.md` | 支持指南：常见问题、故障排除、技术支持。GitHub 在「Support」自动识别 |
| `FUNDING.yml` | 赞助商/资助配置（GitHub Sponsors） |
| `PULL_REQUEST_TEMPLATE.md` | 创建 Pull Request 时自动填充的模板 |
| `ISSUE_TEMPLATE/` | Issue 模板目录 |
| `ISSUE_TEMPLATE/config.yml` | Issue 模板全局配置（禁用空白 issue、联系链接） |
| `ISSUE_TEMPLATE/bug_report.md` | Bug 报告模板 |
| `ISSUE_TEMPLATE/feature_request.md` | 功能请求模板 |

## 说明

GitHub 会按以下优先级识别 Community Health Files：仓库根目录 → `.github/` 目录 → `docs/` 目录。本项目统一将此类文件置于 `.github/`，便于集中维护，相关文档内部引用请使用对应文件名（如 `SECURITY.md`）。
