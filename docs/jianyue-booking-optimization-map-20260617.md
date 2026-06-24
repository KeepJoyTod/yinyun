# JianYue Booking Optimization Map 2026-06-17

## P0: Correct The Core Booking Experience

| Item | Problem | Target | Verification |
| --- | --- | --- | --- |
| Schedule visual hierarchy | Top cards can dominate the slot board | Compact summary, slot board as primary surface | Browser screenshot of `/dashboard/today` |
| Slot click policy | Empty slot creation conflicts with selected policy | Slot click scopes to orders/detail only | Contract test in `ScheduleView.contract.test.ts` |
| Slot card style | Current card is more decorative than reference | Flatter card, clear border, gray full state, top-right `满` | Contract + screenshot |
| New order entry | Staff creation entry must be obvious | Dedicated `新增订单` / `新增服务订单` button | Browser smoke |

## P1: Complete Staff Service Order

| Item | Problem | Target | Verification |
| --- | --- | --- | --- |
| Missing fields | Current modal lacks gender/email/customer link/product/notify | JianYue-compatible form sections | Frontend contract test |
| Schedule undecided | Current BO requires slot fields | Support `scheduleMode=UNDECIDED` without inventory reservation | Backend unit test |
| Save-and-receive | Current submit only saves | Support save mode through status semantics | Backend unit test |
| Product selection | Current modal uses service group as product text | Allow real `productId` when available | Frontend payload test |

## P2: Order List Density

| Item | Problem | Target | Verification |
| --- | --- | --- | --- |
| Filter layout | Current page is more custom dashboard than JianYue list | JianYue-like filter rows and quick ranges | Contract test |
| Status tabs | Rules exist but visual alignment can improve | Exact labels and dense count display | Contract test |
| Table content | Rows need clearer customer/product/status/store/time density | Columns match reference | Browser screenshot |
| Actions | Action labels differ | `导出`, `预约看板`, `美团验券`, `新增订单`, `同步订单` as applicable | Contract test |

## Data Optimizations

- Keep `yy_order` and `yy_booking_slot_inventory` as source of truth.
- Extend staff booking payload compatibly instead of adding a new appointment table.
- Preserve historical Douyin Life orders without slots as order-list data only.
- Ensure query deep links from dashboard/schedule/orders remain stable.

## Documentation Optimizations

- Keep maps in both repository docs and `C:\Users\Administrator\Desktop\yiyue`.
- Keep evidence files free of credentials and full personal data.
- Update this map after implementation, verification, and deployment.
