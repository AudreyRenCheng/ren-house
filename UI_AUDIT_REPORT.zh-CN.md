# Audrey's Interactive House 全站 UI / 视觉设计审计

审计日期：2026-07-18  
范围：当前仓库中的 Next.js、React、TypeScript 实现。  
结论基于真实组件、局部样式、状态切换、资源、响应式、动画、层级和可访问性检查。本轮没有修改任何应用源码。

## A. 总体问题摘要

1. **缺少真正的全站设计系统。** `app/globals.css` 只有前景/背景与 Arial 字体别名。组件中共有 333 次十六进制颜色使用、216 个不同值，550 次 `rgba()`、384 个不同值，39 种圆角、114 条各自编写的阴影和 12 个不同断点。
2. **真实空间反复被网页容器包裹。** HouseMap 是“大纸卡套地图框”，RoomView 是“门旁边再放操作便签”，SongPlayer 用一个大圆角木框包住本来已经独立成物件的封面和歌词屏。
3. **装饰数量替代了视觉层级。** Entrance 和 MemoryProjector 的渐变、点纹、边线、胶带、饰带、徽章、阴影很多，但主轮廓和主要动作反而不够安静。
4. **房间差异化不足，系统统一又不够。** 三扇房门基本共用同一结构再换色；另一方面，全局按钮、阴影、focus、断点和 modal 行为又各写各的。
5. **空间层级没有统一约束。** Puzzle、Mode、Melody Lock、Contact、Language、Construction、Sound 和 Projection 分别使用 25、30、40、45、50、60、90 等 z-index，控件可能穿过 modal。
6. **移动端依赖局部补丁。** 现有断点包含 420、520、560、600、760、767、900、980、1100、1180px；fixed/absolute 元素逐个挪动，因此容易出现近期截图中的碰撞和遮挡。
7. **字体角色过少。** 全站主要是 Arial，且大量使用 800/850/900。房屋门牌、正文、物件标签、系统按钮因此像同一套粗体 UI。
8. **可访问性完成度不一致。** ContactInfo 和 ConstructionNotice 的焦点管理较完整；PuzzleModal 没有 dialog 语义、焦点锁定和 Escape；`app/layout.tsx` 永远输出 `<html lang="en">`。
9. **可见的半成品内容仍在。** `public/images/profile/music-profile.jpg` 不存在，Music Room Intro 会显示开发占位；联系方式数据仍有 TODO。

## B. AI 生成感的具体来源

### 1. 同一种表面配方被重复套用

常见配方是“浅色渐变 + 点状纹理 + 半透明边框 + 小圆角 + 多层阴影”。它同时出现在：

- `.paper-map`：`app/page.tsx:331`
- `.projector-table`：`components/MemoryProjector.tsx`
- `.melody-panel`：`components/MelodyLock.tsx`
- `.construction-notice`：`components/ConstructionNotice.tsx:120`
- Contact 面板与多个便签

这些表面单独看不差，但放在一起会像来自同一条生成提示。后续应让纹理归属材质：纸才有纤维/细点，墙面保持大面积安静，木材强调纹理方向与厚度，金属用窄高光和深边缘。

### 2. 卡片套卡片

- HouseMap：`.paper-map` 里又有一个带边框和 inset shadow 的地图，每个房间还是矩形按钮。
- RoomView：`.room-door` 与 `.room-note` 都能触发同一动作，后者成为重复 CTA 卡。
- SongPlayer：`.wood-frame`（`components/SongPlayer.tsx:212`）包着已有边框的封面与 `.lyrics-screen`（`:372`）。
- ContactInfo：抽屉里每条联系方式又是独立卡片行。

不应删除所有“框”，而应只保留物理上确实有框的对象：门框、唱片封套、电子墨水屏边框、相框、投影幕。

### 3. 所有东西都向上浮

地图房间、房门、唱片、幻灯片、CTA 都有 hover 上移。唱片和幻灯片可以被拿起，但固定在墙上的门不应该像卡片一样抬起。`components/RoomView.tsx:639` 的房门 hover 是最明显例子。

### 4. 装饰没有明确内容归属

Entrance 约 1300 行，双开门同时包含多层门框、饰带、图案、圆章、门牌、钥匙标签、tooltip、快速入口和便利贴。MemoryProjector 超过 1200 行，还重复构造投影机 DOM。主物件已经足够有辨识度，但空白处被继续填满，产生典型 AI “每个角落都需要细节”的感觉。

### 5. 房间只是模板换色

`music-door`、`story-door`、`cs-door`（`components/RoomView.tsx:666-681`）共享门体几何；Story 只多一些纸面符号，CS 只多几条模块线。ConstructionNotice 也是同一 modal 结构换变量与三枚装饰。

### 6. 通用网页控件闯入物件世界

`999px` 胶囊圆角出现 23 次。它适合紧凑的 Language/Sound 等全局开关，但不应扩散到翻译、锁具操作、地图细节和物件标签。`SongPlayer.tsx:120` 的浏览器原生 `<audio controls>` 也与自制木材/e-ink 语言不一致，不过在没有完整无障碍自定义播放器前，不建议贸然替换。

### 7. 分批 fade + slide 入场

RoomIntro 用 `introReveal` 让多个子元素在 620ms 内错峰出现。这是常见 landing page 动画。房屋场景更适合一次整体空间过渡，再把短动画留给真实物件动作。

## C. 全站设计系统

### 必须统一与应该变化

**全屋统一：**文字对比、间距刻度、focus、点击面积、返回/语言/声音行为、modal 层级、光源方向、材质做法、交互时长、可访问性。

**按房间变化：**墙面强调色、一种标志材质、门体几何、装饰母题、内容构图、一种代表性交互。可读性和全局控件位置不随房间任意变化。

### 建议 token

后续在 `app/globals.css` 的 `:root` 中建立有限、用途明确的 token：

```css
:root {
  --house-wall: #f4ead7;
  --house-ink: #3f2a1d;
  --house-ink-muted: #76563f;
  --house-paper: #fff7e8;
  --house-wood-light: #e6c18a;
  --house-wood-mid: #b97845;
  --house-wood-dark: #6d4228;
  --house-brass: #b8893f;
  --house-glass: rgba(238, 245, 239, 0.52);
  --state-focus: #126f78;
  --state-success: #4f7f5a;
  --state-danger: #a84943;

  --room-music: #e9bd67;
  --room-story: #d98fa3;
  --room-cs: #78b7b0;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 18px;
  --space-5: 28px;
  --space-6: 44px;

  --radius-detail: 2px;
  --radius-object: 5px;
  --radius-control: 10px;
  --radius-round: 999px;

  --shadow-contact: 0 2px 0 rgba(63, 42, 29, 0.18);
  --shadow-raised: 4px 8px 18px rgba(63, 42, 29, 0.16);
  --shadow-deep: 10px 20px 44px rgba(45, 29, 19, 0.24);

  --duration-fast: 140ms;
  --duration-object: 220ms;
  --duration-room: 420ms;
  --ease-object: cubic-bezier(.2, .8, .2, 1);
  --ease-room: cubic-bezier(.22, .7, .2, 1);

  --z-scene: 0;
  --z-object: 10;
  --z-control: 100;
  --z-overlay: 200;
  --z-dialog: 210;
}
```

### 色彩

当前重复颜色集中在棕色族：`#7a4a28` 19 次、`#3f2a1d` 10 次、`#9b673c` 9 次、`#5a321d` 6 次，另有大量近似 rgba 棕色。应收敛为主文字、次文字、中木、深木四个角色。

`#ffd36f` 使用 12 次，适合作为 Entrance 的小面积高光，不适合继续扩展到阅读表面。`data/rooms.ts` 的 Music `#e7b86a`、Story `#d98fa3`、CS `#78b7b0` 可作为主题锚点，但每个房间必须继续共享全屋木材、纸张、墨色与金属色。

### 字体

- **Display / house signage：**`ui-serif, Georgia, "Noto Serif SC", "Songti SC", serif`，只用于门牌、房间名、少量标题。
- **Body / reading：**`-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif`。
- **Label / object text：**沿用 body，小字号和适度粗细；monospace 只用于 CS 终端与 e-ink 元数据。

移除 850 这类在 Arial 上没有可靠效果的字重，减少 800/900。英文 uppercase/letter-spacing 不应机械套到中文。

### 光源、透视与层级

- 主光源统一来自左上；凸起物体阴影朝右下；凹陷/e-ink 只用 inset shadow。
- 墙、门、地图以正视角为基线；只有能被拿起的物件和家具边缘表现厚度。
- 层级固定为：墙面 -> 固定家具 -> 内容物件 -> 交互物件 -> 全局控件 -> overlay -> dialog。
- PC 场景边距用 `clamp(24px, 4vw, 64px)`；正文保持约 42-66 字符宽。
- 手机端使用独立纵向构图、18-22px 侧边距、44px 最小点击区域，并预留顶部/底部全局控件区，不按比例缩小桌面绝对坐标。

### 材质规则

- **Painted wall：**单一基础色 + 大范围低频变化，不铺重复点阵。
- **Wood：**纹理有方向、1px 边缘高光、一个接触阴影，仅在合理位置露出侧面厚度。
- **Paper：**暖白底、轻微纤维/点纹、1-2px 不规则或旋转、柔和接触阴影。
- **Fabric：**漫反射变化，不使用锐利高光。
- **Brass/metal：**深边 + 窄高光 + 小面积亮点，用于门把、铃、固定件。
- **Glass：**透明主体 + 边缘/反射；不把 backdrop blur 当默认玻璃。
- **E-ink：**灰绿哑光屏、内凹边框、低对比、无 glow。

### 控件与图标

- **全局系统控件：**Back、Language、Sound、Mode 共享 44px 点击区、2px focus ring 与统一布局；只有这组允许紧凑圆形/胶囊。
- **空间物件交互：**门、钥匙、唱片、幻灯片、信件保持物件外观和物理反馈。
- **内容操作：**纸质/木质短标签，不统一做胶囊。
- **媒体控件：**形成一个完整播放器面板；若自定义，必须保留键盘、读屏、拖动、时长、音量等能力。
- 图标统一 1.75-2px 线宽、18/20/24px 尺寸；领域物件可继续用 CSS 绘制，不混用 emoji 作为正式控件。

### 动画

- Micro interaction：120-160ms，位移 1-2px。
- Object movement：180-260ms，按铰链、滑轨、拿起动作设 transform origin。
- Room transition：360-480ms，一次整体空间过渡，不让每段文字分别飞入。
- 持续动画只用于明确的 active 状态，例如投影光束。目前只有 4 个组件有 reduced-motion 规则，应覆盖 Entrance、HouseMap、RoomView、MelodyLock、SongPlayer、SoundToggle、MemoryProjector。

## D. 逐页问题清单

### Entrance - `components/Entrance.tsx`

**保留：**双开门、钥匙选模式、不对称简介、鲜明墙色、快速进入 Music Room。它已经比普通 landing hero 更符合世界观。

**问题：**姓名/身份/简介、`quick-music-pass`、门牌、两串钥匙标签及 tooltip、便利贴同时争夺注意力。门上多层边框、饰带、圆章、点纹、面板在手机上压缩后尤其拥挤。1180/900/760/420 四组断点分别挪动绝对定位物件。

**建议：**只保留一个强门框纹样和一个门板母题，删减约 25%-35% 无语义细节。手机端让简介 -> 快速路径 -> 大门进入正常文档流，钥匙和便签各自占固定区域。门继续落地，不增加外层 card。

**改动类型：**主要 CSS，少量 DOM 分组；状态风险低，响应式风险高。

### HouseMap - `app/page.tsx:212`、`components/HouseMap.tsx`

**问题：**`.paper-map` 已经是有胶带、旋转、点纹、阴影的纸卡，内部地图又有边框/网格/inset shadow。房间是统一矩形按钮，施工标记像 status badge。全局控件靠独立 fixed 坐标手工堆叠。

**建议：**纸张本身成为唯一外框，移除一层边框/阴影。保留手绘平面结构，用门扇弧线、楼梯方向、铅笔批注和入口磨损增加生活感。施工状态改成钉在图上的纸条。未来用户自绘地图应作为主体资产，交互热点覆盖在上方。

**改动类型：**第一步可纯 CSS；以后接入手绘地图需要 DOM/热点结构。必须保留 `onRoomClick`、`visitedRooms`、`unlockedRooms`。

### RoomView - `components/RoomView.tsx`

**问题：**三扇门共用几何模板。Story 的符号、CS 的线条不足以形成空间性格。模糊地图背景不像站在房间门口。`.room-note` 与门重复操作；门 hover 抬起；门牌、锁、状态和便签重复表达同一状态。

**建议：**仅共享尺寸与锁定状态。Music 用暖木门、黄铜和声学节奏；Story 用偏心构图、粉色涂刷、纸页/装订细节；CS 用浅蓝工作间门、模块接缝、磨砂小窗和工具标签。只保留门为主要动作，便签改为非按钮状态或真正贴在门上。

**改动类型：**DOM + CSS；中等状态风险，需保护 `handleDoorClick`、MelodyLock、施工 focus return、quick entry 和 unlocked 逻辑。

### Music Room - `MusicRoom.tsx`、`RoomIntro.tsx`、`MusicShelf.tsx`

**保留：**Intro 与唱片架同页、e-ink 标签、唱片封套、从简介向下进入作品的滚动路径。

**问题：**`.intro-stage` 非按钮却保留 `cursor: pointer`；多个子元素分批 `introReveal`；唱片/歌词纸/胶带像填空装饰；首段横线通过局部元素的 `100vw` 伪元素实现，较脆弱；主人照片资源缺失。MusicShelf 仍是一个大框，并强制至少三行，用虚线空位补齐。JS 在 768px 改两列，CSS 在 767px 改布局。RoomIntro/MusicShelf 还有已不使用的 `.back-link` CSS。

**建议：**Intro 改为墙面构图，照片像真正挂/贴在墙上，文案作为墙上印刷或纸页；墙面材质自然延续到更简单的唱片架。空架子保留真实空白，不生成模板占位卡。响应式只保留一个真值来源。

**改动类型：**先做安全 CSS 清理；照片/架子需要小 DOM 调整。缺图属于内容资源阻塞。

### SongPlayer 与 MemoryProjector

**问题：**`.wood-frame` 把唱片、播放器、歌词屏重新包装成 dashboard card；原生 audio 与木材/e-ink 不协调；翻译按钮是通用胶囊。MemoryProjector 体量超过 1200 行、重复投影机结构，projection dialog 没有焦点锁定、初始焦点和 body lock，光束持续动画没有 reduced-motion。

**建议：**让封套、播放机、歌词屏成为同一桌面/架子上的三个相邻物件，移除大外框。暂时保留原生 audio，直到能完整实现无障碍播放器。翻译改成 e-ink 小开关。投影机提取内部视觉组件，并复用 ContactInfo 的 dialog 行为。

**改动类型：**构图需要 CSS/DOM；自定义音频控件风险高；投影机提取为中等 DOM 风险。

### Contact - `components/ContactInfo.tsx`

**保留：**dialog 语义、Escape、focus trap/return、body scroll lock、主题变量。

**问题：**固定按钮按页面调位置，已多次与内容碰撞。抽屉仍是标准商业 modal：大标题 + 多张联系方式卡。五种主题主要换色。触发器 z45、面板 z90 不属于统一层级。

**建议：**保留一个全站通信抽屉；触发器放进页面拥有的固定插槽/控制轨。联系方式在一张信纸上用清晰行展示，不再每条套卡。房间差异只体现在触发物件和一个强调色。

### ConstructionNotice - `components/ConstructionNotice.tsx`

**保留：**焦点管理、关闭行为、双语内容、克制的趣味文案。

**问题：**视觉仍是居中 modal card，不像挂在门上的施工告示。Story/CS 是同结构换色。z50 与其他控件冲突。

**建议：**继续保留 modal 语义，但让展开表面与门上的大告示位置一致。Story 使用折叠纸/未装订页，CS 使用夹住的施工单/柔和终端打印纸，不只换胶带颜色。

### 锁具与全局控件

MelodyLock 的旋律机关有明确房间语义，但外观还是居中纸面 modal，可在后续视觉上装到 Music 门侧。PuzzleModal 是当前最大无障碍缺口：全部 inline style、z25、无 `role="dialog"`、无 `aria-modal`、无焦点锁定、无 Escape，三个操作又都是通用胶囊。

LanguageSwitcher、ModeSwitcher、SoundToggle、Back、Contact 各自 fixed 定位。应建立共享 `GlobalControls` 布局所有者或 CSS 控制轨，同时保持现有 callback 与 screen 状态不变。

## E. 修改优先级

### P0：上线前必须处理

1. 建立统一 z-index contract，所有 modal 高于所有全局控件。
2. 让 PuzzleModal 与 MemoryProjector projection 达到 ContactInfo 同级的 dialog 可访问性。
3. 补充真实 Music Room 主人照片，或用正式占位内容替换开发提示。
4. 发布前替换联系信息 TODO。
5. 语言切换时同步 `document.documentElement.lang`。
6. 用共享全局控制区域解决移动端碰撞，不再增加单点 offset。

### P1：最显著提升完成度

1. 建立全局颜色、间距、圆角、阴影、动画和层级 token。
2. HouseMap 简化为单一纸张表面。
3. 重构 RoomView，使三扇门通过几何和材质区分，并只保留门为主要动作。
4. 将 ConstructionNotice 与 MelodyLock 视觉接入房门场景。
5. 精简 Entrance 装饰并建立手机端钥匙/便签固定区域。
6. 统一 Music Room 墙面连续性，减少 Intro hero 动画和 Shelf 模板占位。
7. 移除 SongPlayer 的大外卡构图，同时保留原生音频可访问性。

### P2：后续精修

1. 视觉规则稳定后再提取材质和 projector/door 内部 primitive。
2. 只有在能完整保留音频能力时才制作自定义播放器。
3. 添加与真实内容有关的磨损和生活痕迹，不添加随机星星/点点。
4. 分别微调中英文排版并测试长文案。
5. 在不破坏唱片封套布局的前提下使用 `next/image`。
6. 建立 Entrance、Map、RoomView、Music、SongPlayer 与所有 modal 的响应式截图回归。

## F. 技术风险

| 区域 | 纯 CSS | 需要 DOM | 状态/逻辑风险 | 响应式风险 | 可访问性/音频风险 |
| --- | --- | --- | --- | --- | --- |
| token、阴影、圆角、字体 | 大部分 | 否 | 低 | 中 | focus 对比 |
| 全局控制轨与 z-index | 部分 | 很可能 | 低 | 高 | modal 隔离 |
| Entrance 精简 | 大部分 | 小分组 | 低 | 高 | 钥匙可点击标签 |
| HouseMap 纸面 | 首轮可 | 手绘图热点需 | 必须保留状态 | 高 | 房间按钮命名 |
| 三种房门 | 否 | 是 | 中 | 高 | 门状态/动作 |
| Construction/Melody 接门 | 否 | 是 | 中 | 中 | focus return/trap |
| Music Intro/Shelf | 混合 | 是 | 低 | 高 | 阅读顺序 |
| SongPlayer | 混合 | 是 | 中 | 高 | 原生/自定义 audio |
| Contact 触发器位置 | 混合 | 小 | 低 | 高 | 保留 dialog 行为 |
| 页面/房间动画 | 大部分 | 可能 | screen 时机 | 中 | reduced motion/音效 |

`app/page.tsx` 的 screen 状态系统不应改变。风险最高的路径是 quick Music entry、RoomIntro 返回来源、Explore 解锁、MelodyLock 完成、施工提示 focus return、SongPlayer 返回和 UI sound 单次触发。

## G. 后续实施顺序

1. **系统基础：**token、z-index、focus、语言属性、modal 可访问性、响应式全局控制轨；先不重做页面风格。
2. **房屋导航：**简化 HouseMap，重构 RoomView/ConstructionNotice 为三扇真正不同的门，保持全部状态回调。
3. **Entrance：**减少装饰噪声，固定移动端信息流，保留双开门与快速 Music 两条路径。
4. **Music Room：**补照片、简化 Intro、让同一墙面延续到 Shelf、清理死 CSS 与模板空位。
5. **歌曲体验：**拆开封面/播放器/歌词物件，再处理 MemoryProjector 重复与可访问性。
6. **Contact：**保留一个无障碍抽屉，减少卡片化，把主题触发器放进页面插槽。
7. **验证：**覆盖 360/390/430 手机、768 平板、1280/1440 桌面，中英文、键盘、reduced motion、Explore/Casual 和每次动作只播放一次 UI 音效。

## 当前验证基线

- `npm.cmd run build`：通过，包括 TypeScript 与静态生成。
- `npm.cmd run lint`：通过；有 2 个 `@next/next/no-img-element` warning，位于 `MusicShelf.tsx:185` 和 `SongPlayer.tsx:105`。
- CSS Modules：未发现。
- Tailwind：未发现有意义的组件 utility 使用；当前主要为 styled-jsx 与 inline style。
- 本轮应用源码修改：无，仅新增审计文档。

