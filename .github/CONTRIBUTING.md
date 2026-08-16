# 贡献指南

欢迎参与 DNS Shield 项目的开发和维护！本指南将帮助你了解如何为项目做出贡献。

## 贡献方式

### 1. 报告问题

如果你发现了 bug 或有新功能建议，请在 GitHub 上创建一个 issue：

1. 访问 [GitHub Issues](https://github.com/sutchan/DNS_Shield/issues)
2. 点击 "New Issue"
3. 选择合适的模板（Bug 报告或功能请求）
4. 填写详细信息，包括：
   - 问题描述
   - 复现步骤
   - 预期行为
   - 实际行为
   - 环境信息（浏览器、操作系统等）
   - 相关截图或日志（如有）

### 2. 提交代码

如果你想直接修改代码并提交 PR，请按照以下步骤操作：

#### 2.1  Fork 仓库

1. 访问 [DNS Shield 仓库](https://github.com/sutchan/DNS_Shield)
2. 点击右上角的 "Fork" 按钮，将仓库复制到你的 GitHub 账户

#### 2.2  克隆仓库

```bash
# 克隆你 fork 的仓库
git clone https://github.com/YOUR_USERNAME/DNS_Shield.git

# 进入项目目录
cd DNS_Shield

# 添加 upstream 远程仓库
git remote add upstream https://github.com/sutchan/DNS_Shield.git
```

#### 2.3  创建分支

```bash
# 创建并切换到新分支
git checkout -b feature/your-feature-name
```

分支命名规范：
- 功能分支：`feature/功能名称`
- 修复分支：`fix/问题描述`
- 文档分支：`docs/文档名称`

#### 2.4  进行修改

根据你的贡献类型进行相应的修改：

- **添加/修改域名**：编辑 `domains.txt` 文件
- **修改 Web 管理工具**：编辑 `src/` 目录下的文件
- **更新文档**：编辑相应的文档文件

#### 2.5  测试修改

确保你的修改不会破坏现有功能：

1. 运行 Web 管理工具，测试基本功能
2. 生成规则文件，检查格式是否正确
3. 验证修改是否解决了问题

#### 2.6  提交更改

```bash
# 添加修改的文件
git add .

# 提交更改，使用规范的提交信息
git commit -m "feat: 添加新功能描述"  # 功能添加
# 或
git commit -m "fix: 修复问题描述"    # 问题修复
# 或
git commit -m "docs: 更新文档描述"    # 文档更新
```

提交信息规范：
- `feat: 描述` - 新功能
- `fix: 描述` - 修复问题
- `docs: 描述` - 文档更新
- `chore: 描述` - 其他更改
- `refactor: 描述` - 代码重构

#### 2.7  推送分支

```bash
# 推送分支到你的 fork
git push origin feature/your-feature-name
```

#### 2.8  创建 Pull Request

1. 访问你的 fork 仓库
2. 点击 "Compare & pull request"
3. 填写 PR 描述，包括：
   - 更改内容
   - 解决的问题（如果有）
   - 测试情况
4. 点击 "Create pull request"

## 开发流程

### 1. 环境设置

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 运行生产服务器
pnpm start
```

### 2. 代码规范

- 使用 TypeScript 进行开发
- 遵循 ESLint 规则
- 保持代码风格一致
- 添加必要的注释

### 3. 测试规范

- 确保所有功能正常工作
- 测试不同浏览器兼容性
- 验证生成的规则文件格式正确

## 维护流程

### 1. 域名管理

- **添加域名**：在 `domains.txt` 中添加新域名，遵循格式规范
- **删除域名**：从 `domains.txt` 中删除无效或过期的域名
- **更新规则**：使用 Web 管理工具生成更新后的规则文件

### 2. 版本发布

- 遵循 SemVer 版本号规范
- 更新 CHANGELOG.md
- 更新输出文件版本号
- 更新 README 版本号
- 创建 GitHub Release

## 行为准则

- 尊重其他贡献者
- 提供建设性的反馈
- 遵循项目的代码和文档规范
- 保持提交历史清晰

## 联系方式

如果有任何问题或建议，可以通过以下方式联系项目维护者：

- GitHub Issues：[https://github.com/sutchan/DNS_Shield/issues](https://github.com/sutchan/DNS_Shield/issues)

感谢你的贡献！