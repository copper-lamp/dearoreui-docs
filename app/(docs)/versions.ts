/**
 * 文档版本清单（类 git tag）。
 *
 * 每个条目对应 `content/<id>/` 下的一个完整文档快照，路由为 `/<id>/...`。
 * 未来发布新版本：新增 `content/<id>/` 目录，并在此追加一条即可，框架代码无需改动。
 */

export type DocVersion = {
    /** 版本标识，同时也是 content 目录名与 URL 前缀段 */
    id: string;
    /** 导航栏展示名 */
    label: string;
    /** 是否为最新版本 */
    isLatest?: boolean;
};

export const versions: DocVersion[] = [
    { id: "v0.1.1", label: "v0.1.1", isLatest: true },
];

/** 默认/当前版本（首个条目），用于没有版本前缀的路径兜底 */
export const defaultVersion = versions[0].id;

/** 从路径中取出版本段（第一段）；不合法则回退默认版本 */
export function getVersion(pathname: string): string {
    const seg = pathname.split("/")[1];
    return versions.some((v) => v.id === seg) ? seg : defaultVersion;
}

/**
 * 在既有路径上把版本段换成目标版本，尽量保留当前页面上下文。
 * 例：switchVersion("/v0.1.1/guide/introduction", "v0.1.0") -> "/v0.1.0/guide/introduction"
 * 目标版本不存在该路径时由页面侧自然 404，版本选择器仍应指向该路径以保留上下文。
 */
export function switchVersion(pathname: string, version: string): string {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return `/${version}`;
    return `/${version}/${segments.slice(1).join("/")}`;
}

/** 给某版本前缀的路径加同版本前缀（用于导航链接） */
export function withVersion(path: string, version: string): string {
    if (path === "/") return `/${version}`;
    return `/${version}${path.startsWith("/") ? path : `/${path}`}`;
}