> owner: domestic-model-studio-ui-polish-dashboard
> canonical_for: 国产模型接手 studio-workbench 前端 UI 精修时的边界、任务单、验收标准
> upstream: docs/domestic-model-handoff-small-features.md, docs/studio-workbench-architecture-framework.md, docs/studio-workbench-optimization-map-20260610.md
> downstream: studio-workbench/src/features/dashboard/DashboardView.vue, studio-workbench/src/style.css, future UI polish tasks

# 国产模型任务单：门店工作台 UI 精修

更新时间：2026-06-14

## 结论

国产模型可以接手 `studio-workbench` 的前端 UI 细节优化，但只允许做视觉、交互反馈和页面状态小改，不允许改接口、数据库、权限、登录、支付、订单同步或生产部署。

工作目录：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
```

先读：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\studio-workbench-architecture-framework.md
D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\studio-workbench-api-route-map.md
D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\domestic-model-handoff-small-features.md
D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\studio-workbench-optimization-map-20260610.md
```

## 当前 UI 问题

来自 2026-06-14 首页截图，优先修这些问题：

- 字体层级不够稳：页面标题、卡片标题、说明文字和数字之间像临时拼起来的。
- `font-serif` 用得太多，功能型工作台看起来偏书法感，不够现代管理系统。
- 运营卡片缺少图标，右上角 `ORDER`、`ALBUM`、`PICK`、`DELIVER` 英文标签突兀。
- 卡片边框和阴影偏硬，整体像线框稿，缺少精致表面感。
- 日期按钮、搜索框、顶部主按钮的高度、字号、圆角和反馈不统一。
- 提示条太平、太宽，缺少图标和语义层级。
- 页面顶部面包屑和标题区视觉粗糙，左上角层级需要更清楚。

## 设计方向

保留影约云现有风格：

- 深色侧栏。
- 暖米色背景。
- 琥珀/香槟金强调色。
- 高端影楼、门店运营、工作台气质。

不要变成：

- 参考站 `yuyue123` 的橙白老后台。
- 大面积营销页风格。
- 炫技动画页面。
- 纯黑科技风或紫蓝渐变风。

## 固定禁止事项

- 不改任何后端接口路径和请求参数。
- 不改 `backend.ts` 的业务语义，除非只是类型导入整理且有测试。
- 不改 `appStore.ts` 的数据加载逻辑。
- 不改登录、权限、路由守卫、token、生产域名、密钥。
- 不新增 npm 依赖，除非先说明原因并得到明确同意。
- 不把业务 ID 转成 `number`。
- 不在员工工作台增加“新建客户预约”。
- 不伪造接口成功、订单、评价、支付、核销数据。
- 不部署线上，不提交 GitHub，除非用户或 Codex 明确要求。

## 允许修改范围

优先只改这些文件：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\dashboard\DashboardView.vue
D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\dashboard\DashboardView.contract.test.ts
D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\style.css
```

如果要扩展到订单页，必须另开小任务：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\orders\OrdersView.vue
D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench\src\features\orders\OrdersView.contract.test.ts
```

## 首批任务

### UI-001：Dashboard 字体层级重整

目标：让首页首屏看起来像成熟门店工作台，而不是临时排版。

要求：

- 页面标题使用 sans 字体，建议 `text-[28px]`、`font-bold`、`leading-[1.15]`。
- 区块标题使用 sans 字体，建议 `text-[18px]` 到 `text-[20px]`。
- 卡片标题 `15px` 到 `16px`，说明文字不小于 `13px`。
- 大数字可以保留 serif 或改成 tabular sans，但不能让标题大面积 serif。
- 不再新增 `text-[10px]`、`text-[10.5px]`、`text-[11px]` 作为正文。

验收：

- 首页首屏没有主要标题使用厚重书法感 serif。
- 正文、按钮、标签在 1440 宽度下可读。
- `npm test` 和 `npm run build` 通过。

### UI-002：运营卡片增加图标和中文语义标签

目标：解决“前面没有对应 SVG 图案”和英文 scope pill 突兀的问题。

要求：

- 使用项目已有图标库；先查 `package.json`，如果已有 `lucide-vue-next` 就用它。
- 四张运营卡片建议图标：
  - 今日待拍：Camera 或 ClipboardCheck。
  - 待上传：UploadCloud 或 ImagePlus。
  - 待选片：MousePointerClick 或 Images。
  - 待交付：Send 或 CheckCircle。
- 右上角英文 `ORDER`、`ALBUM`、`PICK`、`DELIVER` 改为更弱的中文短标签或移到图标旁：
  - 订单
  - 相册
  - 选片
  - 交付
- 图标尺寸 18 到 22px，线宽统一，不要手写 SVG path。

验收：

- 四张运营卡片都有图标。
- 首屏不再直接显示突兀英文 `ORDER`、`ALBUM`、`PICK`、`DELIVER`。
- 图标与文字 baseline 对齐，不挤压布局。

### UI-003：卡片、提示条、日期控件精修

目标：提升触感和质感，不改变业务逻辑。

要求：

- 卡片圆角统一 6 到 8px，避免 `rounded-[1.75px]` 到处出现。
- 卡片阴影更轻，边框更柔和，hover 只做轻微提升。
- 日期控件改成同一高度，按钮和 date input 视觉一致。
- 今日按钮保留深色主按钮，但文字不应过小。
- 红色/绿色提示条增加左边语义线或小图标，减少大面积空白。
- 按钮 active 状态要有轻微按压反馈，不造成布局跳动。

验收：

- 首页首屏卡片不像线框稿。
- 日期按钮、今天按钮、日期输入框高度一致。
- 提示条能一眼区分警告和成功/待办。

### UI-004：顶部标题/面包屑收敛

目标：让顶部区域更像系统级工作台，而不是临时标题块。

要求：

- 面包屑字号 12 到 13px，颜色弱化。
- 当前页面标题和主内容标题不要重复抢层级。
- 搜索框、通知、处理订单按钮保持现有功能，不改路由。
- 顶部主按钮保持“处理订单”，不改成“新建预约”。

验收：

- 左上角不会显得拥挤或粗糙。
- 顶部主动作依然进入订单处理，不出现客户预约创建入口。

## 可选第二批任务

这些等 UI-001 到 UI-004 做完再处理：

```text
UI-005 订单页筛选区和表格行高精修
UI-006 客片管理页胶卷列表、上传区、照片网格精修
UI-007 在线选片页链接列表和状态标签精修
UI-008 设置页渠道/角色/日志卡片统一
UI-009 建设中页面统一为更清楚的信息卡
UI-010 空态、错误态、重试按钮统一视觉
```

## 验证命令

必须执行：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test
npm run build
```

如果只改 Dashboard，建议额外执行：

```powershell
npm test -- DashboardView
```

## 回报格式

完成后按这个格式回复：

```text
结果：Dashboard 首页 UI 精修已完成，字体层级、图标、卡片、日期控件和提示条已优化。
改动：
- src/features/dashboard/DashboardView.vue：说明改动点
- src/style.css：说明新增或调整的通用视觉 token/class
- src/features/dashboard/DashboardView.contract.test.ts：说明测试锁定点
验证：
- npm test：通过，xx tests passed
- npm run build：通过
风险：
- 仅前端视觉优化，不涉及接口/后端/部署
- 如需上线，由 Codex 或负责人另行部署
```

## 交给国产模型时直接复制这段

```text
你现在只做影约云门店工作台 Dashboard 首屏 UI 精修，不改业务逻辑、不改后端、不改接口、不部署。

工作目录：
D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench

先读：
D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\domestic-model-studio-ui-polish-dashboard.md
D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\studio-workbench-architecture-framework.md
D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\domestic-model-handoff-small-features.md

首批只做 UI-001 到 UI-004：
1. Dashboard 字体层级重整
2. 运营卡片增加图标和中文语义标签
3. 卡片、提示条、日期控件精修
4. 顶部标题/面包屑收敛

主要文件：
src/features/dashboard/DashboardView.vue
src/features/dashboard/DashboardView.contract.test.ts
src/style.css

禁止：
- 不改 API、store、router、权限、登录、token、生产域名、密钥
- 不新增客户预约入口
- 不把 19 位 ID 转 number
- 不新增依赖，除非先说明并等待确认
- 不部署线上、不提交 GitHub

验证：
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test
npm run build

回报格式：
结果 / 改动 / 验证 / 风险
```

