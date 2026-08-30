---
name: dearoreui-ui-authoring
description: 为使用 **DearOreUI** 的模组编写可编译、可跑真机的声明式 UI。当任务涉及为使用 DearOreUI 的模组新增或修改界面时使用本技能，它会指导：按 UiManifest / ComponentSpec 注册组件、遵守 flex-only 与显式像素几何的布局约束、经 window.oreui 完成 C++↔JS 通信、通过 HtmlSanitizer 的 fail-closed 安全校验、按逆序生命周期注销。本技能不适用于 JsonUI 技术栈界面，也不适用于 DearOreUI 内核（LL 原生模块）本身的开发。
---

# DearOreUI UI 编写技能（v0.1.2）

>
> 事实源：`DearOreUI/src/bridge/DearOreUIBridge.h`、`src/api/**`、`src/security/HtmlSanitizer.cpp`、`src/render/DomScriptSerializer.cpp`、`src/component/ComponentRenderer.cpp`、`src/ipc/*`、`src/generated/BuiltinAssets.gen.h`、`assets/stage7-ui-bootstrap.js`、`dearoreui-ExampleMod/src/mod/examples/{ex01..ex04}`、`dearoreui-ExampleMod/assets/scripts/{ex03_communication,ex04_calendar}.js`。

---

## 0. 覆盖范围

支持 **OreUI 技术栈**页面（如世界列表 `/play/all`，真实 OreUI 界面）。主菜单、世界内属于 **JsonUI 技术栈**，**不支持**。UI 声明是**声明式**的：Mod 先 `registerMod`，再注册 UI；运行时负责渲染、注入、分发。选对页面是第一步——挂在 JsonUI 页面上的 UI 不会出现。

---

## 1. 集成入口（C ABI 桥，不链接）

取 `IDearOreUIApi*`（`MyMod::connectDearOreUI`，见 ex01）：

```cpp
HMODULE dl = GetModuleHandleW(L"DearOreUI.dll");             // 前置运行时已由 LL 加载
auto query = (dearoreui::bridge::QueryApiFn)GetProcAddress(dl, "DearOreUI_QueryApi");
auto res   = query(1);                                        // protocolVersion=1
// res: DearOreUIBridgeResult{status, protocolVersion, api}
```
**不要**链接 DearOreUI 的 import library；只依赖 `DearOreUI_QueryApi` 这个导出符号 + 公开头（`xdeps` 头文件方式，`xmake-repo` 集成）。

拿到 `api` 后用 `getInfo()` / `getProtocolVersion()` / `isReady()` 确认前置运行时就绪（ex01 里 `info.minecraftVersion / oreuiVersion / coherentVersion` 记录了真机运行时版本）。

---

## 2. 注册（registerMod → UI 三件事）

### 2.1 先注册 Mod 身份（一切的前提）

```cpp
dearoreui::api::ModManifest manifest;
manifest.id           = ModId{"example.hello"};
manifest.modNamespace = "example.hello";
manifest.displayName  = "Hello Connection Example";
manifest.modVersion   = dearoreui::api::Version{1, 0, 0};
manifest.permissions  = { dearoreui::api::Permission::HostReadOnly };
auto reg = mApi.registerMod(manifest);   // isOk()=注册成功
```
先 `registerMod`，否则后续资源 / UI / host method / 订阅注册都会因 owner 校验失败。

### 2.2 构造 UiManifest，注册 UI 主体

```cpp
dearoreui::api::UiManifest ui;
ui.modNamespace  = mModId.value();                 // 必须是已注册的命名空间
ui.id            = "calendar_communication";
ui.kind          = dearoreui::api::UiKind::Overlay; // Overlay | Panel | Button | Page
ui.pageScopes    = { dearoreui::api::PageScope::Any };
ui.anchor        = dearoreui::api::UiAnchor::TopRight; // TopLeft|TopRight|Center|...|FullScreen
ui.pointerEvents = true;
ui.containerId   = dearoreui::api::makeUiContainerId(ui.modNamespace, ui.kind, ui.id);
ui.fingerprint   = "comm.v1";                      // 冲突检测用
```
要点：
- `containerId` 用 `makeUiContainerId` 生成，**不要手拼**。
- `anchor` 是挂载锚点，**不等于**内容固定在某个角；页面型 UI 的根节点接管整个视口（见 §5）。
- UI 类型有四个入口：`registerOverlay(mModId, ui, htmlBody)`、`registerPanel`、`registerButton`、`registerPage`（**传统 HTML 挂载**，`htmlBody` 走安全校验，见 §7）；或 `registerComponent(mModId, ui, rootSpec)`（**组件树挂载**，推荐，见 §3）。

### 2.3 推荐：组件树注册 `registerComponent`

```cpp
auto reg = mApi.registerComponent(mModId, ui, root);
if (reg.isErr()) { logger.error("registerComponent failed: {}", reg.error().message); return false; }
```

---

## 3. 组件（ComponentSpec）

所有组件共享同一规格 `dearoreui::api::ComponentSpec`（`src/api/types/ComponentSpec.h`）：

```cpp
dearoreui::api::ComponentSpec spec;
spec.kind     = ComponentKind::Button;
spec.id       = "submit-btn";       // 布局锚点 → 渲染为根节点 DOM id（原地更新定位锚）
spec.label    = "确定";              // 主文本
spec.variant  = "primary";          // primary|secondary|neutral|destructive
spec.style    = "normal";           // button: normal|elevated；panel: default|dark|furnace|...
spec.disabled = false;
spec.state    = "default";          // default|hovered|focused|pressed|disabled
spec.events   = {"click"};          // 声明的事件，用于接线
spec.children = { /* 子组件树，可嵌套 */ };
spec.body     = { /* 原始 DomNode，仅 panel/card 正文 */ };
// 布局 / 组合 / 数据组件专属字段：
spec.orientation = "column";        // stack
spec.columns     = 4;               // grid
spec.icon        = "close";         // icon/image 语义键
spec.src         = "";              // image 显式 URL（覆盖 icon）
spec.value       = "1";             // slider/stepper/pager 当前值
spec.min = "0"; spec.max = "100";   // slider 范围
```

### 3.1 ComponentKind（37 种）

- **原子 A（14）**：Button、Panel、Text、Card、ListItem、Input、TabBar、Divider、Tooltip、ContainerSlot、KeyIcon、Bubble、FilterBar、Progress
- **布局 L（5）**：Stack、Grid、ScrollView、Section、Spacer
- **组合 B（9）**：Modal、Menu、ScrollingList、Dropdown、Form、NavigationBar、Toast、SearchField、Toggle
- **导航 N（2）**：Breadcrumb、Pager
- **交互 I（4）**：TextArea、Slider、Stepper、Picker
- **数据 D（3）**：Icon、Image、Badge

> [!IMPORTANT]
> 组合组件（Dropdown / Modal / Slider 等）当前提供渲染与 `state` 切换；**点击事件 → C++ 分发属后续里程碑**，不要在代码里假设点击已回传 C++。

### 3.2 DomNode（原始 DOM）与序列化格式

控制力不足时才用 `body` 注入原始 DOM。序列化为 bootstrap 渲染器消费的数组字面量 `{t,s,x,a,c}`（`DomScriptSerializer.cpp`）：

```text
t = tag（空→div）    s = cssText 声明串    x = 文本（仅叶子）
a = [["attr","value"]]    c = 子节点
st = 状态 cssText 表（交互组件）    b = 共享非纹理基样（baseStyle）
```
- **`s` 必须是完整 cssText**，不要写 `style="..."` 特性（见 §4）。
- bootstrap 会**跳过 `<script>` 节点**；页面脚本走独立资产注入通道，不能靠 DOM 里的 `<script>`（见 §6.1）。

### 3.3 推荐最小形态（页面型）

`Section` 根 + body 里一个 `fixed` 全屏 `div` + 一个页面脚本 `<script>` 节点（脚本经 `loadPageScriptAsset` 加载，见 §6.1）。

```cpp
dearoreui::api::ComponentSpec root;
root.kind = ComponentKind::Section;   // 透明包裹，不抢布局
DomNode shell;
shell.tag   = "div";
shell.style = "position:fixed;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;";
DomNode pageScript;
pageScript.tag  = "script";
pageScript.text = myModPageScript;    // 注入通道，不走 DOM 渲染
root.body = { shell, pageScript };
mApi.registerComponent(mModId, ui, root);
```

---

## 4. 样式通道（引擎级，务必遵守）

Coherent Gameface 引擎只有**一条可靠**的样式注入通道（`DomNode.h`/`ComponentRenderer.cpp`，stage7 联动）：

| 通道 | 可靠性 | 说明 |
| --- | --- | --- |
| `el.style.cssText = "...";` | ✅ 可靠 | CSSOM 唯一可靠通道 |
| HTML 内联 `style="..."` | ❌ 丢弃 | innerHTML 注入的 style 被丢弃，`getAttribute` 也拿不到 |

```js
// ✅ 可靠
el.style.cssText = "color:#fff;font-family:...;";
// ❌ 丢弃
el.innerHTML = '<div style="color:#fff">x</div>';
```

---

## 5. 布局引擎约束（Coherent Gameface / Yoga）

OreUI 用 Coherent Gameface（Yoga）布局，只认 flex 模型。硬约束：

1. **display 只有 `flex` / `none` 有效**。`grid`、`inline-block`、`inline-flex`、`block` 会被**静默忽略**（`display:grid` 一行注释即证据）。
2. **动画只能动 `transform` / `opacity`**。改 `top/left/width/height` 会触发 O(4^深度) 的整树布局重算（进度条等复用以 static 定位的 keyframe 资源，见 §6.3）。
3. **全屏容器必须 `position:fixed` + `top/left/right/bottom:0`**，**禁止 `100vw/100vh`**（后者触发整树重算）。
4. **`fixed` + `width:100%` 解析到最近定位祖先而非视口**；嵌套在无尺寸容器中会塌缩为 0×0。修复：容器自身全屏（`fixed`+四边 0），子层用 `absolute; top/left/right/bottom:0` 撑满。
5. **全屏 flex 容器内 `flex-grow` / `flex-basis` 解析不可靠**；用**显式像素几何**（absolute + left/top/width/height）取代 flex 撑满。
6. **网格（如日历）一次构建、原地更新**格子；不要在每次 render 时整棵重建子树，否则绝对定位错位。
7. 组件静态 `label` **不要直接用中文**——真机验证发现主题字体对静态 CJK label 支持不稳定；动态内容走页面脚本 / 事件。

---

## 6. 通信（C++ ↔ 页面）

### 6.0 页面侧运行时 `window.oreui`（stage8，页面上下文就绪后注入）

完整表面见 `assets/stage5-runtime.js`（构建嵌入为 `generated/BuiltinAssets.gen.h`）：

| 成员 | 说明 |
| --- | --- |
| `window.oreui.runtime.isReady()` | `!!window.__DearOreUI__.ipc.isAvailable()`，即 facet 通道是否可用 |
| `window.oreui.host.call(method, args)` | 一次 JS→C++ 调用，返回 Promise；契约见 §6.3 |
| `window.oreui.event.on(name, cb)` / `off(name, cb)` | 订阅 C++ `publishEvent`；`cb(payload)` 的 payload 是**已解析对象** |
| `window.oreui.page.contextId()` | 当前页面上下文 id（数值） |
| `window.oreui.diagnostic.report(msg)` | facet 诊断上报（fire-and-forget） |

底层 `window.__DearOreUI__`：`.events`（事件总线）、`.bus`（host 回复总线）、`.ipc`（isAvailable/callHost/report）。正常写 UI 不需要直接用它们。

> 事件推送的注入方式是：C++ 组装 `try{window.__DearOreUI__.events.push("<name>", <options.payload>);}catch(e){}` 再 `ExecuteScript`，其中 `<options.payload>` 是原始 JSON，落在 JS 里就是**对象字面量**——所以 `oreui.event.on` 回调拿到的 `p` 已是对象，直接 `p.events` 即可，**无需 `JSON.parse`**。

### 6.1 C++→JS：`publishEvent`（事件推送）

页面 Ready 回调里保存 `ContextId`，随后推送种子事件（见 ex03）：

```cpp
dearoreui::api::EventPublishOptions options;
options.owner   = mModId;
options.context = ctx;                 // 页面 Ready 拿到的上下文
options.name    = "calendar.events";   // ≤128，限 [A-Za-z0-9._-]
options.payload = "{\"events\":{...}}"; // 必须是完整 JSON
auto ev = mApi.publishEvent(options);  // 返回 bytes/queued
```
命名 / 载荷非法（`validateEventName`、payload 非完整 JSON）会被拒绝。

JS 订阅（payload 即对象，直接取值）：

```js
window.oreui.event.on('calendar.events', function (p) {
    if (p && p.events) state.events = p.events;
    render();
});
```

### 6.2 C++→JS：帧驱动 `subscribeFrame`（唯一可靠周期源）

客户端不要用 JS `setInterval` 当游戏数据源；`subscribeFrame` 是**唯一可靠周期源**，且回调只在页面存活期触发。

```cpp
dearoreui::api::FrameSubscriptionOptions frameOpts;
frameOpts.modId = mModId;
mFrame = mApi.subscribeFrame(frameOpts);
mFrame->onTick([this](ContextId /*ctx*/) {
    if (++mFrameCounter % 30 != 0) return;   // 粒度控制
    auto now = currentSecondKey();
    if (now == mLastSent) return;            // 按秒去重
    mLastSent = now;
    pushFramePayload(now);                   // publishEvent
});
```

### 6.3 JS→C++：`registerHostMethod`（带权限校验）

C++ 注册（见 ex03）：

```cpp
class CommunicationInitMethod final : public dearoreui::api::IHostMethod {
public:
    std::string name() const override { return "calendar.init"; }
    dearoreui::api::Permission requiredPermission() const override {
        return dearoreui::api::Permission::HostReadOnly;
    }
    dearoreui::api::Result<std::string>
    execute(dearoreui::api::ContextId /*contextId*/, std::string_view /*args*/) override {
        return dearoreui::api::Result<std::string>::success(mOwner.handleInit());
    }
};
dearoreui::api::HostMethodManifest hm;
hm.name = "calendar.init";
hm.pageScopes    = { dearoreui::api::PageScope::Any };
hm.permissions   = { dearoreui::api::Permission::HostReadOnly };
auto host = mApi.registerHostMethod(mModId, hm, std::make_shared<CommunicationInitMethod>(*this));
```

JS 调用（**契约：`.then(res)` 的 `res` 不是 JSON 字符串，而是已解析的封装对象** `{type,id,ctx,method,payload,error}`；业务数据在 **`res.payload`**——一个 JSON **字符串**，需再 `JSON.parse(res.payload)`；`res.error` 是数值错误码，`0` 表示成功。**不要**对 `res` 整体 `JSON.parse`，它已是对象，强转会抛 `[object Object]`）：

```js
window.oreui.host.call('calendar.init', { want: ['today','events'] })
  .then(function (res) {
      if (!res || res.error) { state.events = {}; render(); return; }
      try { var p = JSON.parse(res.payload); state.events = p && p.events ? p.events : {}; }
      catch (e) { state.events = {}; }
      render();
  }).catch(function(){});
```
> 格式源自 `serializeIpcMessage`（`src/ipc/IpcMessage.cpp`）→ JS `bus.push` 的一次 `JSON.parse`。

> [!IMPORTANT] 硬限制（facet 单发）
> 一个页面 dispatch 通道在一次业务派发后即占满，**同页只允许一次 JS→C++ 调用**（`BuiltinAssets.gen.h` 中 `dispatchUsed` / “one dispatch per view”；`StaticCapabilityQuery` 亦注明）。不要为了“双向完整”再加第二次 dispatch——把多目标数据并入一次调用，其余用 C++→JS 方向补齐。

**事件 payload 的契约要在 C++ / JS 两端保持一致**（一个 shape 两端解析），避免散落多处手写 JSON。

---

## 7. 安全校验（v0.1.2，fail-closed）

所有**外部 `htmlBody`** 在注册时即经 `HtmlSanitizer::validate` 校验，不通过**直接拒绝注册**（`ErrorCode::InvalidArgument`）。规则（`src/security/HtmlSanitizer.cpp`）：

- **标签白名单**：`div span button img br hr input label ul ol li table thead tbody tr th td section p strong em b i h1 h2 h3 h4 h5 h6`。
- **禁止标签**：`script iframe object embed link meta style form base template svg math frameset frame audio video source`（`<style>` / `<form>` 即使未来加白名单也 fail）。
- **禁止属性**：所有 `on*` 事件属性（如 `onclick`）。
- **URL 协议只允许**：相对路径、以 `/` 开头的绝对路径、`oreui://`；**拒绝** `javascript:` / `vbscript:` / `file:` / `http:` / `https:` / `data:` 及 `//`、`&#` 污染。
- **style 检测**拒绝：`expression(`、`@import`、`behavior:`，以及不安全的 `url(...)`（含 `javascript:` / `data:`）。
- **文本**：含 `<script`（大小写不敏感）拒绝；含 `<script` 或 `<iframe` 快速失败。

因此 `htmlBody` **不能含**内联脚本 / 事件属性 / 外链。动态行为一律交页面脚本 + `oreui.event.on`；页面脚本发布后可用 `addEventListener` 绑真实 DOM 事件与自由 DOM。

---

## 8. 页面脚本注入（独立资产，非内联）

- 页面脚本是**独立 `.js` 资产文件**（`assets/scripts/*.js`，构建拷入 mod 输出），C++ 用 `loadPageScriptAsset`（`mod/examples/PageScriptAsset.h`）读取内容，再经 §3.3 的 `<script>` DomNode 注入通道在页面上下文就绪后执行。
- **不要**内联 `R"js()js"` 常量、**不要**在 DOM 里放 `<script src>` 外链（引擎不执行 DOM 外链脚本）。

脚本挂载后轮询就绪再构建渲染（见 `ex04_calendar.js` / `ex03_communication.js`）：

```js
var tries = 0;
function boot() {
    tries++;
    var root = document.getElementById('cal-root');
    if (!root || !window.oreui) {
        if (tries < 60) setTimeout(boot, 50);   // 就绪前轮询
        return;
    }
    build(root);   // 一次构建 DOM 结构
    render();      // 只更新几何/文本，不在 render 里重建子树
}
boot();
```

---

## 9. 生命周期注销模板（逆序，见 ex03 shutdown）

```cpp
mFrame.reset();               // 先停帧回调（ReleaseFrameSubscription）
mSubDestroyed.reset();        // 再退页面订阅（Destroyed / Ready 各一）
mSubReady.reset();
mHost.reset();                // 再见脱 host method
mUi.reset();                  // 再注销 UI（unregisterUi）
static_cast<void>(mApi.unregisterMod(mModId)); // 最后退 Mod 身份
```
顺序：先停回调、再退 UI、最后退 Mod；每步用保存的 `RegistrationHandle` 并在注销后 `reset()`。`Destroyed` 回调里同样要清上下文、停帧订阅。

---

## 10. 最小模板（连通即 UI）

```cpp
#include "api/IDearOreUIApi.h"
#include "api/manifest/ModManifest.h"
#include "api/manifest/UiManifest.h"
#include "api/types/ComponentSpec.h"
using namespace dearoreui::api;

bool onLoad() {
    ModManifest manifest;
    manifest.id = ModId{"my-first-ui"};
    manifest.modNamespace = "my_first_ui";
    manifest.modVersion  = Version{1,0,0};
    if (oreui->registerMod(manifest).isErr()) return false;

    UiManifest ui;
    ui.modNamespace = "my_first_ui";
    ui.id = "hello";
    ui.kind = UiKind::Overlay;
    ui.pageScopes = { PageScope::Any };
    ui.anchor = UiAnchor::TopRight;
    ui.containerId = makeUiContainerId(ui.modNamespace, ui.kind, ui.id);
    ui.fingerprint = "hello.v1";

    ComponentSpec root;
    root.kind  = ComponentKind::Panel;
    root.label = "Hello";
    ComponentSpec ok;
    ok.kind   = ComponentKind::Button;
    ok.variant = "primary";
    ok.label  = "OK";
    root.children.push_back(ok);

    return oreui->registerComponent(ModId{"my-first-ui"}, ui, root).isOk();
}
```

---

## 11. 陷阱 Checklist

| 现象 | 检查 |
| --- | --- |
| 页面不显示 | 页面是否 OreUI 栈（非 JsonUI）；`boot()` 是否找到根节点；`registerMod` 是否先于 UI |
| 样式全丢 | 是否用了 innerHTML `style="..."`，而没用 `el.style.cssText` |
| grid/block 不生效 | 引擎只认 flex/none |
| `100vw/100vh` 布局卡顿 | 改 `fixed` + `top/left/right/bottom:0` |
| 固定百分比错位 | `fixed`+`width:100%` 解析到最近定位祖先；容器自己全屏 |
| 网格位置漂移 | 是否重建了子树，而没原地更新格子 |
| 中文变方块 | 组件静态 label 直接用了中文；改用动态文本 / 事件 |
| 第二次 host 调用失败 | facet 单发限制，一个页面只 dispatch 一次 JS→C++ |
| host 调用拿不到业务数据 | `.then(res)` 的 `res` 是封装对象 `{type,id,ctx,method,payload,error}`，业务在 `res.payload`（字符串）再 `JSON.parse`；勿对 `res` 整体 parse |
| htmlBody 被拒 | 混入 script/iframe/object/`on*`/危险 URL/`<script` 文本 |
| 页面退出仍刷回调 | 注销顺序是否按 §9 模板 |

---

## 相关（事实源）
- 示例模组：`dearoreui-ExampleMod/src/mod/examples/{ex01..ex04}`、`assets/scripts/{ex03_communication,ex04_calendar}.js`、`mod/examples/PageScriptAsset.h`、`src/mod/MyMod.cpp`（桥加载）
- 运行时 API：`DearOreUI/src/api/`（`IDearOreUIApi.h`、`IUiApi.h`、`IModApi.h`、`IEventApi.h`、`IFrameApi.h`、`IPageApi.h`、`IHostApi.h`、`IHostMethod.h`、`types/{ComponentSpec,DomNode,Page,Id,Event,HostMethodManifest}.h`、`manifest/{Permission,UiManifest}.h`、`bridge/DearOreUIBridge.h`）
- 安全校验：`DearOreUI/src/security/HtmlSanitizer.cpp`
- DOM 渲染 / 序列化：`DearOreUI/assets/stage7-ui-bootstrap.js`、`src/render/DomScriptSerializer.cpp`、`src/component/ComponentRenderer.cpp`
- 页面运行时 `window.oreui` / host 契约 / facet 单发：`assets/stage5-runtime.js`（`generated/BuiltinAssets.gen.h`）、`src/ipc/{IpcMessage,HostDispatcher,OreUIFacetBridge}.cpp`、`src/api/DearOreUIApi.cpp`
