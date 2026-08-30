<div align="center">
  <h1>◆ DearOreUI Docs</h1>
  <p><strong>为 OreUI 而生，为创作而定制。</strong></p>
  <p><a href="https://github.com/copper-lamp/Dear-OreUI">DearOreUI</a> 运行时的官方文档与学习站点——覆盖运行时、离线设计器与示例模组。</p>

  <p>
    <a href="https://copper-lamp.github.io/dearoreui-docs/">在线站点</a>
    ·
    <a href="content/guide/getting-started.mdx">开始使用</a>
    ·
    <a href="https://github.com/copper-lamp/Dear-OreUI">核心运行时</a>
    ·
    <a href="https://github.com/copper-lamp/DearOreUI-dev-tools">设计器</a>
    ·
    <a href="https://github.com/copper-lamp/dearoreui-docs/issues">问题反馈</a>
    ·
    <a href="README.md">English</a>
  </p>
</div>

文档按版本管理，覆盖发行版与指南共 130+ 页。

## 快速开始

> [!IMPORTANT]
> 开发环境需要 [Node.js](https://nodejs.org/)（Next.js 15 要求 18.18+）与 [pnpm](https://pnpm.io/)。

```powershell
cd Web
pnpm install   # 安装依赖（自动应用 nextra-theme-docs 补丁）
pnpm dev       # 启动开发服务器 → http://localhost:3000
```

`pnpm build` 生成生产构建，`pnpm start` 以生产模式运行。

## 技术栈

| 层 | 选型 | 说明 |
| --- | --- | --- |
| 框架 | Next.js 15（App Router） | 页面与动态路由 |
| 文档主题 | Nextra 4 + nextra-theme-docs | 导航树、代码高亮、页内目录 |
| 语言 | TypeScript + MDX | 内容与组件 |
| 依赖管理 | pnpm | `pnpm-workspace.yaml` 管理配置与补丁 |

## 项目结构

```text
Web/
├── app/                        # App Router
│   ├── layout.tsx              # 根布局：Layout/Navbar/Footer + getPageMap
│   └── [[...mdxPath]]/page.tsx # content 目录的统一动态路由入口
├── content/                    # MDX 内容目录（v4 默认）
│   ├── index.mdx               # 首页
│   └── guide/                  # 指南分组
│       ├── _meta.ts            # 分组导航元数据
│       └── getting-started.mdx
├── mdx-components.tsx          # 合并主题默认 MDX 组件（必需）
├── theme.config.tsx            # 主题配置：logo / projectLink / docsRepositoryBase / footer
├── patches/                    # pnpm 补丁（见「已知问题」）
├── pnpm-workspace.yaml         # patchedDependencies / allowBuilds
├── next.config.mjs             # nextra() 配置
└── tsconfig.json
```

## 内容链路

```text
content/*.mdx
   │  Nextra loader（compileMdx）
   ▼
app/[[...mdxPath]]/page.tsx  ← importPage() / generateStaticParamsFor()
   ▼
<MDXContent>（mdx-components.tsx 提供 wrapper）
   ▼
app/layout.tsx  ← getPageMap() + theme.config.tsx，渲染导航树 / 页脚
```

新增文档页只需在 `content/` 下放置 `.mdx` 文件，并在同目录 `_meta.ts` 中登记导航标题；无需改动路由代码。

## 命令

| 命令 | 说明 |
| --- | --- |
| `pnpm install` | 安装依赖并应用补丁 |
| `pnpm dev` | 启动开发服务器（http://localhost:3000） |
| `pnpm build` | 生成生产构建（`next build`） |
| `pnpm start` | 以生产模式运行构建产物 |



## 生态

本仓库承载 DearOreUI 工具链的文档：

| 项目 | 仓库 | 作用 |
| --- | --- | --- |
| **DearOreUI** | [copper-lamp/Dear-OreUI](https://github.com/copper-lamp/Dear-OreUI) | 原生 LeviLamina 运行时 —— 在运行时扩展 OreUI |
| **DearOreUI 设计器** | [copper-lamp/DearOreUI-dev-tools](https://github.com/copper-lamp/DearOreUI-dev-tools) | 离线可视化设计器（Tauri） |
| **DearOreUI 文档** | [copper-lamp/dearoreui-docs](https://github.com/copper-lamp/dearoreui-docs) | 本仓库 —— 文档与学习站点 |
| **dearoreui-ExampleMod** | [magicobs0z/dearoreui-ExampleMod](https://github.com/magicobs0z/dearoreui-ExampleMod) | 阶梯教程模组 |
| **dearoreui-repo** | [copper-lamp/dearoreui-repo](https://github.com/copper-lamp/dearoreui-repo) | 自托管 xmake 包仓库 |

## 已知限制

- 尚未覆盖 JsonUI 页面文档：文档追踪 OreUI 技术栈的运行时契约（见核心 README「兼容性」）。
- 部署使用 GitHub Pages 子路径（`/dearoreui-docs`）；多语言通过版本选择器实现，而非独立 locale 路由。

## 参与贡献

- 文档源码位于 `content/`（按 `v0.1.1/`、`v0.1.2/` 分版本）。
- 新增页面：在 `content/` 放置 `.mdx` 并更新 `_meta.ts`；涉及布局/主题改动时保持「配置集中、样式不散落」的约定。
- 设计文档位于仓库根目录 `Docs/`（架构决策的单一事实源）。

## 致谢

特别感谢 [Nextra](https://github.com/shuding/nextra) 与 [nextra-theme-docs](https://github.com/shuding/nextra/tree/main/packages/nextra-theme-docs) 提供的文档站框架。

## 许可证

[CC0-1.0](https://github.com/copper-lamp/Dear-OreUI/blob/main/LICENSE)，与 DearOreUI 运行时保持一致。
