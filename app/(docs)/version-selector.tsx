"use client";
"use no memo";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { getVersion, switchVersion, versions } from "./versions";

/**
 * 导航栏版本选择器（git-tag 风格下拉）。
 * 当前路径带版本前缀，切换时替换版本段以尽量保留当前页面上下文。
 */
export default function VersionSelector() {
    const pathname = usePathname();
    const current = getVersion(pathname);
    const [open, setOpen] = useState(false);

    // 点击外部或按 Esc 时收起
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
        const onDown = (e: MouseEvent) => {
            const target = e.target as Element;
            if (!target.closest("[data-version-selector]")) setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        window.addEventListener("pointerdown", onDown);
        return () => {
            window.removeEventListener("keydown", onKey);
            window.removeEventListener("pointerdown", onDown);
        };
    }, [open]);

    return (
        <div className="x:relative" data-version-selector>
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className="x:inline-flex x:items-center x:gap-1.5 x:rounded-md x:px-2 x:py-1 x:text-sm x:text-gray-600 hover:x:text-gray-900 dark:x:text-gray-400 dark:hover:x:text-gray-100 x:transition-colors x:whitespace-nowrap"
            >
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="currentColor" className="x:opacity-70">
                    <path d="M7.75 0h6.75a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 1-.22.53l-6.25 6.25a.75.75 0 0 1-1.06 0L.75 7.78a.75.75 0 0 1 0-1.06L7 1.22A.75.75 0 0 1 7.53 1h.22ZM11 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
                </svg>
                <span>{current}</span>
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="currentColor" className="x:opacity-60">
                    <path d="m4.5 7 3.5 3.5L11.5 7z"/>
                </svg>
            </button>

            {open && (
                <ul
                    role="listbox"
                    aria-label="文档版本"
                    className="x:absolute x:end-0 x:top-full x:mt-1 x:min-w-[9rem] x:rounded-lg x:border nextra-border x:bg-nextra-bg x:shadow-xl x:py-1 x:text-sm x:z-50"
                >
                    {versions.map((v) => {
                        const selected = v.id === current;
                        return (
                            <li key={v.id} role="option" aria-selected={selected}>
                                <NextLink
                                    href={selected ? pathname : switchVersion(pathname, v.id)}
                                    onClick={() => setOpen(false)}
                                    className={
                                        "x:flex x:items-center x:justify-between x:gap-3 x:px-3 x:py-1.5 " +
                                        (selected
                                            ? "x:text-gray-900 x:bg-gray-100 dark:x:text-gray-100 dark:x:bg-gray-800 x:font-medium"
                                            : "x:text-gray-600 hover:x:bg-gray-100 hover:x:text-gray-900 dark:x:text-gray-400 dark:hover:x:text-gray-100 dark:hover:x:bg-gray-800")
                                    }
                                >
                                    <span>{v.label}</span>
                                    {v.isLatest && (
                                        <span className="x:text-xs x:text-emerald-600 dark:x:text-emerald-400 x:whitespace-nowrap">
                                            最新
                                        </span>
                                    )}
                                </NextLink>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}