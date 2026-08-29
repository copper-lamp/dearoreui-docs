"use client";
"use no memo";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { Anchor, Button } from "nextra/components";
import { GitHubIcon, MenuIcon } from "nextra/icons";
import { setMenu, useMenu, useThemeConfig } from "nextra-theme-docs";
import { logo, projectLink } from "../../theme.config";
import { getVersion, withVersion } from "./versions";
import VersionSelector from "./version-selector";

/** 自定义顶部导航：logo + 分区链接（中间）+ 搜索 + GitHub + 移动端菜单 */
export default function CustomNavbar() {
    const pathname = usePathname();
    const themeConfig = useThemeConfig();
    const menu = useMenu();

    const version = getVersion(pathname);
    // 版本感知的导航链接：分区链接始终带当前版本前缀，保持在同一版本的文档内跳转
    const navLinks = [
        { href: "/", label: "首页" },
        { href: withVersion("/guide/introduction", version), label: "入门指南" },
        { href: withVersion("/components/overview", version), label: "组成部分" },
        { href: withVersion("/releases", version), label: "发行作品" },
    ];
    // 首页为全局入口，不作为分区；其余分区链接在活跃判定时对比去版本前缀后的路径
    const isActive = (href: string) =>
        href === "/"
            ? pathname === "/"
            : pathname === href ||
              (href !== "/" && pathname.startsWith(href + "/"));

    return (
        <header className="nextra-navbar x:sticky x:top-0 x:z-30 x:w-full x:bg-transparent x:print:hidden">
            <div
                className="nextra-navbar-blur x:absolute x:-z-1 x:size-full nextra-border x:border-b x:backdrop-blur-md x:bg-nextra-bg/70"
                aria-hidden="true"
            />
            <nav
                style={{ height: "var(--nextra-navbar-height)" }}
                className="x:mx-auto x:flex x:max-w-(--nextra-content-width) x:items-center x:gap-4 x:pl-[max(env(safe-area-inset-left),1.5rem)] x:pr-[max(env(safe-area-inset-right),1.5rem)]"
            >
                <NextLink
                    href="/"
                    className="x:flex x:items-center x:transition-opacity x:focus-visible:nextra-focus x:hover:opacity-75"
                    aria-label="Home page"
                >
                    {logo}
                </NextLink>

                {/* 分区链接：logo 旁边（页面中间位置） */}
                <div className="x:flex x:items-center x:gap-1 x:text-sm x:ms-6 x:max-md:hidden">
                    {navLinks.map((link) => {
                        const active = isActive(link.href);
                        return (
                            <NextLink
                                key={link.href}
                                href={link.href}
                                className={
                                    "x:px-3 x:py-1.5 x:rounded-md x:whitespace-nowrap x:transition-colors " +
                                    (active
                                        ? "x:text-gray-900 x:bg-gray-100 dark:x:text-gray-100 dark:x:bg-gray-800"
                                        : "x:text-gray-600 hover:x:text-gray-900 hover:x:bg-gray-100 dark:x:text-gray-400 dark:hover:x:text-gray-100 dark:hover:x:bg-gray-800")
                                }
                            >
                                {link.label}
                            </NextLink>
                        );
                    })}
                </div>

                {/* 右侧：版本 + 搜索 + GitHub + 移动端菜单 */}
                <div className="x:ms-auto x:flex x:items-center x:gap-4">
                    <VersionSelector />
                    {themeConfig.search}
                    <Anchor href={projectLink} aria-label="Project repository">
                        <GitHubIcon height="24" />
                    </Anchor>
                    <Button
                        aria-label="Menu"
                        className={"nextra-hamburger x:md:hidden" + (menu ? " x:bg-gray-400/20" : "")}
                        onClick={() => setMenu((prev) => !prev)}
                    >
                        <MenuIcon height="24" className={menu ? "open" : ""} />
                    </Button>
                </div>
            </nav>
        </header>
    );
}