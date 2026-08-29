import Link from "next/link";

const GITHUB = "https://github.com/DearOreUI/DearOreUI";
const DESIGNER = "https://github.com/DearOreUI/Designer";
const DOCS_REPO = "https://github.com/DearOreUI/Docs";
// 文档统一挂在当前版本前缀下（体验类似 git tag，切换见导航栏版本选择器）
const DOC_VERSION = "v0.1.1";

const GitHubIcon = () => (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" fill="currentColor">
        <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
);

export default function HomePage() {
    return (
        <>
            <style>{`
                .dear-lp {
                    --dear-ink: #17181b;
                    --dear-muted: #777b83;
                    --dear-line: #e8e9ec;
                    --dear-blue: #1683f7;
                    min-height: 100svh;
                    display: flex;
                    flex-direction: column;
                    background: #fafafa;
                    color: var(--dear-ink);
                    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;
                    -webkit-font-smoothing: antialiased;
                    text-rendering: optimizeLegibility;
                }
                .dear-lp * { box-sizing: border-box; }

                .dear-nav {
                    position: sticky;
                    top: 0;
                    z-index: 40;
                    background: rgba(250, 250, 250, 0.78);
                    backdrop-filter: blur(14px) saturate(1.4);
                    -webkit-backdrop-filter: blur(14px) saturate(1.4);
                    border-bottom: 1px solid rgba(232, 233, 236, 0.9);
                }
                .dear-nav__bar {
                    max-width: 1190px;
                    margin: 0 auto;
                    height: 64px;
                    padding: 0 28px;
                    display: flex;
                    align-items: center;
                    gap: 36px;
                }
                .dear-nav__brand {
                    color: var(--dear-ink);
                    font-size: 18px;
                    font-weight: 850;
                    letter-spacing: -0.06em;
                    text-decoration: none;
                    white-space: nowrap;
                }
                .dear-nav__brand::before {
                    content: "◆";
                    display: inline-block;
                    margin-right: 8px;
                    color: #222;
                    font-size: 11px;
                    vertical-align: 2px;
                }
                .dear-nav__links { display: flex; gap: 24px; font-size: 13px; }
                .dear-nav__links a {
                    color: var(--dear-muted);
                    text-decoration: none;
                    transition: color 0.18s;
                }
                .dear-nav__links a:hover { color: var(--dear-ink); }
                .dear-nav__links a.is-active { color: var(--dear-ink); font-weight: 650; }
                .dear-nav__right { margin-left: auto; display: flex; align-items: center; gap: 14px; }
                .dear-nav__github {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 34px;
                    height: 34px;
                    border: 1px solid var(--dear-line);
                    border-radius: 50%;
                    background: #fff;
                    color: #333;
                    transition: transform 0.18s, border-color 0.18s, color 0.18s;
                }
                .dear-nav__github:hover { transform: translateY(-1px); border-color: #c9ccd1; color: var(--dear-ink); }
                .dear-nav__cta {
                    display: inline-flex;
                    align-items: center;
                    padding: 9px 18px;
                    border-radius: 999px;
                    background: var(--dear-blue);
                    color: #fff;
                    font-size: 13px;
                    font-weight: 650;
                    text-decoration: none;
                    box-shadow: 0 8px 18px rgba(22, 131, 247, 0.28);
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .dear-nav__cta:hover { transform: translateY(-1px); box-shadow: 0 10px 24px rgba(22, 131, 247, 0.38); }

                .dear-hero {
                    position: relative;
                    flex: 1;
                    min-height: calc(100svh - 64px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    padding: 48px 28px;
                }
                .dear-hero__glow {
                    position: absolute;
                    inset: -12% -24% auto;
                    height: 76%;
                    background: radial-gradient(46% 58% at 50% 0%, rgba(22, 131, 247, 0.09), transparent 72%);
                    pointer-events: none;
                }
                .dear-hero__grid {
                    position: absolute;
                    inset: 0;
                    background-image:
                        linear-gradient(rgba(23, 24, 27, 0.032) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(23, 24, 27, 0.032) 1px, transparent 1px);
                    background-size: 56px 56px;
                    -webkit-mask-image: radial-gradient(78% 72% at 50% 42%, #000 28%, transparent 78%);
                    mask-image: radial-gradient(78% 72% at 50% 42%, #000 28%, transparent 78%);
                    pointer-events: none;
                }
                .dear-hero__inner {
                    position: relative;
                    z-index: 1;
                    max-width: 940px;
                    text-align: center;
                }
                .dear-hero__eyebrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 9px;
                    border: 1px solid #cce5ff;
                    background: #eef7ff;
                    color: #1679db;
                    border-radius: 999px;
                    padding: 7px 15px;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.01em;
                }
                .dear-hero__eyebrow i {
                    width: 6px;
                    height: 6px;
                    border-radius: 50%;
                    background: var(--dear-blue);
                    box-shadow: 0 0 0 3px rgba(22, 131, 247, 0.16);
                }
                .dear-hero__title {
                    margin: 28px 0 0;
                    font-size: clamp(52px, 8.4vw, 96px);
                    line-height: 0.95;
                    letter-spacing: -0.09em;
                    font-weight: 850;
                }
                .dear-hero__title span { display: block; color: #a5a7ac; }
                .dear-hero__lead {
                    margin: 28px auto 0;
                    max-width: 560px;
                    color: var(--dear-muted);
                    font-size: 16px;
                    line-height: 1.7;
                }
                .dear-hero__actions { margin-top: 40px; display: flex; justify-content: center; gap: 12px; }
                .dear-btn {
                    display: inline-flex;
                    align-items: center;
                    border: 1px solid var(--dear-line);
                    border-radius: 999px;
                    padding: 13px 27px;
                    font-size: 14px;
                    font-weight: 650;
                    text-decoration: none;
                    color: #222;
                    background: #fff;
                    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
                }
                .dear-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 22px rgba(28, 42, 59, 0.1); }
                .dear-btn--primary {
                    border-color: var(--dear-blue);
                    background: var(--dear-blue);
                    color: #fff;
                    box-shadow: 0 12px 26px rgba(22, 131, 247, 0.3);
                }
                .dear-btn--primary:hover { box-shadow: 0 14px 30px rgba(22, 131, 247, 0.4); }
                .dear-hero__swatches { margin-top: 46px; display: flex; justify-content: center; gap: 10px; }
                .dear-hero__swatches i { width: 9px; height: 9px; border-radius: 50%; opacity: 0.9; }
                .dear-hero__proof { margin-top: 20px; color: #a0a2a7; font-size: 12px; letter-spacing: 0.02em; }

                @keyframes dear-rise {
                    from { opacity: 0; transform: translateY(16px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .dear-hero__eyebrow { animation: dear-rise 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) both; }
                .dear-hero__title { animation: dear-rise 0.7s 0.08s cubic-bezier(0.22, 0.61, 0.36, 1) both; }
                .dear-hero__lead { animation: dear-rise 0.7s 0.16s cubic-bezier(0.22, 0.61, 0.36, 1) both; }
                .dear-hero__actions { animation: dear-rise 0.7s 0.24s cubic-bezier(0.22, 0.61, 0.36, 1) both; }
                .dear-hero__swatches { animation: dear-rise 0.7s 0.32s cubic-bezier(0.22, 0.61, 0.36, 1) both; }
                .dear-hero__proof { animation: dear-rise 0.7s 0.4s cubic-bezier(0.22, 0.61, 0.36, 1) both; }
                @media (prefers-reduced-motion: reduce) {
                    .dear-hero__eyebrow, .dear-hero__title, .dear-hero__lead,
                    .dear-hero__actions, .dear-hero__swatches, .dear-hero__proof { animation: none; }
                }

                @media (max-width: 760px) {
                    .dear-nav__bar { padding: 0 18px; gap: 20px; }
                    .dear-nav__links { display: none; }
                    .dear-hero { padding: 36px 20px; min-height: calc(100svh - 64px); }
                    .dear-hero__title { font-size: clamp(42px, 13vw, 60px); }
                    .dear-hero__actions { flex-direction: column; align-items: center; }
                    .dear-hero__lead { font-size: 15px; }
                }
            `}</style>

            <div className="dear-lp">
                <header className="dear-nav">
                    <div className="dear-nav__bar">
                        <a className="dear-nav__brand" href="#top">DearOreUI</a>
                        <nav className="dear-nav__links" aria-label="主导航">
                            <a className="is-active" href="#top">首页</a>
                            <Link href={`/${DOC_VERSION}/guide/introduction`}>入门指南</Link>
                            <Link href={`/${DOC_VERSION}/components/overview`}>组成部分</Link>
                            <Link href={`/${DOC_VERSION}/releases`}>发行作品</Link>
                        </nav>
                        <div className="dear-nav__right">
                            <a className="dear-nav__github" href={GITHUB} aria-label="GitHub 仓库"><GitHubIcon /></a>
                            <Link className="dear-nav__cta" href={`/${DOC_VERSION}/guide/getting-started`}>开始使用</Link>
                        </div>
                    </div>
                </header>

                <main id="top" className="dear-hero">
                    <div className="dear-hero__glow" aria-hidden="true" />
                    <div className="dear-hero__grid" aria-hidden="true" />
                    <div className="dear-hero__inner">
                        <div className="dear-hero__eyebrow"><i aria-hidden="true" />DearOreUI · LeviLamina 客户端前置</div>
                        <h1 className="dear-hero__title">为 OreUI 而生。<span>为创作而定制。</span></h1>
                        <p className="dear-hero__lead">一个原生、开放且可扩展的 OreUI 运行时，让你快速探索界面结构，连接设计与游戏内体验。</p>
                        <div className="dear-hero__actions">
                            <Link className="dear-btn dear-btn--primary" href={`/${DOC_VERSION}/guide/getting-started`}>开始使用</Link>
                            <a className="dear-btn" href={DOCS_REPO}>查看文档</a>
                        </div>
                        <div className="dear-hero__swatches" aria-hidden="true">
                            <i style={{ background: "#f58ab9" }} /><i style={{ background: "#f7bf35" }} /><i style={{ background: "#5dd36b" }} /><i style={{ background: "#58b9ed" }} /><i style={{ background: "#9f9cff" }} />
                        </div>
                        <p className="dear-hero__proof">开源项目 · 面向客户端 · 不改变原有 UI 行为</p>
                    </div>
                </main>
            </div>
        </>
    );
}
