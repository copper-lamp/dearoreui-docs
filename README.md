<div align="center">
  <h1>◆ DearOreUI Docs</h1>
  <p><strong>Built for OreUI. Customized for creators.</strong></p>
  <p>The official documentation and learning site for the <a href="https://github.com/copper-lamp/Dear-OreUI">DearOreUI</a> runtime — covering the runtime, the offline designer, and example mods.</p>

  <p>
    <a href="https://copper-lamp.github.io/dearoreui-docs/">Live site</a>
    ·
    <a href="content/guide/getting-started.mdx">Getting started</a>
    ·
    <a href="https://github.com/copper-lamp/Dear-OreUI">Core runtime</a>
    ·
    <a href="https://github.com/copper-lamp/DearOreUI-dev-tools">Designer</a>
    ·
    <a href="https://github.com/copper-lamp/dearoreui-docs/issues">Report an issue</a>
    ·
    <a href="README_ZH.md">简体中文</a>
  </p>
</div>

Docs are versioned and cover 130+ pages across releases and guides.

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


## Ecosystem

This repo hosts the documentation for the DearOreUI toolchain:

| Project | Repository | Role |
| --- | --- | --- |
| **DearOreUI** | [copper-lamp/Dear-OreUI](https://github.com/copper-lamp/Dear-OreUI) | Native LeviLamina runtime — extends OreUI at runtime |
| **DearOreUI Designer** | [copper-lamp/DearOreUI-dev-tools](https://github.com/copper-lamp/DearOreUI-dev-tools) | Offline visual designer (Tauri) |
| **DearOreUI Docs** | [copper-lamp/dearoreui-docs](https://github.com/copper-lamp/dearoreui-docs) | This repo — documentation & learning site |
| **dearoreui-ExampleMod** | [magicobs0z/dearoreui-ExampleMod](https://github.com/magicobs0z/dearoreui-ExampleMod) | Progressive tutorial mod |
| **dearoreui-repo** | [copper-lamp/dearoreui-repo](https://github.com/copper-lamp/dearoreui-repo) | Self-hosted xmake package repo |

## Known Limitations

- JsonUI page docs are not covered: the docs track the OreUI stack's runtime contracts (see the core README "Compatibility").
- Deployment uses GitHub Pages sub-path (`/dearoreui-docs`); i18n via a version selector rather than a dedicated locale router.

## Contributing

- Docs source live in `content/` (versioned under `v0.1.1/`, `v0.1.2/`).
- To add a page: place an `.mdx` file under `content/` and update `_meta.ts`. For layout/theme changes, keep configuration centralized and avoid scattering styles.
- Design documents live in `Docs/` at the repo root (single source of truth for architecture decisions).

## Acknowledgements

Special thanks to [Nextra](https://github.com/shuding/nextra) and [nextra-theme-docs](https://github.com/shuding/nextra/tree/main/packages/nextra-theme-docs) for the documentation framework.

## License

[CC0-1.0](https://github.com/copper-lamp/Dear-OreUI/blob/main/LICENSE), matching the DearOreUI runtime.
