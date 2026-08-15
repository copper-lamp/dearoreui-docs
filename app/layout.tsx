import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";
import { docsRepositoryBase, footerText, logo, projectLink } from "../theme.config";

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pageMap = await getPageMap();
    return (
        <html lang="zh-CN">
            <body>
                <Layout
                    navbar={<Navbar logo={logo} projectLink={projectLink} />}
                    pageMap={pageMap}
                    docsRepositoryBase={docsRepositoryBase}
                    footer={<Footer>{footerText}</Footer>}
                >
                    {children}
                </Layout>
            </body>
        </html>
    );
}
