# 营销域脚手架契约

| 项 | 内容 |
| --- | --- |
| 功能名 | 营销模块全量完善第一批脚手架 |
| 用户角色 | 店长 / 店员 / 客户 / 平台租户管理员 |
| 用户入口 | `/marketing/center`、`/marketing/coupons`、`/marketing/campaigns`、`/marketing/participations`、`/order/campaign` |
| 成功结果 | 工作台可查看营销能力、券模板脚手架、活动脚手架、参与记录和优惠试算结果；后端提供真实营销域接口骨架与 SQL 迁移 |
| 失败结果 | 未开通能力时统一展示能力开关提示；试算失败时显示固定错误文案并保留订单原价 |

## 三层职责

| 层级 | Owner | 职责 |
| --- | --- | --- |
| 表现层 | `studio-workbench/src/features/marketing/*.vue` | 渲染营销总览、券模板、活动清单、参与记录、能力开关和试算面板 |
| 控制逻辑层 - 前端 | `useCouponTemplates.ts`、`useCampaignEditor.ts`、`useCampaignParticipation.ts`、`usePromotionTrial.ts`、`marketing*Api.ts` | 加载营销脚手架数据、归一化能力开关、发起试算、降级到本地 scaffold |
| 控制逻辑层 - 后端 | `YyMarketingCapabilityController`、`YyCouponTemplateController`、`YyCampaignController`、`YyCampaignParticipationController`、`YyPromotionTrialController` 及对应 service/policy | 返回营销脚手架 DTO、执行固定优先级试算、统一未授权返回 |
| 持久数据层 | `yy_coupon_template`、`yy_coupon_instance`、`yy_coupon_grant_record`、`yy_coupon_writeoff_record`、`yy_campaign`、`yy_campaign_product`、`yy_campaign_participation`、`yy_promotion_capability`、`yy_promotion_trial_snapshot` | 为真实营销域预留正式账本，不复制 `yy_order` 主账本 |

## 请求对象

```ts
export type PromotionTrialPayload = {
  orderId?: string
  storeId?: string
  customerId?: string
  productId?: string
  productName?: string
  orderSource?: string
  customerLevel?: string
  originalAmountCent: number
}
```

字段规则：

| 字段 | 类型 | 必填 | 来源 | 规则 |
| --- | --- | --- | --- | --- |
| `orderId` | `string` | 否 | 工作台订单 | 兼容 `yy_order.id`；营销脚手架阶段允许为空 |
| `storeId` | `string` | 否 | 当前门店 | 应为真实 `yy_store.id` |
| `customerId` | `string` | 否 | 会员档案 | 仅用于能力开关和权益候选 |
| `productId` | `string` | 否 | 商品/订单 | 优先传真实产品 ID |
| `productName` | `string` | 否 | 商品快照 | 无真实产品 ID 时仅作文案展示 |
| `orderSource` | `string` | 否 | 渠道/活动入口 | 用于活动候选判断 |
| `customerLevel` | `string` | 否 | 会员等级 | 脚手架阶段只影响示意性权益候选 |
| `originalAmountCent` | `number` | 是 | 订单原价 | 单位分，必须大于 0 |

## 响应对象

```ts
export type PromotionTrialResultDto = {
  status: 'eligible' | 'blocked'
  appliedRuleCode?: string
  originalAmountCent: number
  finalAmountCent: number
  discountAmountCent: number
  conflictSource?: string
  restorePolicy: string
  blockedReasons: string[]
  candidates: Array<{
    candidateId: string
    candidateType: 'REDEEM_VOUCHER' | 'CAMPAIGN' | 'COUPON' | 'COUPON_CODE' | 'CARD_RIGHT'
    title: string
    applicable: boolean
    priority: number
    discountAmountCent: number
    finalAmountCent: number
    conflictSource?: string
    reason?: string
  }>
}
```

## 固定优先级规则

| 优先级 | 规则 | 结果 |
| --- | --- | --- |
| 1 | `兑换券` | 命中后直接替代指定商品价格，不叠加其他优惠 |
| 2 | `砍价 / 秒杀 / 拼团 / 限时折扣 / 分享有礼 / 抽奖权益` | 活动互斥，取同订单行最优活动价 |
| 3 | `优惠券 / 优惠码` | 二者互斥，取最优一个 |
| 4 | `次卡 / 共享次卡 / 卡项权益` | 与券类互斥；命中权益后不再参与券类抵扣 |

## 状态机

| 当前状态 | 动作 | 下一状态 | 允许角色 | 失败条件 |
| --- | --- | --- | --- | --- |
| `SCaffold` | 查看营销能力 | `SCaffold` | 店员/店长 | 未授权、接口异常 |
| `ACTIVE` | 试算 | `ACTIVE` | 店员/店长 | 原价为空、无可用候选 |
| `APPLIED` | 退单恢复 | `RESTORE_PENDING` | 店长 | 候选未核销、配置不允许恢复、已过期 |

## 错误契约

| 错误码/场景 | UI 文案 | 是否可重试 | 日志要求 |
| --- | --- | --- | --- |
| `MARKETING_CAPABILITY_DISABLED` | 当前品牌未开通该营销能力 | 否 | 记录 capabilityCode、brand/store |
| `PROMOTION_TRIAL_NO_MATCH` | 当前订单没有可用优惠，请继续按原价处理 | 是 | 记录 orderId、productId、候选结果 |
| `PROMOTION_TRIAL_INVALID_AMOUNT` | 原价异常，无法完成优惠试算 | 否 | 记录 orderId、originalAmountCent |

## 数据表读写

| 表 | 操作 | 字段 | 规则 |
| --- | --- | --- | --- |
| `yy_order` | READ | `id`, `store_id`, `source`, `product_id`, `total_amount_cent`, `paid_amount_cent`, `status` | 唯一订单账本，只读不复制 |
| `yy_coupon_template` | READ/WRITE | 模板基础字段、范围字段、恢复策略 | 正式优惠券模板账本 |
| `yy_coupon_instance` | READ/WRITE | 实例状态、过期时间、持有人 | 真实券实例账本 |
| `yy_coupon_grant_record` | READ/WRITE | 发券来源、目标客户、批次 | 商家发券与自动发券记录 |
| `yy_coupon_writeoff_record` | READ/WRITE | 核销订单、核销金额、恢复状态 | 核销与退单恢复事实 |
| `yy_campaign` | READ/WRITE | 活动类型、状态、时间窗 | 活动主档 |
| `yy_campaign_product` | READ/WRITE | 活动与商品绑定 | 不复制商品主档 |
| `yy_campaign_participation` | READ/WRITE | 客户参与、转化状态、关联订单 | 活动参与账本 |
| `yy_promotion_capability` | READ/WRITE | capabilityCode、启停、到期时间 | 品牌/租户能力开关 |
| `yy_promotion_trial_snapshot` | WRITE | 请求快照、命中规则、候选集合 | 试算证据和回放 |

## 幂等和并发

- 同一 `orderId + originalAmountCent + productId` 重复试算，后端应返回等价候选结果。
- 退单恢复只恢复“已核销且允许恢复”的记录，不自动恢复已过期或失效实例。
- 活动订单仍以 `yy_order` 为主，不允许营销域写第二套订单账本。

## 验收命令

```powershell
npm --prefix studio-workbench run check:file-size
npm --prefix studio-workbench run test -- src/features/marketing/*.test.ts src/features/marketing/*.contract.test.ts src/features/orders/*promotion*.test.ts
npm --prefix studio-workbench run build
mvn -pl backend/ruoyi-modules/ruoyi-yy -Dtest=*Marketing*,*Coupon*,*Campaign*,*Promotion* test
```
