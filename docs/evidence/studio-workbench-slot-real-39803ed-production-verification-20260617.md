# Studio Workbench Slot Real 39803ed Production Verification - 2026-06-17

## Result

Hong Kong 2 is running the `39803ed` slot-real release, and the production staff API can read the real order and slot ledgers used by the dashboard, today schedule, and appointment order views.

- Git commit: `39803ed feat: reconcile jianyue slots for studio schedule`
- Server: Hong Kong 2, `103.24.216.8`
- Release path: `/opt/yingyue/releases/slot-real-39803ed-20260617-111831`
- Frontend marker: `prod-39803ed-slot-real-20260617`
- Backend JAR SHA256: `75b9729b74d0c8b34b493fd851f6625aeac45f9480c4087015afdd08c8c7e280`
- Verification time: `2026-06-17 11:29:54 +08:00`

## Public Route Probe

All probed routes returned `200` and contained the deployed frontend marker.

| Route | HTTP | Marker |
| --- | ---: | --- |
| `/` | 200 | `prod-39803ed-slot-real-20260617` |
| `/login` | 200 | `prod-39803ed-slot-real-20260617` |
| `/dashboard/today` | 200 | `prod-39803ed-slot-real-20260617` |
| `/schedule` | 200 | `prod-39803ed-slot-real-20260617` |
| `/order/appointment` | 200 | `prod-39803ed-slot-real-20260617` |

## Authenticated API Probe

The probe used the local staff demo account file and did not print the password or token.

| API | Result |
| --- | --- |
| `POST /auth/login` | OK, token length `423` |
| `GET /yy/studio/bootstrap` | OK, user `store-admin`, stores `5`, menus `1` |
| `GET /yy/bookingSlotInventory/list?bizDate=2026-06-17` | OK, total slots `63` |
| `GET /yy/order/list` for arrival date `2026-06-17` | OK, total orders `3` |
| `GET /yy/order/list?source=JIANYUE` for arrival date `2026-06-17` | OK, total source rows `1` |
| `GET /yy/order/list?source=DOUYIN_LIFE` for order date `2026-05-19..2026-06-17` | OK, total source rows `1099` |

## Today Slot Ledger

The production slot inventory uses `paid_count` as the confirmed/occupied count. Frontend mapping converts `paidCount -> confirmedCount`.

| Date | Store | Time | Capacity | Paid | Conflict | Status |
| --- | --- | --- | ---: | ---: | ---: | --- |
| `2026-06-17` | `900000000000000100` | `10:30-11:00` | 1 | 1 | 0 | `ACTIVE` |
| `2026-06-17` | `900000000000000100` | `11:00-11:30` | 1 | 1 | 1 | `ACTIVE` |

## Today Order Ledger

Today has three real appointment work orders from the local ledger:

| Order | Channel | Store | Time | Status | Pay | Inventory |
| --- | --- | --- | --- | --- | --- | --- |
| `JY-12152033` | `JIANYUE` | `900000000000000100` | `10:30-11:00` | `PENDING` | `PAID` | `CONFIRMED` |
| `JY-12152059` | `JIANYUE` | `900000000000000100` | `11:00-11:30` | `SERVING` | `PAID` | `CONFIRMED` |
| `JY-12152139` | `JIANYUE` | `900000000000000100` | `11:00-11:30` | `SERVING` | `PAID` | `CONFLICT` |

No customer names, phone numbers, tokens, or raw external payloads are recorded in this evidence.

## Chain Status

- Historical Jianyue orders with real slot fields have been reconciled into `yy_booking_slot_inventory`.
- Today schedule can be rendered from `yy_booking_slot_inventory + yy_order` with morning/afternoon/evening capacity labels and conflict signals.
- Douyin Life historical rows without real slot fields are not fabricated into appointment slots.
- New Douyin Life callbacks or sync payloads with complete POI/SKU/date/time fields should resolve through the existing mapping and inventory confirmation path.

## Browser Smoke

System Chrome was used through Playwright because the cached Playwright-managed Chromium revision did not match the installed package revision.

| Page | Screenshot | Signals |
| --- | --- | --- |
| Dashboard | `output/playwright/studio-dashboard-prod-39803ed-20260617.png` | Shows today count `3`, pending confirmation `1`, and inventory conflict text |
| Today Schedule | `output/playwright/studio-today-prod-39803ed-20260617.png` | Shows morning/afternoon/evening slot layout, capacity text, and conflict/inventory wording |
| Appointment Orders | `output/playwright/studio-orders-prod-39803ed-20260617.png` | Shows today queue `3`, amount `79`, real order numbers, and local `yy_order` sync scope |

Browser smoke summary JSON:

```text
output/playwright/studio-prod-39803ed-ui-smoke-20260617.json
```

## Follow-Up

- Keep validating new Douyin Life appointment payloads as they arrive, especially POI/SKU/date/time extraction.
- Continue UI polish against the Jianyue reference for row density, horizontal wheel interaction, and click-through detail panels.
- Keep the incorrect route-probe evidence `studio-workbench-acceptance-20260617-112604.*` out of the final delivery summary because it was generated with a bad route argument.
