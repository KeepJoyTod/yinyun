# JianYue Booking CRM Member Map 2026-06-17

## Conclusion

CRM/member work should be built after the booking core is stable. The staff order form should collect enough customer data now, but advanced member features can remain behind a clear interface.

## Current Booking-Driven Customer Needs

| Need | Data |
| --- | --- |
| Create service order | name, phone, gender, email, store, product, schedule |
| Identify returning customer | phone and optional `customer_id` |
| Contact customer | notification toggle, phone, email |
| Review history | orders by customer phone/id |
| Privacy | masked phone and scoped store permissions |

## Tables

| Table | Role |
| --- | --- |
| `yy_customer` | Customer master record |
| `yy_order` | Order history and channel/source data |
| `yy_notification_template` | Message template when notifications are implemented |
| `yy_notification_log` | Notification delivery audit when used |

## Staff Order Form Compatibility

| Field | Immediate behavior | Later CRM behavior |
| --- | --- | --- |
| `customerName` | Save into order | Upsert customer profile |
| `customerPhone` | Save into order and search | Primary customer lookup key |
| `gender` | Payload-compatible field | Save to customer profile |
| `email` | Payload-compatible field | Save to customer profile |
| `customerId` | Optional association | Hard link to `yy_customer.id` |
| `notifyEnabled` | Store intent | Send message and write notification log when provider configured |

## Customer Merge Rules

- Exact phone match is the safest first key.
- Do not auto-merge customers across stores using only fuzzy name.
- If multiple customers share a phone, show association choice to staff.
- Keep order snapshot fields even when customer profile later changes.

## Member Features Later

| Feature | Dependency |
| --- | --- |
| Member tags | stable customer identity |
| Package/card balance | payment ledger and product catalog |
| Birthday/anniversary reminders | notification provider |
| Repeat purchase analysis | clean order history |
| Customer photo album history | `yy_photo_album` and order-photo link |

## Privacy Rules

- Do not expose customer phone/name across store scopes.
- Mask phone in reports/evidence.
- Do not commit exported customer data.
- Notification logs should store masked payload summary unless full payload is required for legal audit.

## Acceptance

- Staff can create an order for a new customer without CRM setup.
- Staff can select/link an existing customer when available.
- Order list search by phone/name remains store-scoped.
- Future CRM changes do not require changing the core booking ledger.
