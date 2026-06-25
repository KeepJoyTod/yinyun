> owner: studio-workbench-api-contract-20260615
> canonical_for: 门店工作台和影约云后端 API 的现有接口、待实现接口、数据账本边界和国产模型填代码边界
> upstream: docs/studio-workbench-api-route-map.md, docs/studio-workbench-preimplementation-solutions-20260615.md, docs\yiyue\api_map.md, docs\yiyue\callback_map.md
> downstream: docs/api/studio-workbench-openapi-skeleton-20260615.yaml, docs/domestic-model-tasks/DM-API-*.md

# 门店工作台 API 契约

日期：2026-06-15

## 结论

接口层由 Codex 负责收口，国产模型只按任务单填小范围实现。当前策略是：先把 API 契约、OpenAPI 骨架、验收边界写死，再让国产模型补 DTO、Controller、Service、Mapper、前端 adapter 和测试。

## 全局规则

- `yy_order` 是唯一订单/预约主账本。
- `yy_photo_album`、`yy_photo_asset` 是客片主账本。
- `yy_payment_record` 只用于微信/H5/抖音小程序自建支付流水；`DOUYIN_LIFE` 支付来自抖音来客侧同步。
- `DOUYIN_LIFE` 和 `DOUYIN_MINI_APP` 必须分开。
- 所有平台 logid 写入 `yy_channel_sync_log.request_id` 或等价字段，并在工作台可查。
- 私有 OSS 不改 public-read；客户图片访问走后端鉴权签名或 stream。
- 未接真实平台能力时，接口返回真实空态或明确失败，不返回假成功。
- 生产部署、密钥、真实支付/退款/核销/发券、数据库生产迁移不交给国产模型独立操作。

## 状态标识

| 状态 | 含义 |
| --- | --- |
| `IMPLEMENTED` | 代码已存在，可按权限调用 |
| `SKELETON` | 契约明确，可让国产模型补实现，Codex review 后合并 |
| `SKELETON_READY` | 后端或前端骨架已生成并有基础测试，但生产迁移、权限菜单或真实接线尚未完成 |
| `EXTERNAL_BLOCKED` | 代码可写，但验收依赖平台能力、真实订单或人工配置 |
| `DOC_ONLY` | 当前只能文档化，不应写生产逻辑 |

## 现有核心接口

| 域 | 接口 | 状态 | 账本/来源 | 说明 |
| --- | --- | --- | --- | --- |
| 订单 | `GET /yy/order/list` | `IMPLEMENTED` | `yy_order` | 统一订单列表 |
| 订单 | `POST /yy/order/export` | `IMPLEMENTED` | `yy_order` | 全渠道本地账本导出 |
| 订单 | `POST /yy/order/{id}/transition` | `IMPLEMENTED` | `yy_order` | 工作台状态流转 |
| 订单 | `POST /yy/order/{id}/reschedule` | `IMPLEMENTED` | `yy_order`, `yy_booking_slot_inventory` | 改期和库存处理 |
| 订单 | `POST /yy/order/{id}/photo-album-placeholder` | `IMPLEMENTED` | `yy_order`, `yy_photo_album` | 幂等生成/修复取片相册 |
| 客片 | `GET /yy/photoAlbum/list` | `IMPLEMENTED` | `yy_photo_album` | 相册列表 |
| 客片 | `GET /yy/photoAsset/list` | `IMPLEMENTED` | `yy_photo_asset` | 底片列表 |
| 客片 | `POST /yy/photoAsset` | `IMPLEMENTED` | `yy_photo_asset` | 上传后创建底片记录 |
| 客片访问 | `GET /yy/photoAccessLog/list` | `IMPLEMENTED` | `yy_photo_access_log` | 已有后端列表，前端可接真实空态/列表 |
| 报表 | `GET /yy/reportSnapshot/list` | `IMPLEMENTED` | `yy_report_snapshot` | 已有快照 CRUD，前端仍需按报表页接入 |
| 渠道 | `GET /yy/channel/{channelType}/acceptance-cases` | `IMPLEMENTED` | `yy_channel_sync_log` | 验收用例和最近 logid |
| 渠道 | `GET /yy/channel/{channelType}/sync-health` | `IMPLEMENTED` | `yy_channel_sync_log`, `yy_channel_event_inbox` | 同步健康 |
| 渠道 | `GET /yy/channel/{channelType}/event-inbox/list` | `IMPLEMENTED` | `yy_channel_event_inbox` | 订单类事件收件箱 |
| 渠道 | `POST /yy/channel/{channelType}/event-inbox/{id}/retry` | `IMPLEMENTED` | `yy_channel_event_inbox` | 失败事件重试 |
| 抖音来客 | `POST /yy/channel/DOUYIN_LIFE/confirm` | `EXTERNAL_BLOCKED` | OpenAPI + `yy_channel_sync_log` | 需真实 `book_id` 和平台能力 |
| 抖音来客 | `POST /yy/channel/DOUYIN_LIFE/verify` | `EXTERNAL_BLOCKED` | OpenAPI + `yy_channel_sync_log` | 需真实券码/verify_token 和核销能力 |

## 可让国产模型填代码的接口骨架

### API-001 客片访问日志前端接入

| 项 | 内容 |
| --- | --- |
| 状态 | `SKELETON` |
| 后端 | 已有 `GET /yy/photoAccessLog/list` |
| 前端新增 | `backendApi.listPhotoAccessLogs(query)`、类型 `PhotoAccessLog`、客片页真实空态/列表 |
| 允许文件 | `studio-workbench/src/shared/api/backendTypes.ts`, `backend.ts`, `PhotoMgmtView.vue`, `photoMgmtOperations.ts`, 对应测试 |
| 禁止 | 不伪造访问量、下载量、IP、客户已看 |

### API-002 报表快照前端接入

| 项 | 内容 |
| --- | --- |
| 状态 | `SKELETON` |
| 后端 | 已有 `GET /yy/reportSnapshot/list` |
| 前端新增 | `backendApi.listReportSnapshots(query)`、报表页从派生切换到“有快照读快照，无快照真实空态” |
| 允许文件 | `backendTypes.ts`, `backend.ts`, `derivedReportModules.ts`, `DerivedReportModuleView.vue`, 对应测试 |
| 禁止 | 不把订单列表随意当月报完整快照，不伪造收入和退款 |

### API-003 正式工单接口契约

| 项 | 内容 |
| --- | --- |
| 状态 | `SKELETON_READY` |
| 后端骨架 | `GET /yy/workOrder/list`, `GET /yy/workOrder/{id}`, `POST /yy/workOrder/{id}/transition`, `GET /yy/workOrder/{id}/events` |
| 表建议 | `yy_work_order`, `yy_work_order_event` |
| 当前代码 | RuoYi CRUD、状态流转、事件查询、前端 `backendApi.listWorkOrders/getWorkOrder/listWorkOrderEvents/transitionWorkOrder()` facade 和 review-only SQL 已生成；生产迁移未执行 |
| 前端 | `/collaboration/*` 保持现有派生路由；API facade 已预接，正式替换派生数据前必须先确认权限菜单、生产迁移和线上 smoke |
| 禁止 | 不从前端生成正式工单号当数据库事实 |

### API-004 营销优惠券接口契约

| 项 | 内容 |
| --- | --- |
| 状态 | `SKELETON` |
| 后端建议 | `GET /yy/couponTemplate/list`, `POST /yy/couponTemplate`, `GET /yy/couponInstance/list`, `GET /yy/campaign/list` |
| 表建议 | `yy_coupon_template`, `yy_coupon_instance`, `yy_marketing_campaign`, `yy_campaign_participation` |
| 前端 | `/marketing/*` 先接真实空态和列表，不做发券成功假状态 |
| 禁止 | 未接平台回调时展示已核销/已发券成功 |

### API-005 会员权益接口契约

| 项 | 内容 |
| --- | --- |
| 状态 | `SKELETON` |
| 后端建议 | `GET /yy/memberAccount/list`, `GET /yy/memberLedger/list`, `GET /yy/memberCard/list`, `POST /yy/memberCard/{id}/use` |
| 表建议 | `yy_member_account`, `yy_member_ledger`, `yy_member_card`, `yy_member_card_usage` |
| 前端 | `/member/accounts`, `/member/consumption` 从派生页逐步迁移 |
| 禁止 | 从订单金额直接推导可用余额 |

### API-006 客户评价接口契约

| 项 | 内容 |
| --- | --- |
| 状态 | `SKELETON` |
| 后端建议 | `GET /yy/customerReview/list`, `POST /yy/customerReview/sync` |
| 表建议 | `yy_customer_review`, `yy_channel_review_sync_log` |
| 前端 | `/report/reviews` 有真实数据才展示评分 |
| 禁止 | 随机评分、演示文案、假渠道评价 |

### API-007 小程序自建支付接口契约

| 项 | 内容 |
| --- | --- |
| 状态 | `EXTERNAL_BLOCKED` |
| 后端建议 | `POST /client/pay/wechat/prepay`, `POST /api/wechat/pay/notify`, `POST /client/pay/douyin/prepay`, `POST /api/douyin/miniapp/pay/notify`, `GET /client/pay/status` |
| 表 | 已有 `yy_payment_record` |
| 前端 | `mobile-uniapp` 支付页；`studio-workbench` 只读支付状态 |
| 禁止 | 不复用 `/api/douyin/life/*`，不让店员手动改已支付 |

## OpenAPI 骨架

契约文件：

```text
docs/api/studio-workbench-openapi-skeleton-20260615.yaml
```

该文件只作为后续实现和文档生成的源，不自动代表接口已上线。

## 国产模型执行边界

国产模型可以做：

- 读本契约和 OpenAPI 骨架。
- 为 `SKELETON` 接口补 DTO、Controller、Service、Mapper、前端 adapter、单测。
- 保持接口失败/空态真实。
- 补 `docs/studio-workbench-api-route-map.md` 和功能代码地图。

国产模型不能做：

- 改生产 env、密钥、服务器。
- 直接执行生产迁移。
- 把 `EXTERNAL_BLOCKED` 标记成 PASS。
- 写真实支付、退款、核销、发券的伪实现。

## 验证命令

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\verify-studio-api-contracts.ps1
git diff --check
```
