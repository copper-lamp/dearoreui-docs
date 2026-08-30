# DearOreUI UI Skills

---

## 1. 模型总览

DearOreUI 采用**声明式**扩展模型：Mod 先注册自身，再声明要显示的 UI，运行时负责渲染与注入。UI 由 `UiManifest` + `ComponentSpec`（组件树）或原生 `DomNode`（原始 DOM）描述，经 `ComponentRenderer` 渲染、走统一 CSSOM 管线注入到真实 OreUI 页面。

```text
Mod 声明（ModManifest → registerMod）
   │
   ├─ UiManifest + HTML/DomNode ──→ registerOverlay / registerPanel / ...
   ├─ UiManifest + ComponentSpec ──→ registerComponent
   └─ 页面脚本（资产文件 → <script> DomNode → boot()）
```

完整链路只有两类页面：**OreUI 技术栈**（如世界列表 `/play/all`）被支持；**JsonUI 技术栈**（主菜单 / 世界内）暂时不受支持。

---

## 2. UI 清单（UiManifest）

```cpp
dearoreui::api::UiManifest ui;
ui.modNamespace  = "my_mod" /* 已在 registerMod 注册 */;
ui.id            = "hello";
ui.kind          = dearoreui::api::UiKind::Overlay;  // Overlay | Panel | Button | Page
ui.pageScopes    = {dearoreui::api::PageScope::Any}; // 显示范围
ui.anchor        = dearoreui::api::UiAnchor::FullScreen; // TopLeft...FullScreen
ui.pointerEvents = true;
ui.containerId   = dearoreui::api::makeUiContainerId(ui.modNamespace, ui.kind, ui.id);
ui.fingerprint   = "hello.v1"; // 冲突检测用
```

要点：
- 先 `registerMod`，否则资源 / UI 注册会失败。
- `containerId` 用 `makeUiContainerId` 生成，不要手拼。
- `anchor` 是挂载锚点，不等于内容固定在某角；页面型 UI 用 `FullScreen` 并让根节点接管整个视口。

---

## 3. 组件规格（ComponentSpec）

所有组件共享同一个规格（`dearoreui::api::ComponentSpec`）：

```cpp
dearoreui::api::ComponentSpec spec;
spec.kind     = ComponentKind::Button;
spec.id       = "submit-btn";     // 布局锚点 → 渲染为根节点 DOM id
spec.label    = "确定";            // 主文本
spec.variant  = "primary";        // primary/secondary/neutral/destructive
spec.style    = "normal";         // button: normal|elevated；panel: default|dark|furnace|...
spec.disabled = false;
spec.state    = "default";        // default|hovered|focused|pressed|disabled
spec.events   = {"click"};        // 声明的事件，用于接线
spec.children = { /* 子组件树 */ };
spec.body     = { /* 原始 DomNode，仅 panel/card 正文 */ };
// 布局/组合/数据组件专属字段：
spec.orientation = "column";       // stack
spec.columns     = 4;              // grid
spec.icon        = "close";        // icon/image 语义键
spec.src         = "";             // image 显式 URL（覆盖 icon）
spec.value       = "1";            // slider/stepper/pager 当前值
spec.min = "0"; spec.max = "100";  // slider 范围
```

### 3.1 ComponentKind（37 种）

- **原子 A（14）**：Button、Panel、Text、Card、ListItem、Input、TabBar、Divider、Tooltip、ContainerSlot、KeyIcon、Bubble、FilterBar、Progress
- **布局 L**：Stack、Grid、ScrollView、Section、Spacer
- **组合 B**：Modal、Menu、ScrollingList、Dropdown、Form、NavigationBar、Toast、SearchField、Toggle
- **导航 N**：Breadcrumb、Pager
- **交互 I**：TextArea、Slider、Stepper、Picker
- **数据 D**：Icon、Image、Badge

> [!IMPORTANT]
> 组合组件（Dropdown/Modal/Slider 等）当前提供渲染与 `state` 切换；**点击事件 → C++ 分发属后续里程碑**，不要在代码里假设点击已回传 C++。

### 3.2 DomNode（原始 DOM）与序列化格式

控制力不足时才用 `body` 注入原始 DOM。节点序列化为 bootstrap 渲染器消费的数组字面量 `{t,s,x,a,c}`：

```text
t = tag（空→div）        s = cssText 声明串      x = 文本（仅叶子）
a = [["attr","value"]]   c = 子节点
st = 状态 cssText 表（交互组件）   b = 共享非纹理部分（baseStyle）
```

- **`s` 必须是完整 cssText**，不要写 `style="..."` 特性（见 §4）。
- bootstrap 会**跳过 `<script>` 节点**；页面脚本要走独立资产注入，不能靠 DOM 里的 `<script>`（见 §8）。

---

## 4. 样式通道（引擎级，务必遵守）

Coherent Gameface 引擎只有**一条可靠**的样式注入通道：

| 通道 | 可靠性 | 说明 |
| --- | --- | --- |
| `element.style.cssText = "...";` | ✅ 可靠 | CSSOM 唯一可靠通道 |
| HTML 内联 `style="..."` | ❌ 丢弃 | innerHTML 注入的 style 会被丢弃，getAttribute 也拿不到 |

```js
// ✅ 可靠
el.style.cssText = "color:#fff;font-family:...;";
// ❌ 丢弃
el.innerHTML = '<div style="color:#fff">x</div>';
```

---

## 5. 布局引擎约束（Coherent Gameface / Yoga）

OreUI 用 Coherent Gameface（Yoga）布局，只认 flex 模型。硬约束：

1. **display 只有 `flex` / `none` 有效**。`grid`、`inline-block`、`inline-flex`、`block` 会被**静默忽略**。
2. **动画只能动 `transform` / `opacity`**。改 `top/left/width/height` 会触发 O(4^深度) 的整树布局重算。
3. **全屏容器必须 `position:fixed` + `top/left/right/bottom:0`**，**禁止 `100vw/100vh`**（后者触发整树重算）。
4. **`fixed` + `width:100%` 解析到最近定位祖先，而非视口**；嵌套在无尺寸容器中会塌缩为 0×0。
   - 修复：容器自身全屏（`fixed` + 100%），子层用 `absolute; top/left/right/bottom:0` 撑满。
5. **全屏 flex 容器内**，`flex-grow` / `flex-basis` 解析不可靠；用**显式像素几何**（absolute + left/top/width/height）取代 flex 撑满。
6. **网格（如日历）一次构建、原地更新**格子；不要在每次 render 时整棵重建子树，否则绝对定位错位。
7. 组件静态 label**不要直接用中文**——真机验证发现主题字体对静态 CJK label 支持不稳定；动态内容走页面脚本 / 事件。

---

## 6. 主题令牌 + 9-slice + 动画

### 6.1 颜色令牌（语义化，勿硬编码）

| 令牌 | 默认 | 用途 |
| --- | --- | --- |
| `colorPrimary` | `#3c8527` | 主操作 |
| `colorSecondary` | `#d0d1d4` | 次要元素 |
| `colorDestructive` | `#ca3636` | 危险操作 |
| `colorText` / `colorMuted` | `#ffffff` / `#b1b2b5` | 文本 / 弱化文本 |
| `colorDisabled` / `colorPanel` | `#d0d1d4` / `rgba(0,0,0,0.72)` | 禁用 / 面板背景 |

另含字体、`fontSizes[0..7]`（10~64px）、`lineHeights[0..5]`、`letterSpacings[0..1]`、`spaces[0..7]` 令牌。OreUI **原生深色**，复用原版变量即自动深色，无需切换。

### 6.2 9-slice 纹理

原版观感来自 `border-image` 9-slice：

```css
border-image: url(<resolved>) <slice>;
border-width: <width>;
border-image-outset: <outset>;
```

`ThemeTokens::textures`（键 `<family>.<variant>.<state>`）为空时渲染器回退到 `VanillaAssets::texture(key)`。

### 6.3 动画

- keyframes 由原版页面加载，组件库不打包动画资源。
- 进度条：`radial` → `animation-249c45b`；`linear` → `animation--2c0f9be3`。
- 只经 `element.style.cssText` 设 `animation`（见 §4）。

---

## 7. 安全校验（v0.1.2，fail-closed）

所有**外部 `htmlBody`** 在注册时即校验，不通过**直接拒绝注册**：

- ❌ 拒绝标签：`<script>` / `<iframe>` / `<object>`
- ❌ 拒绝属性：`on*` 事件属性
- ❌ 拒绝 URL 协议：`javascript:` / `file:` / `http:` / `data:`
- ❌ 拒绝越界的 `oreui://` 路径

**动态行为请交给页面脚本 + `oreui.event.on`，不要依赖内联脚本**。DOMPurify 之外，页面脚本可以自由使用 DOM 与真实事件（`addEventListener`）。

---

## 8. 页面脚本注入与通信

### 8.1 页面脚本

页面脚本以**独立 `.js` 资产文件**存放，C++ 侧 `loadPageScriptAsset` 读取，再经 `<script>` DomNode 注入。**不要内联 `R"js()js"`、不要 DOM 里放 `<script src>` 外链**（引擎不执行）。脚本在节点挂载后轮询就绪：

```js
var tries = 0;
function boot() {
    tries++;
    var root = document.getElementById('cal-root');
    if (!root || !window.oreui) {
        if (tries < 60) setTimeout(boot, 50);
        return;
    }
    build(root); render();
}
boot();
```

### 8.2 通信三机制

1. **C++→JS `publishEvent`**：页面 Ready 回调里保存上下文，推送种子事件。
   JS：`window.oreui.event.on('calendar.events', fn)`。
2. **C++→JS 帧驱动 `subscribeFrame`**：客户端**唯一可靠周期源**（不要用 JS `setInterval` 当游戏数据源）。每 N 帧检查、按秒去重。
3. **JS→C++ `registerHostMethod`**：带权限校验（如 `HostReadOnly`）。
   JS：`window.oreui.host.call('calendar.init', {...}).then(fn)`。

> [!IMPORTANT] 硬限制
> 一个页面 dispatch 通道在一次业务派发后即占满，**同页只允许一次 JS→C++ 调用**（facet 单发）。不要为了"双向完整"再加第二次 dispatch。

**事件 payload 的契约要在 C++ / JS 两端保持一致**（一个 shape 两端解析）。

---

## 9. 生命周期注销模板

```cpp
unsubscribeFrame();        // 先停帧回调
unsubscribePage(Destroyed);
unsubscribePage(Ready);
unregisterHostMethod();
unregisterUi();
unregisterMod();
```

按先内后外、先回调后 UI 的顺序；每步用保存的 `RegistrationHandle` 并在注销后 `reset()`。`Destroyed` 回调里也要清上下文、停帧订阅。

---

## 10. 离线预览 vs 真机

App 设计器（Tauri+Vite）可离线预览：选模组目录 → 自动识别 UI（静态扫描 `registerComponent`，只读）→ 画布预览 → 页面日志桥接。用它先清掉布局/脚本高频错误，但：

| 能力 | 离线画布 | 真机 |
| --- | --- | --- |
| 布局引擎（Yoga，flex-only） | 近似 | 一致 |
| 主题 CSS/字体/图集 | CSS 近似 / 导入原版 | 真实资源 |
| 动画 | 仅 transform/opacity | 同样受限 |
| facet 派发 | 单发限制 | 单发限制 |

**离线预览帮省一次进游戏，真机仍须回验**（字号、9-slice、静态 CJK 文本）。

---

## 11. 陷阱 Checklist

| 现象 | 检查 |
| --- | --- |
| 页面不显示 | 页面是否 OreUI 栈；`boot()` 是否找到根节点 |
| 样式全丢 | 是否用了 innerHTML style，而没用 cssText |
| 使用 grid/block 不生效 | 引擎只认 flex/none |
| `100vw/100vh` 布局卡顿 | 改 `fixed`+`top/left/right/bottom:0` |
| 固定百分比错位 | 检查是否为「fixed 解析到最近定位祖先」 |
| 网格位置漂移 | 是否重建了子树，而没原地更新格子 |
| 中文变方块 | 组件静态 label 直接用了中文；改用动态文本 |
| 第二次 host 调用失败 | facet 单发限制 |
| htmlBody 被拒 | 混入 script/iframe/on* / 危险 URL |
| 页面退出仍刷回调 | 注销顺序是否按模板 |

---

## 12. 最小模板

```cpp
#include "ll/api/mod/RegisterHelper.h"
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
    ui.pageScopes = {PageScope::Any};
    ui.anchor = UiAnchor::Center;
    ui.containerId = makeUiContainerId(ui.modNamespace, ui.kind, ui.id);
    ui.fingerprint = "hello.v1";

    ComponentSpec root;
    root.kind = ComponentKind::Panel;
    root.label = "设置";
    ComponentSpec ok;
    ok.kind = ComponentKind::Button;
    ok.variant = "primary";
    ok.label = "确定";
    root.children.push_back(ok);

    return oreui->registerComponent(ModId{"my-first-ui"}, ui, root).isOk();
}
LL_REGISTER_MOD(MyMod, onLoad);
```

---

## 相关文档（事实源，代码与文档须一一对应）
- `DearOreUI/src/api/types/ComponentSpec.h`、`DomNode.h`、`api/manifest/UiManifest.h`
- `DearOreUI/src/security/HtmlSanitizer.h`、`render/DomScriptSerializer.h`
- `DearOreUI/assets/stage7-ui-bootstrap.js`
- Web 文档：`guide/environment`、`guide/handbook/{styling,animation,colors,themes,agent-ui}`、`guide/design-principles`、`guide/offline-debugging`、`components/overview`