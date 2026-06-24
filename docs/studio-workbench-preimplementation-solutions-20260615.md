> owner: studio-workbench-preimplementation-solutions-20260615
> canonical_for: 门店工作台缺失能力的预实现方案、数据模型、API 入口和前端接入路径
> upstream: docs/studio-workbench-complete-delivery-plan-20260615.md, docs/studio-workbench-api-route-map.md
> downstream: docs/studio-workbench-acceptance-checklist-20260615.md

# 门店工作台预实现方案

日期：2026-06-15

## 结论

以下能力不能靠前端假数据“做完”。当前工作台已经用派生页覆盖可见入口，下一步按本方案逐个接正式表/API。接入前页面保持只读派生或真实空态。

## 方案 1：正式工单和环节事件

| 项 | 方案 |
| --- | --- |
| 目标 | 把当前派生工单升级为正式拍摄/上传/选片/修图/交付流转 |
| 新表建议 | `yy_work_order`, `yy_work_order_event` |
| 关联 | `yy_work_order.order_id -> yy_order.id`, `album_id -> yy_photo_album.id`, `assignee_employee_id -> yy_employee.id` |
| 后端 API | `GET /yy/workOrder/list`, `GET /yy/workOrder/{id}`, `POST /yy/workOrder/{id}/transition`, `GET /yy/workOrder/{id}/events` |
| 前端接入 | `backendApi.listWorkOrders/getWorkOrder/listWorkOrderEvents/transitionWorkOrder()` 已预接；替换 `workExecution.ts` / `workOrders.ts` 的数据源时保留 `/collaboration/*` 路由 |
| 验收 | 同一订单只有一个当前工单；状态流转有事件；统计页能展示平均耗时和超时率 |
| 禁止 | 不在前端生成正式工单号后直接当数据库事实 |

## 方案 2：优惠券、团购券和活动

| 项 | 方案 |
| --- | --- |
| 目标 | 从订单线索升级为真实券模板、发放、领取、核销和活动参与 |
| 新表建议 | `yy_coupon_template`, `yy_coupon_instance`, `yy_marketing_campaign`, `yy_campaign_participation` |
| 关联 | 券实例可关联 `yy_order.id`、`yy_customer.id`、渠道外部券码 |
| 后端 API | `GET /yy/couponTemplate/list`, `POST /yy/couponTemplate`, `GET /yy/couponInstance/list`, `POST /yy/campaign`, `GET /yy/campaignParticipation/list` |
| 前端接入 | `/marketing/coupons`, `/marketing/campaigns`, `/marketing/participations` 从 `DerivedMarketingModuleView.vue` 迁移为正式页面 |
| 验收 | 券发放和核销有幂等流水；抖音/美团券不伪造本地核销成功 |
| 禁止 | 未接平台回调时展示“已核销”或“已发券成功” |

## 方案 3：会员权益、余额、积分和卡项

| 项 | 方案 |
| --- | --- |
| 目标 | 从客户档案派生升级为正式会员账户 |
| 新表建议 | `yy_member_account`, `yy_member_ledger`, `yy_member_card`, `yy_member_card_usage` |
| 关联 | `customer_id -> yy_customer.id`, `order_id -> yy_order.id` |
| 后端 API | `GET /yy/memberAccount/list`, `GET /yy/memberLedger/list`, `POST /yy/memberCard/use` |
| 前端接入 | `/member/accounts`, `/member/consumption` 替换派生数据；`/member/tags` 继续用客户标签或新增标签表 |
| 验收 | 每次余额/积分变化都有 ledger；退款、赠送、核销可追踪 |
| 禁止 | 从订单金额直接推导“余额”或“积分可用余额” |

## 方案 4：客户评价和渠道评分

| 项 | 方案 |
| --- | --- |
| 目标 | `/report/reviews` 展示真实客户评价 |
| 新表建议 | `yy_customer_review`, `yy_channel_review_sync_log` |
| 后端 API | `GET /yy/customerReview/list`, `POST /yy/customerReview/sync` |
| 前端接入 | `/report/reviews` 在无数据时继续真实空态，有数据后展示来源、评分、内容、订单关联 |
| 验收 | 每条评价有来源、外部 ID、订单或客户关联；同步失败可在日志查到 |
| 禁止 | 用随机评分或演示文案填充评价 |

## 方案 5：报表快照和财务统计

| 项 | 方案 |
| --- | --- |
| 目标 | 大数据量下报表从实时派生升级为可审计快照 |
| 新表建议 | `yy_report_daily_store`, `yy_report_monthly_store`, `yy_finance_ledger` |
| 数据来源 | `yy_order`, `yy_payment_record`, `yy_refund_record`, 渠道同步日志 |
| 后端 API | `GET /yy/report/storeDaily`, `GET /yy/report/storeMonthly`, `GET /yy/report/finance` |
| 前端接入 | `/report/store-daily`, `/report/store-monthly`, `/report/finance`, `/report/channels` |
| 验收 | 报表日期可重算；收入、退款、渠道金额可追踪到账本 |
| 禁止 | 把今日运营订单列表当月报完整数据 |

## 方案 6：照片访问日志和选片行为

| 项 | 方案 |
| --- | --- |
| 目标 | 在线选片访问次数、客户行为和下载行为真实可审计 |
| 新表建议 | `yy_photo_album_visit_log`, `yy_photo_selection_event` |
| 后端 API | `GET /yy/photoAlbumVisit/list`, `GET /yy/photoSelectionEvent/list` |
| 前端接入 | `/service/selection` 访问次数和进度从日志读取；客户端提交选片时写事件 |
| 验收 | 客户访问、选择、取消选择、提交、下载都有时间和身份边界 |
| 禁止 | 访问次数用前端本地计数当生产事实 |

## 方案 7：微信支付和抖音小程序 `tt.pay`

| 项 | 方案 |
| --- | --- |
| 目标 | 小程序内自有支付接入统一订单和支付流水 |
| 现有边界 | `DOUYIN_LIFE` 支付发生在抖音来客；自有小程序支付属于 `DOUYIN_MINI_APP` 或微信小程序 |
| 表 | 使用 `yy_payment_record`，必要时新增 `yy_refund_record` |
| 后端 API | `POST /client/pay/wechat/prepay`, `POST /client/pay/wechat/notify`, `POST /client/pay/douyin/prepay`, `POST /client/pay/douyin/notify`, `GET /client/pay/status` |
| 前端接入 | `mobile-uniapp` 支付页，不放到 `studio-workbench` |
| 工作台接入 | 订单页只展示支付状态和流水摘要，不直接拉起客户支付 |
| 验收 | 回调验签、幂等、支付后扣库存、失败可重试 |
| 禁止 | 店员工作台手动把未支付订单改成“已支付” |

## 方案 8：美团渠道

| 项 | 方案 |
| --- | --- |
| 目标 | 美团商品、订单、核销和库存逐步接入 |
| 表 | 复用 `yy_channel_product_mapping`, `yy_channel_order_mapping`, `yy_channel_sync_log`，必要时新增美团专项扩展表 |
| 后端 API | `GET /yy/channel/MEITUAN/sync-health`, `POST /yy/channel/MEITUAN/order/sync`, `POST /yy/channel/MEITUAN/verify` |
| 前端接入 | `/product/meituan`, `/order/verification`, `/report/channels` |
| 验收 | 外部订单幂等映射；核销 log 可追踪；库存和本地 `yy_booking_slot_inventory` 一致 |
| 禁止 | 没有授权时展示可投放、可核销 |

## 方案 9：平台验收证据自动化

| 项 | 方案 |
| --- | --- |
| 目标 | 把人工验收结果沉淀为可复查文件 |
| 工具 | `tools/new-photo-pickup-real-oss-evidence.ps1`, `tools/get-yingyue-delivery-status.ps1`, `tools/print-miniapp-acceptance-handoff.ps1` |
| 新增建议 | `tools/new-studio-workbench-acceptance-evidence.ps1`，汇总路由 200、登录、核心页面截图路径和构建版本 |
| 输出 | `docs/evidence/studio-workbench-acceptance-YYYYMMDD.md/json` |
| 验收 | 每次部署后能看到 commit、dist 时间、核心路由、测试命令、残余阻塞 |
| 禁止 | 只在聊天里说“通过”，不写 evidence |

## 接入顺序

1. 先补平台验收证据自动化，避免每轮交付靠记忆。
2. 再做照片访问日志，因为在线选片和客户交付最容易影响体验。
3. 再做正式工单事件表，支撑协作、员工绩效和耗时报表。
4. 再做优惠券/活动/会员权益，避免营销页长期派生。
5. 最后做报表快照和美团深接入，按真实业务量推进。
