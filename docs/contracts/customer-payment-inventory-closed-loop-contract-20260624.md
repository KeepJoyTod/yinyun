# Customer Payment Inventory Closed-Loop Contract 2026-06-24

## Scope

This document is the Part 0 contract source for `docs/superpowers/plans/2026-06-23-customer-payment-inventory-closed-loop.md`.

In scope:

- customer self-service payment entry
- WeChat payment prepay placeholder and future prepay response
- WeChat payment notify normalization and paid-entry contract
- workbench store-confirm payment action
- shared idempotent paid-entry service
- inventory confirmation linkage after paid entry

Out of scope for this phase:

- member balance, stored-value, coupons, points
- refund ledger and refund callback
- real Douyin platform write-back
- HK2 deployment and production merchant credential rollout

## Verified Baseline

- Customer payment entry already exists at `POST /api/customer/orders/{orderId}/pay`.
- Current backend placeholder only verifies order ownership and returns `paymentReady=false`.
- Mobile client already blocks `uni.requestPayment` when `paymentReady=false` or `timeStamp` is empty.
- `yy_order`, `yy_payment_record`, and `yy_booking_slot_inventory` already exist in PostgreSQL schema.
- Inventory confirmation already reuses `confirmPaidOrderSlot(YyOrder order)`.
- WeChat payment capability is still reserved, not fully integrated.

## Feature Summary

| Item | Contract |
| --- | --- |
| Feature | Customer payment and inventory closed loop |
| User roles | Customer, store staff, system, WeChat notify callback |
| Customer entry | Product detail page and customer order page |
| Staff entry | Workbench order detail for unpaid local orders |
| Success result | `yy_payment_record` written, `yy_order.pay_status=PAID`, inventory confirmation attempted |
| Failure result | Order remains unpaid, no fake paid state, UI gets explicit message |

## Three-Layer Ownership

| Layer | Owner | Responsibility |
| --- | --- | --- |
| Presentation | `mobile-uniapp/src/pages/product/detail/index.vue`, `mobile-uniapp/src/pages/customer/orders/index.vue`, `studio-workbench/src/features/orders/**` | Trigger pay or confirm-receipt actions, render loading/success/failure states |
| Frontend control logic | `mobile-uniapp/src/api/customer.ts`, `mobile-uniapp/src/types/clientPhoto.ts`, `studio-workbench/src/shared/api/**` | Normalize DTOs, keep placeholder behavior, refresh order state |
| Backend control logic | `YyClientPublicApiController`, `YyClientPublicApiServiceImpl`, future `YyPaymentService`, future notify/confirm controller | Auth, order ownership, idempotent paid-entry, status update, inventory linkage |
| Persistent data | `yy_order`, `yy_payment_record`, `yy_booking_slot_inventory` | Order fact, payment fact, slot capacity fact |

## API-001 Customer Pay Entry

```text
POST /api/customer/orders/{orderId}/pay
Authorization: Bearer <customer-token>
```

### Request Rules

| Field | Source | Rule |
| --- | --- | --- |
| `orderId` | path | Must be backend `yy_order.id` |
| `Authorization` | header | Must resolve to a bound-phone customer identity |

### Response Contract

Compatible with current `CustomerPaymentParams` and extended with closed-loop fields:

```json
{
  "timeStamp": "",
  "nonceStr": "",
  "package": "",
  "signType": "",
  "paySign": "",
  "paymentReady": false,
  "message": "在线支付暂未接入，订单已创建，请到店或联系门店确认。",
  "transactionNo": "",
  "orderId": "9001",
  "orderNo": "YY-CUST-9001",
  "amount": 39900,
  "provider": "WECHAT_MINI_APP",
  "outTradeNo": "YYPAY-9001-123456789",
  "payStatus": "UNPAID",
  "paymentRecordId": "990001"
}
```

### Response Rules

| Case | Contract |
| --- | --- |
| WeChat pay unavailable | `paymentReady=false`; keep empty payment signature fields; may still return `orderId/orderNo/amount/payStatus`; do not mark order paid |
| WeChat pay available | `paymentReady=true`; return signed payment params plus `outTradeNo` and `paymentRecordId`; create or reuse one `PENDING` payment record |
| Order already paid | Return `payStatus=PAID`; do not create a second effective payment record |
| Illegal order | Reject cancelled, refunded, non-local-channel, or unauthorized orders |

### Read/Write Tables

| Table | Operation | Fields |
| --- | --- | --- |
| `yy_order` | READ | `id`, `store_id`, `channel_type`, `status`, `pay_status`, `total_amount_cent`, `paid_amount_cent`, `paid_time`, slot fields |
| `yy_payment_record` | READ/INSERT/UPDATE | `id`, `order_id`, `channel_type`, `provider`, `out_trade_no`, `amount_cent`, `pay_status`, `platform_order_id`, `transaction_id`, `raw_payload` |

## Service Contract: `IYyPaymentService`

`IYyPaymentService` already exists in code as the current paid-entry service contract owner at `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyPaymentService.java:12`.
Part 6 only records this owner alignment and does not add new business promises beyond the contract below.

### `createPrepayForCustomerOrder(...)`

Purpose:

- validate the order is eligible for customer payment
- create or reuse one `PENDING` record in `yy_payment_record`
- return placeholder or real prepay response

Minimal command shape:

```java
record CustomerPrepayCommand(
    Long orderId,
    String tenantId,
    Long storeId,
    String customerPhone,
    String provider,
    String outTradeNo
) {}
```

Minimal result shape:

```java
record CustomerPrepayResult(
    boolean paymentReady,
    String message,
    String orderId,
    String orderNo,
    Long amountCent,
    String provider,
    String outTradeNo,
    Long paymentRecordId,
    String payStatus,
    Map<String, String> paymentParams
) {}
```

### `markPaid(...)`

Purpose:

- be the only write entry for successful payment fact
- be reused by WeChat notify and store-confirm receipt
- update order payment fields and trigger inventory confirmation exactly once

Minimal command shape:

```java
record PaymentMarkPaidCommand(
    Long orderId,
    String tenantId,
    Long storeId,
    String channelType,
    String provider,
    String outTradeNo,
    String platformOrderId,
    String transactionId,
    Long amountCent,
    Long paidAmountCent,
    Date paidTime,
    Date notifyTime,
    String rawPayload,
    String operatorType,
    Long operatorId
) {}
```

### `markPaid(...)` Rules

| Rule | Contract |
| --- | --- |
| Single owner | All paid-entry writes must go through `markPaid(...)` |
| Idempotency key | `(tenant_id, channel_type, out_trade_no)` |
| Duplicate callback | If payment record is already `PAID`, return processed result and do not add inventory again |
| Amount mismatch | Record failure reason, reject order paid update |
| Inventory link | After order payment fields are updated, call `confirmPaidOrderSlot(...)` in the same transaction boundary design |
| Conflict handling | Keep paid fact, mark inventory conflict, require workbench follow-up |

## API-002 WeChat Notify Entry

```text
POST /api/customer/pay/wechat/notify
```

Current controller owner in code:

- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyWechatPaymentNotifyController.java:23`

### Important Note

The raw WeChat callback schema and signature response format are not verified from official docs in this Part 0 task. Part 3 must re-check official WeChat payment documentation before coding the real adapter. Part 0 only locks the normalized business contract below.

### Normalized Notify Payload

```json
{
  "outTradeNo": "YYPAY-9001-123456789",
  "platformOrderId": "wx-prepay-id",
  "transactionId": "wx-transaction-id",
  "tradeState": "SUCCESS",
  "amountCent": 39900,
  "paidAmountCent": 39900,
  "paidTime": "2026-06-24T10:30:00+08:00",
  "payerOpenIdMasked": "masked",
  "rawPayload": "masked-or-sanitized"
}
```

### Rules

| Rule | Contract |
| --- | --- |
| Signature | Must verify before `markPaid(...)` |
| Strategy owner | Signature placeholder policy and normalized payload parser must stay in dedicated backend control-layer owners, not inside controller |
| Ledger lookup | Must find `yy_payment_record` by `out_trade_no` |
| Amount check | Callback amount must equal order and payment record amount |
| Failure handling | Invalid signature, missing record, missing order, or amount mismatch must not mark order paid |
| Success handling | Normalize payload then call `markPaid(...)` |
| Secrets | Do not persist raw private secrets, full openid, or merchant credentials |

## API-003 Workbench Store-Confirm Receipt

```text
POST /yy/order/{id}/payment/confirm
```

Current controller owner in code:

- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyOrderPaymentController.java:34`

### Permission

- `yy:order:edit`

### Request Contract

```json
{
  "amountCent": 39900,
  "remark": "门店现金/转账已确认"
}
```

### Rules

| Rule | Contract |
| --- | --- |
| Allowed orders | Only `UNPAID` and not cancelled/refunded local orders |
| Policy owner | Eligibility rule must stay in dedicated backend control-layer policy owner |
| Provider | Backend fixed to `STORE_CONFIRM`; frontend does not choose arbitrary provider |
| Ledger bootstrap | Entry service must create or reuse one pending `yy_payment_record` before calling `markPaid(...)` |
| Paid entry | Controller/service must call `markPaid(...)` with `provider=STORE_CONFIRM` |
| Audit | Store operator identity and remark must remain auditable |

## Error Contract

Current backend transport is still message-first `ServiceException`. Part 0 locks semantic error keys first; backend may still return message-only `R.fail(...)` in Part 1-3.

| Semantic key | Message expectation | Retry |
| --- | --- | --- |
| `CUSTOMER_PHONE_REQUIRED` | 请先绑定手机号后再支付 | No |
| `ORDER_NOT_FOUND_OR_FORBIDDEN` | 未找到可支付订单或无权访问 | No |
| `ORDER_STATUS_INVALID` | 当前订单状态不可支付/不可确认收款 | No |
| `ORDER_CHANNEL_INVALID` | 当前订单不支持客户支付 | No |
| `PAYMENT_CONFIG_MISSING` | 在线支付暂未接入，请到店或联系门店确认 | Yes |
| `PAYMENT_AMOUNT_MISMATCH` | 支付金额校验失败 | No |
| `PAYMENT_ALREADY_PROCESSED` | 支付已处理 | Safe no-op |
| `PAYMENT_SIGNATURE_INVALID` | 支付回调验签失败 | No |
| `INVENTORY_CONFLICT` | 支付成功，但目标时段已满，需人工处理 | No automatic retry |

## Ledger Contract

| Table | Role | Notes |
| --- | --- | --- |
| `yy_order` | Single order and appointment ledger | Only update payment summary fields in this phase |
| `yy_payment_record` | Single payment/receipt ledger for this phase | Used by WeChat prepay, WeChat notify, and store-confirm receipt |
| `yy_booking_slot_inventory` | Single slot capacity ledger | Confirm only when slot identity is complete |

### Order Field Update Rule

- update only `pay_status`, `paid_amount_cent`, `paid_time`
- do not force business `status` from `PENDING` to `CONFIRMED`
- keep refund flow out of this phase

## Idempotency and Concurrency

| Scenario | Contract |
| --- | --- |
| Customer taps pay repeatedly | Reuse existing `PENDING` record when still valid |
| WeChat callback replay | Return already-processed result; do not double-confirm inventory |
| Staff confirm after notify already paid | Treat as idempotent reject or already-paid response |
| Full slot when payment succeeds | Preserve paid fact; inventory becomes conflict/manual handling |

## Verification Commands

```powershell
rg -n "payCustomerOrder|paymentReady|confirmPaidOrderSlot|yy_payment_record" backend/ruoyi-modules/ruoyi-yy mobile-uniapp docs
mvn -pl backend/ruoyi-modules/ruoyi-yy -am "-Dtest=YyClientPublicApiServiceImplTest,YyPaymentServiceImplTest" "-DskipTests=false" "-Dsurefire.failIfNoSpecifiedTests=false" test
npm --prefix mobile-uniapp run test
npm --prefix mobile-uniapp run typecheck
npm --prefix studio-workbench run test -- src/features/orders src/shared/api
npm --prefix studio-workbench run build
```
