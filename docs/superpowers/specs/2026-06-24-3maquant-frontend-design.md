# 3Ma Capital — 官网设计文档 (3maquant.com)

**日期：** 2026-06-24
**状态：** Brainstorming 完成，待写实现计划
**官网定位：** 3Ma Capital 旗舰营销站 — "coming soon / 正在铸造" 基调，把一支尚未运营、自陈"八字还没一撇"的 AI perp quant 资金展示为一个雄心造物。

---

## 0. 项目背景与定位

3Ma Capital 是一支（实质为一人 + AI agent 编队）专注 crypto perp trading 的 AI quant，正在构建代号为 **Alpha Foundry** 的"主权级 AI 量化系统"——从局部指标工具（PerpRadar）升维到全局"战役驱动"架构。架构五个工程化支柱、三本隔离账本、三个核心 schema（Evidence / Campaign / Playbook DSL）。系统尚在铸造期，未运营、未实盘。

官网的唯一任务：在 3maquant.com 上把这个"要做一件没人做成的事"的造物呈现得比现存所有量化资本都酷、高端、Apple 质感，同时保持诚实的"coming soon"基调——不假业绩、不假日期、不假资金。访客在约 3 秒 Forge 动画后进入单线长滚动叙事，经过 6 个章节，其中第 3 章嵌入一段诚实而有含量的活体 Campaign 终端。整页纯前端、全屏动效驱动，无后端、无真数据接入。

### 硬约束

- **诚实。** 终端跑模拟推演（真实历史剧本如 JELLY 回放），不伪造实时盈亏、不贴假业绩、不虚标 AUM。所有文案自称"正在建造 / founding / hypothesis"，不暗示已运营。
- **克制配色。** 近黑底 + 一个主义强调色（暖香槟金 #d4af78）+ 一档辅助（白的不同透明度分层）。零霓虹、不混多色相。详见第 2 节。
- **单线长滚动。** 不做多页路由。导航锚点 scrollTo 到章节而非新页。C 路线的"完整内容"通过章节深度而非页面数量实现，保护沉浸感。
- **唯一外向动作** 是邮件订阅（waitlist）+ Telegram / X 外链按钮。无 contact form，无假倒计时日期。

---

## 1. 信息架构与章节序列

单线长滚动，6 个章节按 scroll spine 顺序铺陈。导航为 hero 后淡入式顶栏，非固定上栏。

| § | 标题 | 内容 | 核心动效 |
|---|---|---|---|
| Hero | 铸造（Forge） | 3s 液态圆环熔铸成 "3MA" → 光环外扩收束 → 页面上浮 | Three.js fragment shader 粒子 + GSAP |
| 1 | Manifesto | "我们是谁 / 要做一件没人做成的事"的军师宣言，3-4 行大字 | SVG 文本描边揭开 + line-mask |
| 2 | 战役驱动 vs 指标驱动 | 旧路线 vs 新路线的 ASCII 流图对照消解 | SVG 路径动画 + morph 对照 |
| 3 | 五大工程支柱 | 五大支柱可折叠面板揭示，中央嵌活体终端 | scroll-pinned 展开 + 终端实时跳动 |
| 4 | 三本隔离账本 | Core / Event / Moonshot 三本账对比卡片 + 风控铁律 | 三栏视差翻转卡 + SVG 分隔墙线 |
| 5 | 目标收益 / 基准 | 非对称凸性 / 右尾捕获的理念表达，不贴数字 | SVG 文本 DrawSVG 揭 + line-mask |
| 6 | Coming Soon | 状态文字 + 订阅 + TG/X + Logo 收尾 | line-mask + 渐隐进度光带 |

---

## 2. Forge 开场动画与全局动效引擎

### 2.1 Forge（3s 开场）时间线

```
t=0.0s   黑屏 + 背景流体着色器以 0.1 alpha 伏笔（低频 FBM 噪声慢流，近单色香槟金）
t=0.3s   中心炸开一团 GPU 粒子点云（~3000 instanced），低饱和香槟金为主、极少冷暗辅助，
         形态由 curl-noise 紊流场驱动 —— 像"熔融态"
t=0.3-1.8s  点云在 curl 场里翻滚、聚拢，逐渐被引力势阱吸入，向中心塌缩
t=1.8-2.4s  点云塌缩成一枚旋转的液态圆环（ring buffer geometry），光环由内向外脉动三次
t=2.4-2.8s  圆环蜕出"3MA"字样 —— 字母由 SVG <use> mask 配合 GSAP MorphSVG
         从粒子形态"结晶"成形；与此同时光环外扩一道冲击波扫过全屏
t=2.8-3.0s  "3MA" 定格、光环收束归位到 logo 锚位；
         底层流体着色器 alpha 抬升到运行值；
         整个 hero 容器做一次 scale 1.04→1 + blur 8px→0 的 "focus" 入场
t=3.0s+   页面解锁滚动；Hero/Manifesto 文案以 line-mask 从下浮入
         → 此时才 lazy import Three.js（canvas 尚未 mount）
```

### 2.2 动效引擎分工

| 当家 | 职责 |
|---|---|
| Three.js 着色器 | 常驻背景流体光晕（curl-noise + FBM，低饱和香槟金）、Forge 点云、§3 终端周边证据粒子流。WebGPU 不可用回退 WebGL2 |
| GSAP + ScrollTrigger | 所有 scroll 触发：章节揭晓（scale-blur-focus）、line-mask、pin（§3 支柱展开、§4 账本翻转）、§5 DrawSVG 描边 |
| Lenis | 平滑滚动驱动，与 ScrollTrigger `scrollerProxy` 咬合，逐帧更新 renderer |
| SVG + MorphSVG / DrawSVG | §1 文本描边、§2 ASCII 流图 morph、传感器极圆、§4 三本账分隔墙线、logo 结晶 |
| reduce-motion | `prefers-reduced-motion: reduce` 一刀全关（详见 §6.4） |
| 低端机降级 | `hardwareConcurrency<4` 或无 WebGPU → 着色器降为 CSS 渐变、粒子减半；动效仍保留（区别于 reduce-motion 的全静态） |

### 2.3 首屏性能策略

- Three.js 不进主 bundle。首屏 ≤60KB：critical CSS inline + GSAP head + hero SVG/CSS。
- `t=2.8s` 动态 import forge-shader；再 import fluid-bg。
- 终端模块在 ScrollTrigger 预检距离时才 import。
- 渲染分辨率按 `devicePixelRatio` 封顶 1.5；粒子上限 8000。
- 目标：LCP < 2.5s on cable/5G；3G 下 4s 内 Forge 仍流畅播完（降级路径）。

---

## 3. 五大支柱章（§3）与活体 Campaign 终端

§3 五大支柱（黑板+Attention Router / 时间尺度分工 / 战役对象 / 传感器网络渐进缩放 / Token Dossier+Playbook DSL）做成可折叠揭示面板，中央嵌一个活体终端作为"系统活着"的证明。

```
[ 五大支柱面板 ]                [ 活体 Campaign 终端 ]
─────────────────────          ┌────────────────────────────┐
▸ 01 黑板+Attention Router      │ 3MA // Field Terminal       │
▸ 02 时间尺度分工          ───► │ ──────────────────────────  │
▸ 03 战役对象 Trade Campaign    │ CAMPAIGN   0xJELLY-25Q1     │
  └ 子项展开                    │ SENSORS · evidence ingest   │
▸ 04 传感器网络                  │ ──────────────────────────  │
▸ 05 Token Dossier+Playbook     │ EVIDENCE STACK (滚动流入)    │
                                │ STATE WATCH→...→CLOSE (流转)│
                                │ ▢ LIVE CHANNEL SEEDING…    │
                                └────────────────────────────┘
```

### 3.1 终端数据来源 —— 走法 C（模拟推演）

Scripted 回放一段真实历史事件——JELLYJELLY 那次"1.2 亿刀持仓 / 深度错配 / ADL 风险 / 币安上所"的反身性爆破。用 10-15 条预制 Evidence JSON 时间轴脚本驱动，状态机 Watch→Armed→Probe→Scale→Close 在约 60s 里真实流转一遍，循环；ScrollTrigger 进入视角才启动，离屏暂停节能。

### 3.2 Evidence Schema（终端显示的核心证据）

```
evidence_id:        string  // 0x... 哈希形态
source_channel:     enum    // MICROSTRUCTURE | EVENT_NEWS | SOCIAL_KOL | ONCHAIN_DEX | CROSS_VENUE
asset:              string  // JELLYJELLY-PERP
tier:               enum    // TIER_0..TIER_4
confidence:         enum    // LOW | MED | HIGH
claim:              string  // 如 "184M pos vs 12M book depth — structural mismatch"
metric_kv:          object  // 如 {pos:"184M", depth:"12M", oi_multiple:"2.4x"}
ts:                 string  // 滚动相对时间
```

### 3.3 Campaign Schema（状态流转主体）

```
campaign_id:        string  // 0xJELLY-25Q1
asset:              string  // JELLYJELLY-PERP
evidence_stack:     evidence[]
playbook:           string  // 如 "REFLEXIVE_SHORT_SQUEEZE"
risk_box:           object  // {max_notional_usd:250000, max_loss_pct:8, adl_defense:true}
state:              enum    // WATCH | ARMED | PROBE | SCALE | CLOSE
state_since:        ts
invalidation:       string  // 触发关闭的条件
pnl_pct:            number  // 仅 CLOSE 态显示，取自历史已知值
```

### 3.4 走法 C 的接口占位 —— "真信号将至"

终端右下角常驻一行轻盈滚动的 `▢ LIVE CHANNEL SEEDING…`，文案层承认"系统在铸造中、真信号通道将接通"。代码里此区块接一个 `EvidenceSource` 抽象接口，当前实现是 `ScriptedEvidenceSource`（回放 JSON），将来实现 `LiveEvidenceSource` 可无缝替换——不换 UI、不换 schema，只换数据源。

### 3.5 与章节的联动

当 §2 "时间尺度分工"面板展开时，终端回放节奏对应切换：0-20s 档播微观盘口异动流，20s-24h 档播战役状态流转，让读面板 + 看终端两条叙事线咬合。ScrollTrigger pin 住 §3 直到终端走完一个完整 Campaign 循环才解锁继续下滑。

### 3.6 终端字体

等宽字（Söhne Mono / JetBrains Mono fallback）。香槟金用于状态流转箭头和 HIGH 标识，其余靠白的不同透明度分层，严格守第 2 节克制配色。

### 3.7 终端视图参考布局

- 顶栏：`3MA · CAMPAIGN ENGINE` + `session 0x3MA-25Q1 · replay mode`
- CAMPAIGN 行：campaign_id + asset + playbook 标签
- SENSORS · evidence ingest：五源 confidence 点阵
- EVIDENCE STACK：5 条 evidence 列表，关键 metric 香槟金点亮
- CAMPAIGN STATE · lifecycle：WATCH→ARMED→PROBE→SCALE→CLOSE 状态轴，当前态加粗点亮
- realized PnL (replay)：仅 CLOSE 态点亮，香槟金数字 + capped at drawdown 注
- 底部：`▢ LIVE CHANNEL SEEDING…` + `playbook 0x3MA · 12 archetypes`

---

## 4. 三本隔离账本（§4）与目标收益（§5）

### 4.1 §4 三本隔离账本

三张并排卡片，各自独立风控、三道分隔墙。卡片随滚动逐张翻转入场（pin + scroll-progress 0→1 驱动），翻入后露出各自风控铁律。

| 卡 | 内容 | 风控铁律 |
|---|---|---|
| **CORE BOOK** | 主流币（BTC/ETH/SOL） | 高胜率、稳定正期望、± controlled |
| **EVENT BOOK** | 突发新闻 / 上币 / KOL 爆破 / 机制错配 | 高盈亏比、asymmetric |
| **MOONSHOT BOOK** | 极端反身性妖币 | 归零心态、单次损失锁死、不允许摊平、利润滚动、right-tail、独立风控 |

- 分隔墙线 = SVG path，香槟金 α=0.5，scroll-progress 驱动描边百分比。
- 三卡主体用近黑 + 白不同透明度分层。仅 `right-tail / asymmetric` 这类强调词用香槟金点亮一处，不闹色。

### 4.2 §5 目标收益 / 基准

不贴虚标数字、不贴假曲线，只表达理念：

```
Target
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  非对称凸性 · 右尾捕获
  ASYMMETRIC  CONVEXITY

  在不死于 Rug 的前提下，
  把资本配置到那些凸性不对称的右尾战役上。

  Drawdown-capped · Convexity-first · Founding hypothesis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

- `ASYMMETRIC` `CONVEXITY` 大词用 SVG 文本 DrawSVG 揭，scroll-progress 驱描边百分比；其余行 line-mask 浮入。
- 三标签 `Drawdown-capped · Convexity-first · Founding hypothesis` 小标签灰字，明示是假设不是业绩。
- 无 count-up、无具体盈亏数字、无 K 线图。

---

## 5. Manifesto（§1）、Coming Soon（§6）、导航与页脚披露

### 5.1 §1 Manifesto 文案轨

紧接 Forge 开场后第一段，3-4 行大字、衬线、line-mask 逐行揭开。口吻：挑衅 + 诚恳，无"领先""颠覆"空词：

```
我们不是在猜价格。

我们正在一座铸炉里，
trying to build something nobody has built before ——
一台把 AI 摆在正确位置上的加密永续战役机器。

AI 不扣毫秒的扳机。它坐在总参谋部里，
用全维度情报重构市场的世界模型，制定战役剧本。
我们全部的工作，是给这位军师一座能动手的工厂。
                    —— 3Ma Capital
```

### 5.2 §6 Coming Soon 收尾

先一句大字定调：

```
我们正在铸造。
Something is being forged.
```

接受入口（需求"其他自我的接受"那层）：

- **邮箱订阅 / waitlist。** line-style 输入框 + 香槟金描边 JOIN 按钮。点击 fetch 到一个 serverless endpoint（Vercel Function / Cloudflare Worker + KV/D1），无后端 DB。提交成功后输入框原地收束成 `You're on the list. — 3MA`，香槟金淡入。
- **Telegram / X。** 两个 text-only 外链按钮。
- **倒计时留白，不设假日期。** 改一行状态文字 `founding · Q4 25 — in progress`（相对说辞，不锁死），配一条香槟金渐隐进度光带（"已开始但未完成"的视觉，不贴百分比）。

### 5.3 全局导航（hero 后淡入式）

Hero 播完、首个 scroll 事件触发后，顶栏从上边缘 -20px 淡入，常驻到底。字号小、字色白 45%；左端 `3MA` wordmark，中部章节锚点（`01 manifesto · 02 thesis · 03 engine · 04 books · 05 target · 06 soon`）由 Lenis 驱动平滑 scrollTo（非原生 jump），右端极小 `Join` 香槟金描边按钮锚 §6。当前章节高亮用 1px 香槟金下划线由 ScrollTrigger 驱动。

### 5.4 页脚与 DISCLOSURE

章节滚到底后还有一层极薄页脚：

- 左 `© 2026 3Ma Capital`，中 `3maquant.com`，右 `Made with AI agents · Anthropic Claude`。
- 下方一行 DISCLOSURE 小字淡入（§2 配色，白 18% 透明）：

```
DISCLOSURE — 3Ma Capital 处于 founding / pre-operational 阶段。
本站所描述系统（Alpha Foundry、Campaign Engine、三本隔离账本）为目标架构与设计原型，
非已运行或已验证的交易系统。本站所有内容均为理念展示与工程愿景，
不构成投资建议、不构成要约、不构成任何形式的回报承诺。
```

---

## 6. 工程与部署架构

### 6.1 技术栈

纯 TS + Vite 构建，无前端框架。Three.js + GSAP + ScrollTrigger + Lenis + SVG（MorphSVG/DrawSVG）+ Tailwind（仅工具类 + tokens）。后端仅一个 serverless endpoint 收订阅邮件。

### 6.2 项目结构

```
3MaQuant Frontend/
├─ index.html               # 单入口,首屏 hero critical CSS inline
├─ src/
│  ├─ main.ts               # 启动:Lenis + GSAP 注册 + 章节编排
│  ├─ forge/
│  │  ├─ forge.ts           # 3s 开场总编时序(timeline)
│  │  └─ forge-shader.ts    # 粒子点云/curl-noise 塌缩(延迟 import)
│  ├─ sections/             # manifesto.ts · thesis.ts · engine.ts(pinned) ·
│  │                        # books.ts · target.ts · soon.ts
│  ├─ terminal/
│  │  ├─ terminal.ts        # Campaign 状态机驱动 + 视图
│  │  ├─ evidence-source.ts # EvidenceSource 抽象接口
│  │  ├─ scripted-source.ts # ScriptedEvidenceSource(回放 JSON)
│  │  └─ replays/jelly.json # JELLYJELLY playbook 回放数据
│  ├─ systems/
│  │  ├─ fluid-bg.ts        # 常驻流体背景着色器(延迟 import)
│  │  └─ nav.ts             # hero 后淡入顶栏 + 锚点高亮
│  ├─ shaders/              # .glsl 原文件,vite glsl plugin inline
│  │  ├─ curl-noise.glsl · fbm.glsl · ring-form.glsl
│  ├─ svg/                  # inline 的 SVG asset
│  ├─ data/                 # 三本账文案、playbook 12 类枚举
│  ├─ styles/               # Tailwind cfg + tokens.css(配色/字号变量)
│  └─ lib/                  # gsap/scrollerProxy 接 Lenis、reduced-motion、dpr-capper
├─ public/                  # 自托管字体子集 woff2、og 图、favicon
└─ vite.config.ts
```

### 6.3 资源加载顺序

1. 首屏 ≤60KB：critical CSS inline + GSAP head + hero SVG/CSS。Forge 立即开演。
2. `t=2.8s`（Forge 临近定格）触发动态 `import('./forge-shader.ts')` —— Three.js 整块才进。
3. Three.js 进入后主线再 `import('./fluid-bg.ts')`，常驻流体背景渲染开始。
4. 终端模块在 ScrollTrigger 预检距离时才 import。
5. 不提前 `<link rel="modulepreload">` 保首屏。
6. WebGPU 探测 `navigator.gpu?.requestAdapter()` 不可用即回退 WebGL2。

### 6.4 reduce-motion 一刀开关

`featureFlags.ts` 集中两个独立标志：

- `reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches`（用户偏好，最重降级）。为真时：
  - Forge 降为 **0.6s opacity glyph fade**（无粒子、无位移）。
  - 流体背景换静态预渲染 PNG（public 里做一张）。
  - 滚被动效全切 `gsap.set()` 瞬时态。
  - 终端回放改**单帧静态状态板**（停在 ARMED 态、附文字注解）。

- `lowEnd = (navigator.hardwareConcurrency ?? 8) < 4 || !webgpuAvailable`（设备能力，轻度降级）。为真时动效仍保留、只减负载：
  - 着色器渲染分辨率封顶 DPR 1.0（非 1.5）。
  - 粒子数砍半（≤4000）。
  - 流体背景降为 CSS 径向渐变（不上 shader）。

两条路径互不否定：reduce-motion 是用户选择"别动",low-end 是机器"动不动得起"。

### 6.5 字体

自托管 woff2 子集（拉丁 + 标点，glyph subset）：

- 正文：Inter / Söhne fallback 系统字。
- 标题：近衬线，Apple 级质，候选 **Fraunces** 或 **Newsreader**，开 `opsz` 可变。
- 终端：**Söhne Mono** / JetBrains Mono fallback。
- 全部 `font-display: swap`。

### 6.6 SVG 还原

- §4 三账分隔墙线 = SVG path，香槟金 α=0.5，ScrollTrigger 描边。
- §5 `ASYMMETRIC` `CONVEXITY` 大词 = SVG 文本 DrawSVG 揭。

### 6.7 构建与部署

Vite build → 纯静态产物 → CDN（默认 Vercel 静态 / Cloudflare Pages）。后端只一个 serverless endpoint 收订阅邮件，存 KV / D1。

### 6.8 诚实边界（实现期承认的取舍）

- 不保证百元安卓流畅，但保证主流设备旗舰体验。
- 着色器渲染分辨率封顶 DPR 1.5、粒子上限 8000。
- 真信号接入是未来 `LiveEvidenceSource` 的事，当前仅为 `ScriptedEvidenceSource`。

---

## 决策摘要（brainstorming 期间确认）

1. 产品形态：**C — 完整多内容官网**，但基调仍 coming soon / 正在铸造。
2. 审美方向：**B — Liquid Aurora**，但配色收为克制——近黑底 + 香槟金。
3. 开场动画收尾：**A — The Forge**，全场满配动效。
4. 官网骨架：**B — Spine + Live Terminal**，§3 嵌活体 Campaign 终端。
5. 终端数据来源：**C — 模拟推演 + live channel seeding 接口占位**。
6. 目标收益表达：理念表达（asymmetric convexity），不贴数字、不贴假曲线。
7. 导航：**hero 后淡入式**，非固定上栏。
8. 技术栈：**走法 1 — 纯 TS + Three.js + GSAP + Lenis**，无前端框架。
9. 配色：**A — Ember on Void**，近黑底 + 暖香槟金 #d4af78，零霓虹。
10. 性能与降级：DPR 封顶 1.5、粒子 ≤8000、reduce-motion / 低端机一刀降级为静态。