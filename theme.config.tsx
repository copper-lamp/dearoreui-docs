import type { ReactNode } from "react";
import Image from "next/image";

// GitHub Actions（GitHub Pages 子路径部署）为 public 资源拼前缀。
// 静态导出（output:"export"）下 next/image 不会自动给 src 加 basePath，
// 与 next.config.mjs 的判定保持一致。
const basePath = process.env.GITHUB_ACTIONS === "true" ? "/dearoreui-docs" : "";

/** 站点 Logo（Navbar 使用） */
export const logo: ReactNode = (
    <Image
        src={`${basePath}/images/icon_s.png`}
        alt="DearOreUI"
        width={56}
        height={28}
    />
);

/** 项目仓库链接（Navbar 图标使用） */
export const projectLink = "https://github.com/copper-lamp/Dear-OreUI";

/** 文档仓库基址（编辑此页等链接使用） */
export const docsRepositoryBase =
    "https://github.com/copper-lamp/Dear-OreUI/tree/main/Web";

/** 页脚文案（Footer 使用） */
export const footerText = "DearOreUI Documentation";