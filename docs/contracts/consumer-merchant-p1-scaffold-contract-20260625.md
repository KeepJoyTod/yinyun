# P1 消费者体验与商户运营闭环脚手架契约

生成时间：2026-06-25

## 目标

本契约只定义 P1 脚手架边界：消费者端预约增强、卡券权益、会员资产、核销码、下载通知、评价入口，以及商户端订单属性、服务模式、个人中心、水印、导出、保存并接待、打印、发券宝、角色和成长规则的聚合 owner。

本包不新增数据库表，不执行真实权益核销、支付、退款、通知 SDK、评价账本或财务对账写链路。

## 客户端接口

| 方法 | 路径 | 请求 | 响应 | 状态 |
|---|---|---|---|---|
| GET | `/api/customer/experience-p1/booking-options` | `productId?`, `storeId?` | 服务组候选、自定义资料项、权益候选、资产摘要、提示文案 | `scaffold` |
| GET | `/api/customer/experience-p1/asset-summary` | 无 | 会员卡、权益、优惠券、积分、成长值、余额摘要 | `scaffold` |
| GET | `/api/customer/experience-p1/order-verification/{orderId}` | `orderId` | 核销码展示策略、渠道、不可展示原因 | `scaffold` |
| POST | `/api/customer/experience-p1/review-drafts` | `orderId?`, `rating`, `tags`, `remark` | 评价脚手架提交结果和证据 | `scaffold` |

### 客户端预约下单增强契约

| 方法 | 路径 | 新增可选请求字段 | 落地边界 | 状态 |
|---|---|---|---|---|
| POST | `/api/customer/orders` | `serviceGroupId?`, `customFields?`, `entitlementCandidateId?`, `entitlementKind?`, `entitlementUnavailableReason?` | `serviceGroupId` 写入既有 `yy_order.service_group_id`；`customFields` 写入既有 `yy_order.order_attribute_json`；可用权益候选只创建 `yy_entitlement_reservation` scaffold 预占草稿，不做真实核销/扣减 | `building` |

风险处理边界：`booking-options` 仅返回当前门店真实启用服务组；下单接口再次校验 `serviceGroupId` 必须存在、启用且属于当前门店。开发 fallback 不再透传占位服务组 ID。
权益回滚边界：本轮不会写真实权益扣减、券核销或余额消费，因此取消/退款无需回滚真实权益账本；后续接真实扣减前必须先补释放预占、反核销和退款回滚接口。

## 商户端接口

| 方法 | 路径 | 权限 | 响应 |
|---|---|---|---|
| GET | `/yy/merchant/consumer-ops-p1/overview` | `yy:store:list` | P1 缺口项、现有 owner、缺失能力、下一步、数据边界、交付标准 |

## 数据边界

- 可读既有账本：`yy_order`、`yy_customer`、`yy_booking_slot_inventory`、营销券账本、会员资产账本、通知模板/日志、装修配置、服务组、资源/相册。
- 禁止本包新增或写入真实资金/权益/评价账本。
- 所有返回状态必须明确标注 `scaffold`、`building` 或 `not_connected`，不得伪装为生产闭环完成。

## 交付标准

- 前端 owner、API facade、composable、后端 controller/service/VO 齐备。
- 页面能展示加载、失败、空态和脚手架状态。
- 地图同步到 `code_map`、`function_map`、`api_map`、`optimization_map`。
- 本包按用户要求不执行测试；后续实施任务再补 contract test、file-size、build 和后端目标测试。
