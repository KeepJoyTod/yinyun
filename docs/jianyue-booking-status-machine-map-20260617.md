# JianYue Booking Status Machine Map 2026-06-17

## Conclusion

The workbench should expose JianYue-like status groups while preserving local status values. UI labels are product language; backend statuses are ledger language.

## Workbench Status Groups

| Workbench group | Includes | Excludes | Primary UI use |
| --- | --- | --- | --- |
| 全部有效订单 | `PENDING`, `CONFIRMED`, `SERVING`, `SELECTING`, `COMPLETED`, paid valid platform rows | `CANCELLED`, `REFUNDED`, deleted rows | Default order list and dashboard valid count |
| 待服务 | `PENDING`, optionally paid but not received | cancelled/refunded/serving/completed | Front desk pending queue |
| 服务中 | `CONFIRMED`, `SERVING` | pending/completed/cancelled/refunded | Active customer service |
| 已完成 | `SELECTING`, `COMPLETED` | active and invalid rows | Finished service/order handoff |
| 待支付 | valid rows with `pay_status=UNPAID` | paid/refunded/cancelled rows | Payment follow-up |
| 已取消 | `CANCELLED` | refunded rows if refund status is explicit | Invalid/cancel queue |
| 已退单 | `REFUNDED` or `refund_status` indicates refunded | cancelled without refund | Refund queue |

## Local Status Vocabulary

| Status | Meaning | Allowed sources |
| --- | --- | --- |
| `PENDING` | Order exists, not yet in service | staff create, JianYue import, platform sync |
| `CONFIRMED` | Order accepted/confirmed | receive action, platform confirm, import |
| `SERVING` | Customer is being served | `保存并接待`, receive/start action |
| `SELECTING` | Photo/service finished, customer selection or delivery phase | service completion action |
| `COMPLETED` | Order fully completed | completion action, platform verify |
| `CANCELLED` | Order cancelled | staff cancel, platform cancel |
| `REFUNDED` | Order refunded | platform refund, staff refund sync |

## Payment Status Vocabulary

| Pay status | Meaning | Notes |
| --- | --- | --- |
| `UNPAID` | Payment not confirmed | Staff order can start unpaid if business allows. |
| `PAID` | Payment confirmed | Douyin Life must come from platform order/payment fact. |
| `PARTIAL_REFUNDED` | Partial refund | Keep order service status independent. |
| `REFUNDED` | Full refund | UI should also include in 已退单 group. |
| `PAY_FAILED` | Payment failed | Not a valid service order unless recovered. |

## Transition Rules

| Action | From | To | Required checks |
| --- | --- | --- | --- |
| 新增服务订单 - 保存 | empty | `PENDING` | valid store/customer; slot rules depend on schedule mode |
| 新增服务订单 - 保存并接待 | empty | `SERVING` or `CONFIRMED` then `SERVING` | same as create plus allowed immediate receive |
| 接待/开始服务 | `PENDING`, `CONFIRMED` | `SERVING` | order is valid, not refunded/cancelled |
| 完成拍摄/完成服务 | `SERVING`, `CONFIRMED` | `SELECTING` or `COMPLETED` | store permission, required service data if enforced |
| 订单完成 | `SELECTING`, `SERVING` | `COMPLETED` | no blocking unpaid/refund state unless allowed by policy |
| 取消订单 | `PENDING`, `CONFIRMED` | `CANCELLED` | release slot reservation when scheduled |
| 退款同步 | any valid platform order | `REFUNDED` or update `refund_status` | platform refund evidence or staff-authorized refund |
| 改约 | valid scheduled order | status unchanged | release old slot and reserve new slot atomically |

## Channel Mapping

| Channel | Incoming status | Local mapping rule |
| --- | --- | --- |
| `DOUYIN_LIFE` | paid/unused | `PENDING` + `pay_status=PAID` when no service action happened |
| `DOUYIN_LIFE` | appointment accepted | `CONFIRMED` |
| `DOUYIN_LIFE` | verified/used | `COMPLETED` or `SELECTING` depending on service handoff |
| `DOUYIN_LIFE` | cancelled/refunded | `CANCELLED` or `REFUNDED` with refund fields |
| `JIANYUE` | waiting/pending | `PENDING` |
| `JIANYUE` | in service | `SERVING` |
| `JIANYUE` | finished | `COMPLETED` or `SELECTING` |
| `MEITUAN` | paid/unused | `PENDING` + `pay_status=PAID` |
| `LOCAL` | staff-selected | preserve staff status after validation |

## UI Rules

- Order list tabs are group filters, not raw status enums.
- Dashboard counts should use group rules above, not plain raw status counts.
- The schedule board cares about slot status plus valid scheduled orders.
- Cancelled/refunded orders can remain searchable but must not count as available-day workload.
- A `PAID` order without slot fields must remain visible in the order list and anomaly view, not the slot grid.

## Backend Contract Points

| API | Status responsibility |
| --- | --- |
| `GET /yy/order/list` | Accept raw status filters and return ledger rows. Frontend can group when backend lacks group filters. |
| `GET /yy/order/status-stats` | Prefer backend group counts for dashboard. |
| `POST /yy/order/staff-booking` | Create `PENDING` or `SERVING` depending on `submitMode`. |
| `POST /yy/order/{id}/transition` | Enforce transition legality and store audit remark. |
| `POST /yy/order/{id}/reschedule` | Preserve service status, update inventory status. |
| `POST /yy/channel/DOUYIN_LIFE/orders/sync` | Map platform status into local status and payment fields. |

## Test Cases

| Case | Expected result |
| --- | --- |
| Pending paid Douyin order | Appears in 全部有效订单 and 待服务, not 待支付. |
| Staff order saved unpaid | Appears in 全部有效订单, 待服务, and 待支付. |
| Save and receive | Appears in 服务中 after create. |
| Cancel scheduled order | Leaves 全部有效订单 and releases slot count. |
| Full refund | Appears in 已退单 and does not count as active workload. |
