# JianYue Booking Permission Map 2026-06-17

## Conclusion

Store staff permissions should be store-scoped first, action-scoped second. The workbench must not show or mutate orders outside the employee's store scope unless the user is an admin/operator role.

## Identity Source

| Source | Current/target field | Use |
| --- | --- | --- |
| Login/bootstrap | `identity.storeId` | Primary/default store for legacy compatibility. |
| Login/bootstrap | `identity.storeScopes[]` | All stores the employee may operate. |
| Employee-store binding | `yy_employee_store(employee_id, store_id, role_type, primary)` | Multi-store permission ledger. |
| Backend auth | RuoYi permissions/roles | Coarse function permission and API access. |

## Roles

| Role | Store scope | Allowed booking actions |
| --- | --- | --- |
| Front desk staff | Own bound stores | View schedule, create service order, receive/start service, edit remarks, reschedule within allowed stores |
| Photographer/service staff | Own bound stores | View today's schedule, update serving/completed states if granted |
| Store manager | Managed stores | All staff actions, export store orders, handle conflicts, adjust slot capacity if granted |
| Operator/admin | All configured stores | Channel sync, mapping, deploy diagnostics, cross-store reports |
| Read-only reviewer | Assigned stores or all stores | View only; no create/transition/sync |

## Permission Matrix

| Feature | Front desk | Service staff | Store manager | Operator/admin | Read-only |
| --- | --- | --- | --- | --- | --- |
| 首页经营概况 | own stores | own stores | managed stores | all stores | scoped |
| 今日预约 | own stores | own stores | managed stores | all stores | scoped |
| 预约订单列表 | own stores | own stores | managed stores | all stores | scoped |
| 新增服务订单 | yes | optional | yes | yes | no |
| 保存并接待 | yes | optional | yes | yes | no |
| 改约 | yes | no by default | yes | yes | no |
| 取消/退款标记 | no by default | no | yes | yes | no |
| 同步抖音订单 | no | no | optional | yes | no |
| POI/SKU 映射 | no | no | no | yes | no |
| 导出订单 | no by default | no | yes for managed stores | yes | optional |
| 调整时段容量 | no | no | yes if granted | yes | no |

## Store-Scoped Filtering Rules

- Every list endpoint used by the workbench should receive `storeId` or derive allowed stores from identity.
- Frontend store selector must only show stores in `identity.storeScopes[]` unless the user is all-store admin.
- If URL query contains a store outside scope, backend must reject or frontend must normalize to the first allowed store.
- Cross-store dashboard metrics require admin/operator role.
- Staff order create must validate `storeId` against the user's allowed stores on the backend, not only the frontend.

## API Permission Expectations

| API | Required permission |
| --- | --- |
| `GET /yy/studio/bootstrap` | authenticated employee |
| `GET /yy/order/list` | order read for requested store scope |
| `POST /yy/order/staff-booking` | order create for target store |
| `POST /yy/order/{id}/transition` | order operate for order store |
| `POST /yy/order/{id}/reschedule` | order operate for order store and target slot store |
| `GET /yy/bookingSlotInventory/list` | schedule read for requested store |
| `POST /yy/channel/DOUYIN_LIFE/orders/sync` | channel sync admin/operator |
| `POST /yy/channel/DOUYIN_LIFE/orders/backfill` | channel sync admin/operator |
| `GET/POST /yy/channelProductMapping` | channel mapping admin/operator |

## UI Rules

- Hide unavailable destructive/admin actions; do not show disabled buttons without reason.
- For forbidden deep links, show a permission message and route back to allowed dashboard.
- Store selector must make multi-store scope visible but compact.
- Do not leak cross-store customer phone/name through autocomplete or order search.

## Audit Rules

| Operation | Audit fields |
| --- | --- |
| Staff order create | operator id, store id, submit mode, source `LOCAL` or `STAFF` |
| Status transition | operator id, old status, new status, remark |
| Reschedule | operator id, old slot, new slot, conflict result |
| Channel sync/backfill | operator id, channel type, time window, result counts, logid/request id |
| Mapping change | operator id, old mapping, new mapping, reason |
