# 交易安全脚手架合同

> owner: transaction-safety-scaffold
> date: 2026-06-25

## 1. 目标

为 `X-003 / C-016 / X-009 / B-069` 补齐可继续扩展的模块化脚手架，不新增第二套订单账本，不接真实三方收款或出款。

## 2. 三层职责

- 表现层：`/member/transaction-safety` owner 页负责筛选、创建脚手架记录、展示状态。
- 控制逻辑层：`backendTransactionSafetyApi.ts`、`useMemberTransactionSafety.ts`、`YyTransactionSafetyController`、`YyTransactionSafetyServiceImpl`。
- 持久层：`yy_entitlement_reservation`、`yy_composite_payment_order`、`yy_stored_value_consume_order`、`yy_member_withdraw_order`，以及已存在的 `yy_member_account`、`yy_risk_approval`、`yy_order`、`yy_customer`。

## 3. 接口契约

- `GET /yy/transaction-safety/entitlement-reservations`
- `POST /yy/transaction-safety/entitlement-reservations`
- `GET /yy/transaction-safety/composite-payments`
- `POST /yy/transaction-safety/composite-payments`
- `GET /yy/transaction-safety/stored-value-consumes`
- `POST /yy/transaction-safety/stored-value-consumes`
- `GET /yy/transaction-safety/withdraw-orders`
- `POST /yy/transaction-safety/withdraw-orders`

## 4. 状态机

- 权益预占：`RESERVED -> RELEASED|EXPIRED|FULFILLED`，本轮只落 `RESERVED` 脚手架。
- 组合支付：`DRAFT -> CONFIRMED|FAILED`，本轮只落 `DRAFT` + `settleStatus=PENDING`。
- 储值消费：`FROZEN -> CONFIRMED|REVERSED|CANCELLED`，本轮只落余额校验 + `FROZEN`。
- 会员提现：`PENDING_APPROVAL -> APPROVED|REJECTED -> PAID`，本轮落申请建单和审批联动，不做真实出款。

## 5. 边界

- 不调用微信、抖音、美团真实支付或退款接口。
- 不直接改 `yy_member_account.balance_amount`，只记录快照和待执行状态。
- 不新增第二套 `yy_order` 或支付主账本。
