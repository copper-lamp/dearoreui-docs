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

## Known Issues

- **nextra-theme-docs@4.6.1 Layout validation bug**: `<Layout>` validates its props with Zod only *after* stripping `children`, but the schema still requires `children`, so every page fails with `Invalid input: expected nonoptional, received undefined → at children` (upstream issues [#5034](https://github.com/shuding/nextra/issues/5034) / [#5036](https://github.com/shuding/nextra/issues/5036)). This repo fixes it via `patchedDependencies` in `pnpm-workspace.yaml` (`patches/nextra-theme-docs@4.6.1.patch`). Before upgrading, confirm the fix landed upstream and remove the patch entry.
- **Dev-mode hydration warning**: next-themes injects a theme class on `<html>` on the client, producing a benign hydration warning that does not affect functionality.

## Development Status and Roadmap

- Nextra 4 App Router migration is complete; the homepage and "Getting started" render correctly.
- Per the site design doc, the following are planned:
  - Bilingual i18n (`/en`, `/zh-CN`) with a language switcher.
  - First batch of doc groups: Guide / API / Resources / UI / Host / Debug.
  - GitHub Pages static export (`output: 'export'` + `basePath`).
  - HeroUI-inspired visual design (dark theme, violet-to-blue gradient tokens).

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
