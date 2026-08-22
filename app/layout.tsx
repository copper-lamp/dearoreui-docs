import "nextra-theme-docs/style.css";

import type { Metadata } from "next";

// GitHub Actions（GitHub Pages 子路径部署）时为 public 资源拼接前缀；
// 与 next.config.mjs 的 basePath 判定保持一致。metadata icons 不会像
// next/image 那样自动加 basePath，必须手动拼。
const basePath = process.env.GITHUB_ACTIONS === "true" ? "/dearoreui-docs" : "";

export const metadata: Metadata = {
    icons: {
        icon: `${basePath}/images/icon_s.png`,
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="zh-CN">
            <body>{children}</body>
        </html>
    );
}
