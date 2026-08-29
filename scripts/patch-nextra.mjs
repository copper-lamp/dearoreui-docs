// postinstall 补丁：修复 nextra-theme-docs@4.6.1 编译产物 Layout 的 memo 缓存越界。
//
// 背景：dist/layout.js 中编译后的 Layout 声明 `const $ = _c(26)`（申请 26 个缓存槽位，
// 合法下标 0..25），随后分支中读取并写入 `$[26]`。该越界写入使数组 length 变为 27，
// 下次渲染经 React useMemoCache(26) 校验时 `27 !== 26`，在 dev 下报
// "Expected a constant size argument ... useMemoCache" 错误。
// 修复：槽位数改为 27，覆盖被写入的下标 26，数组长度恒为 27。
//
// 脚本幂等：已修复则跳过，避免重复污染 node_modules。

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const file = resolve(
    root,
    "node_modules/nextra-theme-docs/dist/layout.js"
);

const BUG = "_c(26);";
const FIXED = "_c(27);";

try {
    const src = readFileSync(file, "utf8");
    if (src.includes("const $ = " + FIXED)) {
        console.log("[patch-nextra] 已修复，跳过");
        process.exit(0);
    }
    const next = src.replace("const $ = " + BUG, "const $ = " + FIXED);
    if (next === src) {
        console.warn("[patch-nextra] 未找到目标代码 `const $ = _c(26);`，请人工检查版本");
        process.exit(1);
    }
    writeFileSync(file, next, "utf8");
    console.log("[patch-nextra] 已应用 Layout memo 缓存越界修复");
} catch (err) {
    console.error("[patch-nextra] 失败：", err.message);
    process.exit(1);
}