> owner: domestic-model-handoff-small-features
> canonical_for: 国产模型/小模型接手门店工作台小功能时的任务边界、推荐任务和验收格式
> upstream: docs/studio-workbench-architecture-framework.md, docs/studio-workbench-api-route-map.md, docs/studio-workbench-route-implementation-status.md
> downstream: docs/domestic-model-task-template.md, docs/domestic-model-studio-ui-polish-dashboard.md, studio-workbench/src/features, studio-workbench/src/shared

# 国产模型小功能交接清单

更新时间：2026-06-15

## 2026-06-15 更新

本文件保留为历史小任务池。新一轮国产模型派发请优先使用：

```text
docs/domestic-model-implementation-pack-20260615.md
docs/domestic-model-tasks/README.md
```

注意：下方 `SF-001`、`SF-002`、`SF-003`、`SF-005`、`SF-009` 已在 2026-06-15 前后由 Codex 基本完成或重构，后续不要按旧描述重复实现。需要 UI 精修、日志增强、访问日志预留或 facade 拆分时，以新版任务单为准。

## 目标

把 `studio-workbench` 后续小功能拆成可独立交给国产模型或低上下文模型完成的任务。每个任务必须小、清楚、可验证，不依赖聊天记录。

工作目录：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
```

先读：

```text
docs/studio-workbench-architecture-framework.md
docs/studio-workbench-api-route-map.md
docs/studio-workbench-route-implementation-status.md
```

## 固定禁止事项

- 不改生产域名、token、密钥、AppSecret、AccessKey。
- 不把 OSS 改成公共读，不暴露长期 OSS 直链。
- 不新建第二套订单、客户、会员、营销、工单或报表账本。
- 不在员工工作台创建客户预约；预约来自微信、抖音、H5 或系统后台。
- 不把 19 位雪花 ID 转成 `number`，所有业务 ID 保持 `string`。
- 不让 API 模式失败后静默 fallback 到 demo 数据。
- 不复制参考站源码、品牌素材或客户数据。
- 不删除旧路由兼容，除非另有明确迁移计划。

## 固定开发规则

- 先定位路由和页面，再找 helper/store/API。
- 业务规则优先写到 `*Operations.ts` 或派生模块，不塞回 Vue 大文件。
- 新增字段先改类型，再改 adapter/store，最后改页面。
- 页面必须有加载、空态、失败、重试或明确建设中状态。
- 按钮必须有处理中、防重复提交和失败提示。
- 文案要让店员知道下一步怎么做，避免只写“失败”。
- 新增可见功能至少补一个单测或契约测试。
- 改完执行：

```text
npm test
npm run build
```

## 推荐小任务池

| 编号 | 小任务 | 首要文件 | 验收重点 |
| --- | --- | --- | --- |
| UI-001 | Dashboard 字体层级重整 | `src/features/dashboard/DashboardView.vue`、`src/style.css` | 首页标题、卡片标题、说明文字和数字层级稳定，不再大面积使用厚重 serif |
| UI-002 | Dashboard 运营卡片补图标和中文标签 | `src/features/dashboard/DashboardView.vue` | 四张运营卡片有统一图标，`ORDER/ALBUM/PICK/DELIVER` 不再突兀展示 |
| UI-003 | Dashboard 卡片/提示条/日期控件精修 | `src/features/dashboard/DashboardView.vue`、`src/style.css` | 圆角、阴影、按钮高度、提示条语义更统一 |
| UI-004 | 顶部标题和面包屑收敛 | `src/shared/components/layout/Header.vue`、`DashboardView.vue` | 顶部层级清楚，仍保留“处理订单”主动作 |
| SF-001 | 订单详情抽屉补渠道同步摘要 | `src/features/orders/OrdersView.vue`、`src/shared/stores/appStore.ts` | 能看到最近同步状态、失败原因、logid/requestId |
| SF-002 | 系统日志增加 logid/requestId 搜索 | `src/features/settings/LogsView.vue` | 输入 logid 可筛到渠道日志或操作日志 |
| SF-003 | 客片上传失败增加可复制错误详情 | `src/features/albums/PhotoMgmtView.vue`、`photoMgmtOperations.ts` | 文件名、接口、错误原因可复制 |
| SF-004 | 抖音产品待补字段清单 | `src/features/products/DouyinProductsView.vue` | 缺商品 ID、SKU、POI、入口时有逐项提示 |
| SF-005 | 角色权限缺失一键复制 | `src/features/settings/RolesView.vue` | 可复制缺失权限码和后台补权限提示 |
| SF-006 | 评价报表真实空态 | `src/features/reports/DerivedReportModuleView.vue`、`derivedReportModules.ts` | 明确评价接口未接入，不伪造评分 |
| SF-007 | 分享入口复制状态优化 | `src/features/tools/ShareLinksView.vue`、`shareLinkOperations.ts` | 复制中、复制成功、复制失败状态明确 |
| SF-008 | 小程序合法域名检查复制按钮 | `src/features/settings/ChannelsView.vue` | request/upload/download 域名可单独复制 |
| SF-009 | 订单库存冲突提示增强 | `src/features/orders/orderOperations.ts` | 冲突原因、同门店同时间订单数展示清楚 |
| SF-010 | 报表空数据原因说明 | `src/features/reports/DerivedReportModuleView.vue` | 区分没数据、没权限、接口未接 |
| SF-011 | 门店入口二维码参数校验 | `src/features/tools/shareLinkOperations.ts` | `storeId`、`entry`、`channel` 缺失时提示 |
| SF-012 | 客户档案最近订单跳转优化 | `src/features/member/CustomersView.vue` | 从客户详情能带筛选跳到统一订单页 |

UI 精修任务的详细边界和可复制提示词见：

```text
docs/domestic-model-studio-ui-polish-dashboard.md
```

## 每个小任务的交付格式

交付时必须写清：

```text
结果：完成了什么，入口在哪。
改动：改了哪些文件，每个文件改什么。
验证：执行了哪些命令，结果如何。
风险：还有什么没接后端、没权限或需人工配置。
```

示例：

```text
结果：系统日志页已支持按 logid/requestId 搜索。
改动：更新 LogsView.vue 的筛选区和过滤逻辑，补 LogsView.contract.test.ts。
验证：npm test 通过，npm run build 通过。
风险：如果账号没有 monitor:operlog:list，只能搜索渠道同步日志。
```

## 什么时候必须升级为大任务

出现以下情况，不要作为小任务硬做：

- 需要新增数据库表或 Flyway/Liquibase 迁移。
- 需要新增正式后端接口。
- 需要接真实支付、真实核销、真实退款。
- 需要改 RuoYi 权限模型或租户模型。
- 需要改 OSS 存储策略。
- 需要跨 `studio-workbench`、`admin-ui`、`mobile-uniapp` 三端同时改。

升级后先补计划和地图，再实施。
