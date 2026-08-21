import type { ReactNode } from "react";

/** 站点 Logo（Navbar 使用） */
export const logo: ReactNode = <span>DearOreUI</span>;

/** 项目仓库链接（Navbar 图标使用） */
export const projectLink = "https://github.com/DearOreUI/DearOreUI";

/** 文档仓库基址（编辑此页等链接使用） */
export const docsRepositoryBase =
    "https://github.com/DearOreUI/DearOreUI/tree/main/Web";

/** 页脚文案（Footer 使用） */
export const footerText = "DearOreUI Documentation";

/** 顶部导航：4 个大分区 */
export const navLinks = [
    { href: "/", label: "首页" },
    { href: "/guide/introduction", label: "入门指南" },
    { href: "/components/overview", label: "组成部分" },
    { href: "/releases", label: "发行作品" },
];