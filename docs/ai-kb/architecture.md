# 影约云架构与边界

## 三层架构与模块归属

### Metadata
- classification: internal
- status: verified
- owner_id: @dengzhekun
- evidence: AGENTS.md; docs/architecture/three-layer-standard.md; docs/architecture/naming-standard.md
- verification: 读取当前目标文件及相邻 API、store、service、Mapper，并确认职责归属
- expires_when: 三层架构标准、目录结构或模块 owner 变化时

影约云按三层边界组织非平凡功能：

1. 表现层：前端页面、按钮、抽屉、动画、空态、加载态和失败态。
2. 控制逻辑层：composable、store、API module、controller、service、adapter、状态机、权限与校验。
3. 持久数据层：数据库表、Mapper、SQL、对象存储和第三方真实 payload 证据。

新模块必须明确归属其中一层。结构改造先确定契约，再拆纯函数、页面、API facade 和 store facade；迁移期保持 `backendApi`、`appStore` 等历史 facade 的兼容外观。

## 预约、订单与排期账本

### Metadata
- classification: internal
- status: verified
- owner_id: @dengzhekun
- evidence: AGENTS.md 数据边界; docs/yiyue/code_map.md; docs/yiyue/api_map.md; docs/yiyue/liucheng_map.md
- verification: 当前任务读取对应表、Mapper、service、接口和地图，不仅依赖本条目
- expires_when: 订单、库存或排期数据模型发生迁移时

- `yy_order` 是订单和预约的唯一账本。
- `yy_booking_slot_inventory` 是真实时段与容量账本。
- 没有真实 `slot_date/slot_start_time/slot_end_time` 的历史 `DOUYIN_LIFE` 订单不能写入每日排期。
- 只有店员手动预约、简约真实时段或带真实时段的受信第三方 payload 可以进入排期库存。

涉及预约、排期、订单或今日预约时，优先读取 `docs/yiyue/` 下对应 code、API、流程、回调和开放平台地图，再复核当前实现。

## 渠道与真实平台边界

### Metadata
- classification: internal
- status: verified
- owner_id: @dengzhekun
- evidence: AGENTS.md 数据边界与网络验收边界
- verification: 核对当前渠道枚举、adapter、回调入口和目标环境证据
- expires_when: 渠道模型、平台接入方式或验收环境变化时

- `DOUYIN_LIFE` 与 `DOUYIN_MINI_APP` 是不同渠道，不能混用接口、支付回调和订单语义。
- 本机未具备平台白名单时，OpenAPI 失败不能直接判定为代码错误。
- SPI、Webhook、生产订单同步、库存平台写入和 logid 证据以受控验收环境为准。
- 不记录或提交 AppSecret、token、完整手机号、openid 和原始私密 payload。

## Git 与知识发布边界

### Metadata
- classification: internal
- status: verified
- owner_id: @dengzhekun
- evidence: AGENTS.md; CONTRIBUTING.md; 团队知识库试点决策
- verification: git status --short --branch; git remote get-url origin; 复核目标 PR base
- expires_when: 默认分支、集成分支或知识发布流程变化时

业务协作文件当前把 `yingyue-closed-loop-optimization-20260603` 作为常规集成分支；团队知识库试点单独选择 `main` 作为知识 PR base。两种口径不能互相替代，创建 PR 前必须按任务类型确认 base。

正式团队知识只来自 Git commit 中审核后的 `docs/ai-kb/`。未提交工作区文件、AI 对话和单次输出不属于正式知识来源。
