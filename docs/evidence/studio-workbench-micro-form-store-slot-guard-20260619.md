# Studio Workbench Micro Form Store and Slot Guard Evidence - 2026-06-19

## Scope

This change tightens the public micro-form to staff booking workflow:

```text
/merchant/micro-forms/:id/edit -> bound store
/merchant/micro-forms -> public link / QR with storeId
/merchant/micro-pages -> booking CTA link with storeId
/public/micro-form/:id -> hidden store context in submission answers
/order/forms -> /order/staff-booking?fromSubmissionId=<id>
```

It also adds an inventory confirmation step before a customer's requested micro-form time can become a scheduled booking.

## Files

```text
studio-workbench/src/features/merchant/MerchantMicroFormEditorView.vue
studio-workbench/src/features/merchant/MerchantMicroFormsView.vue
studio-workbench/src/features/merchant/MerchantMicroPagesView.vue
studio-workbench/src/features/public/PublicMicroFormView.vue
studio-workbench/src/features/orders/StaffBookingEntryView.vue
studio-workbench/src/features/merchant/MerchantMicroFormEditorView.contract.test.ts
studio-workbench/src/features/merchant/MerchantMicroFormsView.contract.test.ts
studio-workbench/src/features/merchant/MerchantMicroPagesView.contract.test.ts
studio-workbench/src/features/public/PublicMicroFormView.contract.test.ts
studio-workbench/src/features/orders/StaffBookingEntryView.contract.test.ts
```

## Data and API Boundary

- `yy_micro_form.store_id` is now editable in the staff form builder through the existing micro-form create/update APIs.
- Public micro-form links append `storeId=<yy_store.id>` when a form is bound to a store.
- Public form submission still calls `POST /yy/client/microForm/{id}/submit`.
- Submitted answers include `__storeId`, using route `storeId` first and falling back to the public form's own `storeId`.
- Staff booking still reads detail with `GET /yy/microFormSubmission/{id}`.
- Staff booking checks existing `yy_booking_slot_inventory` through `appStore.loadBookingInventory` before using a customer's requested time as `SCHEDULED`.
- If a matching inventory slot is full, conflicted, or missing, the staff member is routed to `/merchant/inventory` with `returnTo=staffBooking`.
- No backend API was added.
- No database migration was added.
- No Douyin OpenAPI/SPI write operation was added.
- No booking inventory or order is written until staff saves `POST /yy/order/staff-booking`.

## Verification

```powershell
npm --prefix studio-workbench run test -- src/features/merchant/MerchantMicroFormEditorView.contract.test.ts src/features/merchant/MerchantMicroFormsView.contract.test.ts src/features/merchant/MerchantMicroPagesView.contract.test.ts src/features/public/PublicMicroFormView.contract.test.ts src/features/orders/microFormSubmissionBooking.test.ts src/features/orders/StaffBookingEntryView.contract.test.ts src/features/orders/StaffBookingModal.contract.test.ts
# 7 files / 35 tests passed

npm --prefix studio-workbench run build
# passed; only existing echarts-vendor chunk-size warning
```

## Result

- Staff can bind a micro-form to a real store.
- Copied links, QR links, and micro-page booking CTAs preserve that store context.
- Public submissions carry stable hidden store context even when the visible form has no store field.
- Staff sees the customer's requested date/time before converting the submission.
- A requested time only becomes a scheduled booking after inventory exists and is not full/conflicted.
