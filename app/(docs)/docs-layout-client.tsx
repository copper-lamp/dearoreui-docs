"use client";

import { Footer, Layout } from "nextra-theme-docs";
import { usePathname } from "next/navigation";
import type { PageMapItem } from "nextra";
import { docsRepositoryBase, footerText } from "../../theme.config";
import CustomNavbar from "./custom-navbar";

/** 根据当前路径过滤 pageMap，侧边栏只显示当前分区的子页面 */
function filterPageMap(pageMap: PageMapItem[], pathname: string): PageMapItem[] {
    const section = pathname.split("/")[1] || "";
    return pageMap.filter((item) => {
        if ("children" in item && typeof item.route === "string") {
            return item.route.replace(/^\//, "") === section;
        }
        return false;
    });
}

export default function DocsLayoutClient({
    pageMap,
    children,
}: {
    pageMap: PageMapItem[];
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const filteredPageMap = filterPageMap(pageMap, pathname);

    return (
        <Layout
            navbar={<CustomNavbar />}
            pageMap={filteredPageMap}
            docsRepositoryBase={docsRepositoryBase}
            footer={<Footer>{footerText}</Footer>}
        >
            {children}
        </Layout>
    );
}