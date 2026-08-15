<div align="center">
  <h1>◆ DearOreUI Docs</h1>
  <p><strong>Built for OreUI. Customized for creators.</strong></p>
  <p>The official documentation site for DearOreUI — an OreUI runtime docs hub for extension developers.</p>

  <p>
    <a href="content/index.mdx">Home</a>
    ·
    <a href="content/guide/getting-started.mdx">Getting started</a>
    ·
    <a href="https://github.com/copper-lamp/dearoreui-docs/issues">Report an issue</a>
    ·
    <a href="../Docs/Web-文档站设计-需求架构执行.md">Design doc</a>
    ·
    <a href="README_ZH.md">简体中文</a>
  </p>
</div>

> [!WARNING]
> The docs site is still in an early stage of development. Content and structure are subject to change. All pages are working drafts and are not guaranteed to stay in sync with the runtime contracts.

## Quick Start

> [!IMPORTANT]
> Development requires [Node.js](https://nodejs.org/) (18.18+ for Next.js 15) and [pnpm](https://pnpm.io/).

```powershell
cd Web
pnpm install   # Install dependencies (automatically applies the nextra-theme-docs patch)
pnpm dev       # Start the dev server → http://localhost:3000
```

Use `pnpm build` to produce a production build and `pnpm start` to run it.

## Tech Stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 15 (App Router) | Pages and dynamic routing |
| Docs theme | Nextra 4 + nextra-theme-docs | Navigation tree, code highlighting, on-page TOC |
| Language | TypeScript + MDX | Content and components |
| Package manager | pnpm | Config and patches managed in `pnpm-workspace.yaml` |

## Project Structure

```text
Web/
├── app/                        # App Router
│   ├── layout.tsx              # Root layout: Layout/Navbar/Footer + getPageMap
│   └── [[...mdxPath]]/page.tsx # Single dynamic route entry for the content dir
├── content/                    # MDX content directory (v4 default)
│   ├── index.mdx               # Homepage
│   └── guide/                  # Guide group
│       ├── _meta.ts            # Group navigation metadata
│       └── getting-started.mdx
├── mdx-components.tsx          # Merges the theme's default MDX components (required)
├── theme.config.tsx            # Theme config: logo / projectLink / docsRepositoryBase / footer
├── patches/                    # pnpm patches (see "Known Issues")
├── pnpm-workspace.yaml         # patchedDependencies / allowBuilds
├── next.config.mjs             # nextra() config
└── tsconfig.json
```

## Content Pipeline

```text
content/*.mdx
   │  Nextra loader (compileMdx)
   ▼
app/[[...mdxPath]]/page.tsx  ← importPage() / generateStaticParamsFor()
   ▼
<MDXContent> (wrapper provided by mdx-components.tsx)
   ▼
app/layout.tsx  ← getPageMap() + theme.config.tsx, renders nav tree / footer
```

To add a page, just drop an `.mdx` file under `content/` and register its nav title in the sibling `_meta.ts`. No route code changes required.

## Commands

| Command | Description |
| --- | --- |
| `pnpm install` | Install dependencies and apply patches |
| `pnpm dev` | Start the dev server (http://localhost:3000) |
| `pnpm build` | Produce a production build (`next build`) |
| `pnpm start` | Run the production build |


## Known Limitations

- Content is currently limited (homepage + getting-started); other groups are not built yet.
- i18n and static-export deployment are not configured yet.
- Page content is manually synced from the `Docs/` design documents (single source of truth), so drift is possible.

## Contributing

- Content and architecture design docs live in `Docs/` at the repo root (`Web-文档站设计-需求架构执行.md`, `Web-Nextra4迁移-需求架构执行.md`).
- To add a page: place an `.mdx` file under `content/` and update `_meta.ts`. For layout/theme changes, keep configuration centralized and avoid scattering styles.

## Acknowledgements

Special thanks to [Nextra](https://github.com/shuding/nextra) and [nextra-theme-docs](https://github.com/shuding/nextra/tree/main/packages/nextra-theme-docs) for the documentation framework, and to [HeroUI](https://heroui.com) for the visual language reference.

## License

License is TBD until confirmed by the project author.
