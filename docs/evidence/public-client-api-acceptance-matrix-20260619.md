# Public Client API Acceptance Matrix - 2026-06-19

## Scope

This batch turns Joe/uniapp customer storefront pages from frontend fallback/pre-implementation into real backend-backed flows.

## Implemented Endpoints

| Endpoint | Level | Backing data |
| --- | --- | --- |
| `GET /api/public/brand/{brandCode}` | READ_ONLY | config defaults |
| `GET /api/public/pages/home` | READ_ONLY | `yy_product` categories + static entry menu |
| `GET /api/public/stores` | READ_ONLY | `yy_store` |
| `GET /api/public/stores/{storeId}/products` | READ_ONLY | `yy_store`, `yy_product` |
| `GET /api/public/products/{productId}` | READ_ONLY | `yy_product`, `yy_store` |
| `GET /api/public/stores/{storeId}/slots` | READ_ONLY | `yy_booking_slot_inventory` |
| `POST /api/customer/auth/wechat-login` | LOCAL_TOKEN | local HMAC token only |
| `POST /api/customer/auth/bind-phone` | WRITE_LOCAL_DB | `yy_customer` |
| `GET /api/customer/profile` | READ_ONLY | token + `yy_customer` |
| `GET /api/customer/orders/summary` | READ_ONLY | `yy_order` by token phone |
| `GET /api/customer/orders` | READ_ONLY | `yy_order` by token phone |
| `GET /api/customer/orders/{orderId}` | READ_ONLY | `yy_order` by token phone |
| `POST /api/customer/orders` | WRITE_LOCAL_DB | `yy_order`, `yy_customer` |
| `POST /api/customer/orders/{orderId}/pay` | READ_ONLY placeholder | no payment write |
| `POST /api/customer/orders/{orderId}/cancel` | WRITE_LOCAL_DB | `yy_order`, inventory release if needed |
| `POST /api/customer/orders/{orderId}/reschedule` | WRITE_LOCAL_DB | `yy_order`, `yy_booking_slot_inventory` if paid |

## Boundaries

- No Douyin/WeChat payment is performed in this batch.
- `DOUYIN_LIFE` orders cannot be cancelled or rescheduled through customer APIs.
- Slots are read from `yy_booking_slot_inventory`; historical Douyin orders without slot fields are not fabricated into schedule slots.
- Public responses do not expose full customer phone numbers.

## Verification

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests compile

cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm run typecheck
```

Results:

- Backend compile: `BUILD SUCCESS`
- Mobile typecheck: `vue-tsc --noEmit` passed
