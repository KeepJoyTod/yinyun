> owner: studio-workbench-route-implementation-status
> canonical_for: 门店工作台前端路由的实现状态、数据来源与后续补齐方向
> upstream: `studio-workbench/src/app/router/featureRegistry.ts`, `docs/studio-workbench-api-route-map.md`
> downstream: `docs/domestic-model-handoff-small-features.md`

# 门店工作台路由实现状态
更新时间：2026-06-24

## 状态定义

| 状态 | 含义 |
| --- | --- |
| READY | 已有正式 owner 页面，主链路可演示或可接真实接口 |
| DERIVED | 已有正式页面，但只从统一账本派生，只读或轻操作 |
| PARTIAL | 页面已做，仍依赖权限、平台资质或后端接口继续补齐 |
| PLANNED | 暂无正式实现，不作为当前验收入口 |

## 首页

| 路由 | 状态 | 说明 |
| --- | --- | --- |
| `/` | READY | 经营概况，趋势图按真实聚合数据加载 |
| `/dashboard/today` | READY | 今日预约，复用排期与订单视图 |
| `/dashboard/tasks` | READY | 待处理事项，聚合今日订单和协作待办 |

## 商户与商品

| 路由 | 状态 | 说明 |
| --- | --- | --- |
| `/merchant/overview` | READY | 商户模块总览，走 `merchant-core` owner，汇总门店范围、运营指标和渠道映射 |
| `/merchant/store` | READY | 门店承接概况、快筛与范围切换 |
| `/merchant/service-groups` | READY | 服务组 CRUD 与排班配置 |
| `/merchant/inventory` | READY | 时段库存查询、更新与冲突视图 |
| `/merchant/decoration` | READY | 装修草稿、发布、平台与菜单配置 |
| `/merchant/micro-pages` | READY | 微页面 CRUD、发布与公共访问 |
| `/merchant/micro-forms` | READY | 微表单 CRUD、发布、提交跟进 |
| `/product/service` | READY | 服务产品主 owner |
| `/product/addon` | DERIVED | 从统一商品账本派生附加产品视图 |
| `/product/group` | DERIVED | 从统一商品账本派生团单产品视图 |
| `/product/print` | DERIVED | 从统一商品账本派生冲印产品视图 |
| `/product/album` | READY | 商品目录 owner，支持相册/商品卡配置 |
| `/product/douyin` | READY | 抖音商品映射只读排障与授权状态 |
| `/product/meituan` | DERIVED | 美团映射只读边界视图 |
| `/product/card-catalog` | READY | 商品卡目录、销售概览与分类维护 |

## 订单与服务

| 路由 | 状态 | 说明 |
| --- | --- | --- |
| `/order/appointment` | READY | 统一预约订单，支持状态流转、改期和今日处理 |
| `/order/staff-booking` | READY | 店员录单 owner |
| `/order/print` | DERIVED | 从统一订单账本派生冲印订单 |
| `/order/enterprise` | DERIVED | 从统一订单账本派生企业团单 |
| `/order/card` | DERIVED | 从统一订单账本派生售卡订单 |
| `/order/coupon` | DERIVED | 从统一订单账本派生售券订单 |
| `/order/verification` | PARTIAL | 渠道核销排障页，真实核销动作仍在后端/系统后台 |
| `/order/campaign` | DERIVED | 从统一订单账本按活动来源聚合 |
| `/order/forms` | DERIVED | 从微表单提交记录派生跟进视图 |
| `/service/photos` | READY | 客片管理、OSS 上传、底片整理 |
| `/service/selection` | READY | 在线选片链接与客户已选照片导出 |

## 协作、资源、会员、营销、统计

| 路由 | 状态 | 说明 |
| --- | --- | --- |
| `/collaboration/overview` | READY | 真实工单执行队列与门店协作概览 |
| `/collaboration/work-orders` | READY | 真实 `yy_work_order` 主链与状态流转 |
| `/collaboration/export` | READY | 从真实工单主链导出协作 CSV |
| `/collaboration/statistics` | READY | 直接消费真实工单 runtime 做岗位统计 |
| `/resource/manage` | READY | 资源总览、归档与边界说明 |
| `/resource/tags` | READY | 资源标签字典与计数 |
| `/resource/usage` | READY | 资源容量、占用与清理计划 |
| `/member/customers` | READY | 客户档案，读取 `yy_customer` |
| `/member/accounts` | READY | 会员资产 owner，聚合会员卡、权益、优惠券、积分、成长值与余额摘要 |
| `/member/tags` | DERIVED | 客户标签派生视图，仍回到客户档案维护 |
| `/member/consumption` | READY | 会员交易 owner，聚合订单、积分、成长值与余额流水 |
| `/marketing/center` | READY | 营销中心 owner，聚合能力开关、渠道承接和活动联动 |
| `/marketing/coupons` | READY | 优惠券 owner，维护模板、发券记录和恢复策略脚手架 |
| `/marketing/campaigns` | READY | 活动列表 owner，维护上下线、绑定商品与活动订单桥接 |
| `/marketing/participations` | READY | 活动参与记录 owner，查看转化、退款和试算结果 |
| `/report/store-daily` | DERIVED | 门店日报 |
| `/report/store-monthly` | DERIVED | 门店月报 |
| `/report/products` | DERIVED | 产品统计 |
| `/report/employees` | DERIVED | 员工统计 |
| `/report/retouch` | DERIVED | 修图统计 |
| `/report/finance` | DERIVED | 收支统计 |
| `/report/customers` | DERIVED | 客户分析 |
| `/report/reviews` | PARTIAL | 评价 API 未接入时显示真实空态 |
| `/report/channels` | DERIVED | 渠道收入统计 |
| `/report/conversion` | DERIVED | 订单转化分析 |

## 工具与设置

| 路由 | 状态 | 说明 |
| --- | --- | --- |
| `/tools/booking-entry` | READY | 预约入口物料页 |
| `/tools/pickup-entry` | READY | 取片入口物料页 |
| `/tools/share-links` | READY | 二维码与分享链接 |
| `/tools/notifications` | READY | 通知模板与通知日志 |
| `/settings/employees` | READY | 员工管理 |
| `/settings/roles` | PARTIAL | 权限矩阵、角色模板、缺失权限复制；角色维护仍在 RuoYi 后台 |
| `/settings/logs` | PARTIAL | 操作日志、渠道日志与排障入口 |
| `/settings/channels` | READY | 渠道配置说明与上线检查 |
| `/settings/workbench` | READY | 工作台运行模式与安全边界 |

## 下一批小任务

1. `/settings/logs` 增加 `logid` / `requestId` 检索
2. `/order/appointment` 订单详情补渠道同步日志摘要
3. `/service/photos` 上传失败增加可复制错误详情
4. `/product/douyin` 增加待补字段清单复制
5. `/settings/roles` 增加模板对比与更细粒度筛选
6. `/report/reviews` 明确“评价接口未接入”空态和下一步接口名
