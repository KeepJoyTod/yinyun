# Studio Workbench Micro Form Booking Prefill Evidence - 2026-06-19

## Scope

Public micro-form submissions can now prefill staff manual booking fields through the staff workbench route:

```text
/order/forms -> 转预约 -> /order/staff-booking?fromSubmissionId=<id>
```

The workflow remains a staff-confirmed manual booking. It does not create an order, occupy inventory, or call Douyin Life until the staff member saves the booking form.

## Files

```text
studio-workbench/src/features/orders/microFormSubmissionBooking.ts
studio-workbench/src/features/orders/microFormSubmissionBooking.test.ts
studio-workbench/src/features/orders/StaffBookingEntryView.vue
studio-workbench/src/features/orders/StaffBookingEntryView.contract.test.ts
```

## Data and API Boundary

- Reads submission detail with `GET /yy/microFormSubmission/{id}`.
- Creates a booking only through existing `POST /yy/order/staff-booking`.
- Links the submission after successful booking through `PUT /yy/microFormSubmission/follow`.
- Extracts customer name, phone, store id, service group id, expected date, expected time range, and service text from submitted answers.
- Supports hidden binding fields such as `__storeId`, `__serviceGroupId`, `binding:storeId:*`, and `binding:serviceGroupId:*`.
- Keeps `scheduleMode: 'UNDECIDED'` by default, so the prefilled expected time is only a reference until staff explicitly chooses a scheduled slot.
- No Douyin OpenAPI/SPI write operation was added.
- No database migration was added.

## Verification

```powershell
npm --prefix studio-workbench run test -- src/features/orders/microFormSubmissionBooking.test.ts src/features/orders/StaffBookingEntryView.contract.test.ts src/features/orders/StaffBookingModal.contract.test.ts src/features/orders/OrderFormSubmissionsView.contract.test.ts src/shared/api/backend.contract.test.ts
# 5 files / 36 tests passed

npm --prefix studio-workbench run build
# passed; only existing echarts-vendor chunk-size warning
```

## Result

- Staff no longer needs to copy customer fields from micro-form answers manually when converting a submission to a booking.
- Store and service-group bindings can be carried by hidden form fields without exposing customer details in the URL.
- Customer-selected service and expected time are preserved in booking remarks for staff review.
- Inventory and daily schedule remain protected from unconfirmed public-form data.
