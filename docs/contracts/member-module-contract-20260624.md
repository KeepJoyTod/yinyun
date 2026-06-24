# 会员模块契约 2026-06-24

## 1. 功能摘要

| 项 | 内容 |
| --- | --- |
| 功能名 | 会员模块第一批读链路 + 第二批手工充值闭环 |
| 用户角色 | 店员 / 店长 / 客服 |
| 工作台入口 | `member/accounts`、`member/consumption` |
| 成功结果 | 可查看会员资产，可在资产页发起门店手工充值并写入余额流水 |
| 失败结果 | 页面提示错误；建单失败不落账；确认失败保留待确认充值单 |

## 2. 三层职责

| 层级 | Owner | 职责 |
| --- | --- | --- |
| 表现层 | `studio-workbench/src/features/member/modules/**` | 会员资产页、消费记录页、充值弹窗、成功失败提示 |
| 控制逻辑层-前端 | `backendMemberApi.ts`、`memberStore.ts`、`memberRechargeStore.ts`、`useMemberAssetOverview.ts`、`useMemberTransactions.ts`、`useMemberRecharge.ts` | 请求编排、状态归一、刷新摘要和流水 |
| 控制逻辑层-后端 | `YyMemberAssetController`、`YyMemberRechargeController`、`IYyMemberAssetService`、`IYyMemberRechargeService` | 客户校验、充值建单、确认到账、余额汇总和流水写入 |
| 持久数据层 | `yy_member_account`、`yy_member_balance_ledger`、`yy_member_recharge_order` 等 | 会员资产总账、余额流水、充值单事实 |

## 3. 只读接口

### `GET /yy/member/customer/{customerId}/overview`

```ts
type MemberOverviewResponse = {
  customerId: string
  customerName: string
  mobile: string
  memberLevel: string
  tagSummary: string
  totalOrderCount: number
  totalSpendAmount: number
  activeCardCount: number
  activeCouponCount: number
  activeBenefitCount: number
  pointsBalance: number
  growthValue: number
  balanceAmount: number
  pendingRechargeCount: number
  lastTradeTime: string
  remark: string
}
```

### `GET /yy/member/customer/{customerId}/cards`

```ts
type MemberCardResponse = {
  id: string
  customerId: string
  cardName: string
  cardType: string
  status: string
  totalQuota: number
  usedQuota: number
  remainingQuota: number
  balanceAmount: number
  effectiveFrom: string
  effectiveTo: string
  sourceOrderId?: string
  remark: string
}
```

### 其余只读接口
- `GET /yy/member/customer/{customerId}/benefits`
- `GET /yy/member/customer/{customerId}/coupons`
- `GET /yy/member/customer/{customerId}/points-ledger`
- `GET /yy/member/customer/{customerId}/growth-ledger`
- `GET /yy/member/customer/{customerId}/balance-ledger`

## 4. 手工充值写接口

### `POST /yy/member/customer/{customerId}/recharge-orders`

```ts
type MemberRechargeCreatePayload = {
  storeId?: string | null
  rechargeAmount: number
  giftAmount?: number
  channelType?: string
  externalTradeNo?: string
  remark?: string
}
```

### `POST /yy/member/recharge-orders/{rechargeOrderId}/confirm`

```ts
type MemberRechargeOrderResponse = {
  id: string
  customerId: string
  rechargeOrderNo: string
  rechargeAmount: number
  giftAmount: number
  creditedAmount: number
  balanceAfter: number
  status: 'PENDING' | 'CONFIRMED'
  channelType: string
  paidTime: string
  externalTradeNo: string
  remark: string
}
```

## 5. 状态和账本

| 领域 | 状态 / 口径 |
| --- | --- |
| 充值单 | `PENDING` -> `CONFIRMED` |
| 余额流水 `changeType` | `RECHARGE` |
| 余额流水 `sourceType` | `RECHARGE_ORDER` |
| 到账金额 | `rechargeAmount + giftAmount` |

## 6. 数据表

| 表 | 说明 |
| --- | --- |
| `yy_customer` | 客户主档 |
| `yy_member_account` | 会员汇总账本，维护余额和待确认充值计数 |
| `yy_member_balance_ledger` | 余额流水 |
| `yy_member_recharge_order` | 充值单主表 |
| `yy_member_card_instance` | 会员卡资产 |
| `yy_member_benefit_ledger` | 权益资产 |
| `yy_member_points_ledger` | 积分流水 |
| `yy_member_growth_ledger` | 成长值流水 |

## 7. 本批边界

- 只支持工作台门店手工充值，不接第三方在线支付。
- 不补提现、退款回滚、审批流。
- 不改订单主账本 `yy_order` 的支付状态机。
