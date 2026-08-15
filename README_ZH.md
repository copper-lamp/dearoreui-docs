<div align="center">
  <h1>◆ DearOreUI Docs</h1>
  <p><strong>为 OreUI 而生，为创作而定制。</strong></p>
  <p>DearOreUI 的官方文档站——面向扩展开发者的 OreUI 运行时文档。</p>

  <p>
    <a href="content/index.mdx">首页</a>
    ·
    <a href="content/guide/getting-started.mdx">开始使用</a>
    ·
    <a href="https://github.com/copper-lamp/dearoreui-docs/issues">问题反馈</a>
    ·
    <a href="../Docs/Web-文档站设计-需求架构执行.md">设计文档</a>
    ·
    <a href="README.md">English</a>
  </p>
</div>

> [!WARNING]
> 文档站仍处于早期开发阶段，内容与结构会持续调整。所有页面均为工作草稿，不保证与运行时契约完全同步。

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

## 已知问题

- **nextra-theme-docs@4.6.1 存在 Layout 校验 bug**：`<Layout>` 在剔除 `children` 后才进行 Zod 校验，但 schema 仍要求 `children` 必填，导致所有页面 500（上游 issue [#5034](https://github.com/shuding/nextra/issues/5034) / [#5036](https://github.com/shuding/nextra/issues/5036)）。本仓库通过 `pnpm-workspace.yaml` 的 `patchedDependencies` 注入补丁（`patches/nextra-theme-docs@4.6.1.patch`）修复。升级依赖前请确认上游已修复并移除该补丁配置。
- **开发模式水合警告**：next-themes 在客户端为 `<html>` 注入主题类名，触发良性水合警告，不影响功能。

## 开发状态与计划

- 已完成 Nextra 4 App Router 迁移，首页与「快速开始」可正常渲染。
- 按《Web-文档站设计》推进：
  - 中英双语（`/en`、`/zh-CN`）i18n 与语言切换。
  - 首批文档分组：指南 / API / 资源 / UI / Host / 调试。
  - GitHub Pages 静态导出（`output: 'export'` + `basePath`）。
  - HeroUI 风格视觉落地（深色主题、紫蓝渐变设计令牌）。

## 已知限制

- 文档内容目前较少（首页 + 快速开始），其余分组尚未建设。
- 尚未配置 i18n 与静态导出部署。
- 页面内容以 `Docs/` 设计文档为事实源，人工同步，存在漂移风险。

## 参与贡献

- 内容与架构设计文档见仓库根目录 `Docs/`（`Web-文档站设计-需求架构执行.md`、`Web-Nextra4迁移-需求架构执行.md`）。
- 新增页面：在 `content/` 放置 `.mdx` 并更新 `_meta.ts`；涉及布局/主题改动时保持「配置集中、样式不散落」的约定。

## 致谢

特别感谢 [Nextra](https://github.com/shuding/nextra) 与 [nextra-theme-docs](https://github.com/shuding/nextra/tree/main/packages/nextra-theme-docs) 提供的文档站框架，以及 [HeroUI](https://heroui.com) 提供的视觉语言参考。

## 许可证

许可证尚未确定，待项目作者确认后补充。
