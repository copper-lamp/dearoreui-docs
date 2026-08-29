"use client";

import { Footer, Layout } from "nextra-theme-docs";
import { usePathname } from "next/navigation";
import type { PageMapItem } from "nextra";
import { docsRepositoryBase, footerText } from "../../theme.config";
import CustomNavbar from "./custom-navbar";
import { getVersion } from "./versions";

/** 定位 pageMap 中 route 与给定路径完全一致的节点 */
function findByRoute(pageMap: PageMapItem[], route: string): PageMapItem | undefined {
    return pageMap.find((item) => {
        if ("children" in item && typeof item.route === "string") {
            return item.route.replace(/\/+$/, "") === route.replace(/\/+$/, "");
        }
        return false;
    });
}

/**
 * 根据当前路径过滤 pageMap，侧边栏只显示"当前版本的当前分区"的子页面。
 * 路径形如 /{version}/{section}/...，pageMap 顶层为版本节点。
 * 位于版本首页（无分区）时，展示该版本的全部分区节点。
 */
function filterPageMap(pageMap: PageMapItem[], pathname: string): PageMapItem[] {
    const version = getVersion(pathname);
    const section = pathname.split("/")[2] || "";
    const versionNode = findByRoute(pageMap, `/${version}`);
    if (!versionNode || !("children" in versionNode)) return [];
    const sectionNodes = (versionNode.children as PageMapItem[]).filter(
        (item) => "children" in item && typeof item.route === "string"
    );
    if (!section) return sectionNodes;
    const sectionNode = findByRoute(sectionNodes, `/${version}/${section}`);
    return sectionNode ? [sectionNode] : sectionNodes;
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