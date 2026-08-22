import nextra from "nextra";

const withNextra = nextra({});

// GitHub Actions（GitHub Pages 部署）环境启用子路径前缀；
// 本地构建保持根路径，便于直接用静态服务器预览 out/。
const isGithubActions = process.env.GITHUB_ACTIONS === "true";

export default withNextra({
    reactStrictMode: true,
    output: "export",
    images: { unoptimized: true },
    ...(isGithubActions && {
        basePath: "/dearoreui-docs",
        assetPrefix: "/dearoreui-docs/",
    }),
    // Turbopack（Next ≥15.3 顶层键）下为 nextra 解析 mdx-components，
    // 否则 dev 模式编译停滞 / 找不到 next-mdx-import-source-file。
    turbopack: {
        resolveAlias: {
            "./mdx-components": "./mdx-components.tsx",
            "../mdx-components": "../mdx-components.tsx",
            "../../mdx-components": "../../mdx-components.tsx",
            "@mdx-components": "./mdx-components.tsx",
        },
    },
});
