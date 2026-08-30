import "nextra-theme-docs/style.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
    icons: {
        icon: "https://pic1.imgdb.cn/i/034Fy95DlBbgyY1jdpBuJM.png",
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
