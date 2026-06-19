# DNS Shield - 任务清单

> 版本: v2.3.0 | 最后更新: 2024-06-19 | 状态: 执行中

---

## 一、本次迭代任务（v2.3.0）

### 1.1 设计系统重构
- [x] 重组 `/prototype` 目录结构
  - 创建 `ASSETS/icons/` 和 `ASSETS/images/` 子目录
  - 更新 `DESIGN_SYSTEM.md` 为极简风格
  - 创建 `COMPONENT_LIBRARY.md` 组件库规范
  - 创建 `INTERACTION_STANDARDS.md` 交互标准
- [x] 设计系统更新
  - 极简国际顶尖设计师水准（Apple/Linear/Vercel 风格）
  - 11级灰阶色彩系统
  - Inter + JetBrains Mono 字体
  - 4px 基准间距系统
  - 微妙动效曲线

### 1.2 高保真原型
- [x] 重构 `prototype.html`
  - 1027 行代码（控制在 2000 行以内）
  - 完整交互功能（URL 预设、解析、格式切换、复制下载）
  - 深色/浅色模式切换
  - 15 种语言支持
  - 响应式布局（桌面双栏/移动端单栏）
  - Toast 提示系统
  - 面板折叠展开

### 1.3 shadcn/ui 集成
- [x] 更新 `package.json`
  - 添加 class-variance-authority、clsx、tailwind-merge
  - 添加 @radix-ui/* 组件库
  - 添加 lucide-react 图标库
  - 添加 tailwindcss-animate
- [x] 更新 `tailwind.config.js`
  - 配置 darkMode: ["class"]
  - 添加 shadcn/ui 完整颜色系统
  - 配置动画关键帧
- [x] 创建 `src/lib/utils.ts`
  - 实现 cn() 函数
- [x] 更新 `src/app/globals.css`
  - 添加 HSL CSS 变量
  - 配置 light/dark 模式颜色
- [x] 创建 shadcn/ui 基础组件
  - Button.tsx（5 种变体 + 4 种尺寸）
  - Card.tsx（CardHeader/Content/Footer）
  - Input.tsx、Label.tsx、Select.tsx
  - Tabs.tsx、Switch.tsx、Checkbox.tsx
  - Dialog.tsx、DropdownMenu.tsx、Toast.tsx
  - Tooltip.tsx、Badge.tsx、Skeleton.tsx

### 1.4 安全加固
- [x] 移除 CSP 中的 `unsafe-eval`
- [x] 添加 URL 长度限制（2048 字符）
- [x] 修复 `Home.tsx` 中的 `as any` 类型断言
- [x] 确认 URL 验证流程完善
- [x] 更新 `security_best_practices_report.md`

### 1.5 文档同步
- [x] 创建 `openspec/SPEC.md` 技术规格说明书
- [ ] 创建 `openspec/TASKS.md` 任务清单（本文档）
- [ ] 创建 `openspec/CHECKLIST.md` 审查清单
- [ ] 创建 `openspec/config.yaml` 配置文件

---

## 二、待办任务

### 2.1 高优先级
- [ ] 将现有组件迁移到 shadcn/ui 组件
  - InputPanel.tsx → 使用 shadcn Input、Button
  - OutputPanel.tsx → 使用 shadcn Card、Tabs
  - Header.tsx → 使用 shadcn DropdownMenu、Switch
- [ ] 更新 Home.tsx 适配新的 shadcn/ui 组件
- [ ] 运行 `npm install` 安装新依赖
- [ ] 运行 lint 和 typecheck 验证
- [ ] 全面功能测试

### 2.2 中优先级
- [ ] 优化深色模式样式
- [ ] 添加更多预设域名源
- [ ] 优化移动端触控体验
- [ ] 添加键盘快捷键
- [ ] 添加域名导入/导出功能

### 2.3 低优先级
- [ ] 添加更多动画效果
- [ ] 优化加载性能
- [ ] 添加 PWA 支持
- [ ] 添加离线模式
- [ ] 添加数据分析功能

---

## 三、技术债务

### 3.1 代码质量
- [ ] 统一所有组件使用 shadcn/ui 风格
- [ ] 移除重复的 CSS 样式
- [ ] 统一使用 TypeScript 严格模式
- [ ] 添加更多类型注解

### 3.2 测试
- [ ] 添加单元测试（useDomainData、useUrlManager）
- [ ] 添加集成测试
- [ ] 添加 E2E 测试
- [ ] 添加视觉回归测试

### 3.3 文档
- [ ] 更新 API 文档
- [ ] 添加贡献指南
- [ ] 添加部署文档
- [ ] 添加故障排除指南

---

## 四、已完成的任务

### v2.2.x 系列
- [x] 实现基础域名解析功能
- [x] 实现 Dnsmasq/Hosts/AdGuard 格式生成
- [x] 实现 URL 加载功能
- [x] 实现主题切换（浅色/深色）
- [x] 实现多语言支持（15 种语言）
- [x] 实现响应式布局
- [x] 添加安全头部配置
- [x] 添加 URL 协议验证
- [x] 添加 HTTP 请求超时控制

---

## 五、里程碑

| 里程碑 | 目标日期 | 状态 |
|--------|----------|------|
| 设计系统重构完成 | 2024-06-19 | ✅ |
| shadcn/ui 集成完成 | 2024-06-19 | ✅ |
| 安全审查通过 | 2024-06-19 | ✅ |
| 组件迁移完成 | TBD | ⏳ |
| lint/typecheck 通过 | TBD | ⏳ |
| 功能测试通过 | TBD | ⏳ |
| 文档同步完成 | TBD | ⏳ |

---

*本文档与 SPEC.md 和原型保持同步*
