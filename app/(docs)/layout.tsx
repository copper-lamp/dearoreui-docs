import { getPageMap } from "nextra/page-map";
import DocsLayoutClient from "./docs-layout-client";

export default async function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pageMap = await getPageMap();
    return <DocsLayoutClient pageMap={pageMap}>{children}</DocsLayoutClient>;
}