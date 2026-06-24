# JianYue Booking Domestic Model Task Pack 2026-06-17

## Conclusion

Domestic models can fill well-scoped implementation tasks after the maps and contracts are fixed. They should not decide ledger boundaries, status semantics, or platform-data truth rules.

## Work Split

| Task type | Suitable for domestic model | Keep for senior review |
| --- | --- | --- |
| UI label/layout alignment | yes | final visual/interaction review |
| Contract tests from written maps | yes | test quality and missing cases |
| Type/interface extension | yes | API compatibility review |
| Simple backend field plumbing | yes | validation and transaction review |
| Status group helper implementation | yes | semantic review |
| Douyin OpenAPI/SPI behavior | only with exact instructions | final owner review |
| Database migration | only generated draft | manual review before apply |
| Production deploy | no | senior/operator only |

## Required Prompt For Worker

```text
你只在当前仓库内按文档实现，不改变核心架构。
必须遵守：
1. yy_order 是唯一订单/预约账本。
2. yy_booking_slot_inventory 是唯一排期容量账本。
3. 历史 DOUYIN_LIFE 订单没有真实时段时，不能伪造到今日预约时段格。
4. 时段格点击只做筛选/查看，新增订单必须走明确的“新增订单/新增服务订单”入口。
5. 新增服务订单表单需要兼容：客户电话、姓名、性别、邮箱、客户关联、门店、服务组、产品、档期、通知、备注、返回、保存、保存并接待。
6. 每个改动必须有测试或可执行验证命令。
7. 不写入密钥，不打印密码/token/AppSecret，不提交本地凭证。

优先阅读：
- docs/jianyue-booking-data-ledger-map-20260617.md
- docs/jianyue-booking-status-machine-map-20260617.md
- docs/jianyue-booking-interaction-flow-map-20260617.md
- docs/jianyue-booking-api-contract-20260617.md
- docs/superpowers/plans/2026-06-17-jianyue-booking-workbench.md
```

## Task Boundaries

### Worker Task A: Schedule UI Contract

Allowed files:

- `studio-workbench/src/shared/components/schedule/JianyueSlotGrid.vue`
- `studio-workbench/src/features/schedule/ScheduleView.vue`
- `studio-workbench/src/features/schedule/scheduleOperations.ts`
- related `*.test.ts`

Expected result:

- `上午 / 下午 / 晚上` sections.
- Slot cards show `订单：x`, `工位：x/y`, `满`.
- Empty slot click does not create an order.
- Explicit new-order button opens staff modal.

### Worker Task B: Staff Order Form

Allowed files:

- `studio-workbench/src/features/orders/StaffBookingModal.vue`
- `studio-workbench/src/shared/api/backendTypes.ts`
- `studio-workbench/src/shared/api/backend.ts`
- `studio-workbench/src/shared/stores/appStore.ts`
- related tests

Expected result:

- Full JianYue-compatible fields.
- `submitMode=SAVE` and `submitMode=SAVE_AND_RECEIVE`.
- `scheduleMode=SCHEDULED` and `scheduleMode=UNDECIDED`.
- Existing callers still work.

### Worker Task C: Backend Staff Create Extension

Allowed files:

- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/bo/YyStaffBookingCreateBo.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyOrderServiceImpl.java`
- related tests

Expected result:

- New optional fields accepted.
- Scheduled orders reserve inventory.
- Undecided orders skip inventory.
- Save-and-receive transitions to service state by the status machine rules.

### Worker Task D: Order List Alignment

Allowed files:

- `studio-workbench/src/features/orders/OrdersView.vue`
- `studio-workbench/src/features/orders/orderOperations.ts`
- related tests

Expected result:

- JianYue-like filters/status groups.
- Default view does not dump all historical Douyin orders.
- Sync order action remains wired to backend.

## Review Checklist For Codex

| Check | Required |
| --- | --- |
| Git diff scope | Only allowed files changed for the assigned task. |
| Tests | Focused tests pass; full build after merge batch. |
| Ledger boundary | No new appointment/payment table. |
| Slot truth | No fabricated Douyin historical slot fields. |
| Secrets | No credentials in diff. |
| UX | No horizontal wheel trap; explicit create entry exists. |

## Delivery Format From Worker

The worker must report:

- changed files;
- commands run and results;
- screenshots/evidence if UI changed;
- known limitations;
- exact commit hash if committed.
