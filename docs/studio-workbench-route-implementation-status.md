> owner: studio-workbench-route-implementation-status
> canonical_for: 门店工作台每个前端路由的实现状态、数据来源和后续补齐点
> upstream: studio-workbench/src/app/router/featureRegistry.ts, docs/studio-workbench-api-route-map.md
> downstream: docs/domestic-model-handoff-small-features.md

# 门店工作台路由实现状态

更新时间：2026-06-14

## 状态定义

| 状态 | 含义 |
| --- | --- |
| READY | 有正式页面、契约测试，主链路可演示或可接真实接口 |
| DERIVED | 有正式页面，但只从统一账本派生，只读或轻操作 |
| PARTIAL | 页面已做，依赖权限、平台资质或后端接口继续补 |
| PLANNED | 暂无正式实现，不作为当前验收入口 |

## 首页

| 路由 | 状态 | 说明 |
| --- | --- | --- |
| `/` | READY | 经营概况，趋势图已异步加载 |
| `/dashboard/today` | READY | 今日预约，复用排期页 |
| `/dashboard/tasks` | READY | 待处理事项，复用订单页 |

## 商户和商品

| 路由 | 状态 | 说明 |
| --- | --- | --- |
| `/merchant/store` | READY | 门店承接概况、快捷筛选 |
| `/merchant/service-groups` | READY | 服务组管理，真实接口已映射 |
| `/merchant/inventory` | READY | 时段库存，支持冲突筛选 |
| `/product/service` | READY | 服务产品配置 |
| `/product/addon` | DERIVED | 从统一产品派生附加产品 |
| `/product/group` | DERIVED | 从统一产品派生团单产品 |
| `/product/print` | DERIVED | 从统一产品派生冲印产品 |
| `/product/douyin` | READY | 抖音来客商品映射只读排障 |
| `/product/meituan` | DERIVED | 美团映射只读，未授权时不伪造 |

## 订单和服务

| 路由 | 状态 | 说明 |
| --- | --- | --- |
| `/order/appointment` | READY | 统一预约订单，状态流转、改期、今日处理 |
| `/order/print` | DERIVED | 冲印订单视图，从统一订单派生 |
| `/order/enterprise` | DERIVED | 企业团单视图，从统一订单派生 |
| `/order/card` | DERIVED | 售卡订单视图，从统一订单派生 |
| `/order/coupon` | DERIVED | 售券订单视图，从统一订单派生 |
| `/order/verification` | PARTIAL | 渠道核销排障已做；真实核销动作仍在后端/系统后台 |
| `/order/campaign` | DERIVED | 活动订单，从统一订单来源归因 |
| `/order/forms` | DERIVED | 表单资料跟进，从统一订单派生 |
| `/service/photos` | READY | 客片管理、OSS 上传、底片整理 |
| `/service/selection` | READY | 在线选片链接、导出客户已选照片 |

## 协作、资源、会员、营销、统计

| 路由 | 状态 | 说明 |
| --- | --- | --- |
| `/collaboration/overview` | DERIVED | 从订单/相册/选片链接派生当前环节 |
| `/collaboration/work-orders` | DERIVED | 派生工单池，未写 `yy_work_order` |
| `/collaboration/export` | DERIVED | 派生工单 CSV 导出 |
| `/collaboration/statistics` | DERIVED | 派生环节统计 |
| `/resource/files` | DERIVED | 从相册底片派生文件资源 |
| `/resource/samples` | DERIVED | 从客户已选照片派生样片候选 |
| `/member/customers` | READY | 客户档案，读 `yy_customer` |
| `/member/accounts` | DERIVED | 会员账户视图，不建第二账本 |
| `/member/tags` | DERIVED | 客户标签视图 |
| `/member/consumption` | DERIVED | 消费记录视图 |
| `/marketing/center` | DERIVED | 营销中心，从订单来源聚合 |
| `/marketing/coupons` | DERIVED | 优惠券线索，不做真实发券 |
| `/marketing/campaigns` | DERIVED | 活动清单 |
| `/marketing/participations` | DERIVED | 活动参与记录 |
| `/report/store-daily` | DERIVED | 门店日报 |
| `/report/store-monthly` | DERIVED | 门店月报 |
| `/report/products` | DERIVED | 产品统计 |
| `/report/employees` | DERIVED | 员工统计 |
| `/report/retouch` | DERIVED | 修图统计 |
| `/report/finance` | DERIVED | 收支统计 |
| `/report/customers` | DERIVED | 客户分析 |
| `/report/reviews` | PARTIAL | 无评价表/API 时显示真实空态 |
| `/report/channels` | DERIVED | 渠道收入统计 |
| `/report/conversion` | DERIVED | 订单转化分析 |

## 工具和设置

| 路由 | 状态 | 说明 |
| --- | --- | --- |
| `/tools/booking-entry` | READY | 预约入口物料，规则在 `shareLinkOperations.ts` |
| `/tools/pickup-entry` | READY | 取片入口物料 |
| `/tools/share-links` | READY | 二维码与分享链接 |
| `/tools/notifications` | READY | 通知模板和通知日志 |
| `/settings/employees` | READY | 员工管理 |
| `/settings/roles` | PARTIAL | 展示权限矩阵；角色维护仍在 RuoYi 系统后台 |
| `/settings/logs` | PARTIAL | 操作日志可能依赖 `monitor:operlog:list` 权限 |
| `/settings/channels` | READY | 渠道配置说明和上线检查 |
| `/settings/workbench` | READY | 工作台设置、安全边界 |

## 当前最适合继续补的小任务

1. `/settings/logs` 增加 logid / requestId 搜索。
2. `/order/appointment` 订单详情抽屉补渠道同步日志摘要。
3. `/service/photos` 上传失败增加可复制错误详情。
4. `/product/douyin` 增加“待补字段清单”复制。
5. `/settings/roles` 增加缺失权限一键复制。
6. `/report/reviews` 明确“评价接口未接入”空态和下一步接口名。
