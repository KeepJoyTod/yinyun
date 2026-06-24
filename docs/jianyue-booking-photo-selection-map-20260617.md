# JianYue Booking Photo Selection Map 2026-06-17

## Conclusion

Booking completion should hand off cleanly to the existing customer photo/selection chain. Do not mix photo assets into the booking table; keep order-to-album linkage explicit.

## Current Photo Chain

| Step | Data/API |
| --- | --- |
| Order paid/synced | `yy_order` |
| Placeholder album | `POST /yy/order/{id}/photo-album-placeholder` |
| Album record | `yy_photo_album` |
| Photo upload | backend/admin/studio upload flow |
| Customer access | phone + pickup/access code |
| Photo streaming | `/client/photo/assets/{assetId}/stream` with client token |

## Booking Integration Points

| Booking event | Photo action |
| --- | --- |
| Douyin Life order sync with phone/store | Auto-create placeholder album when current service logic allows |
| Staff order create | Optionally create placeholder album after order create or after service starts |
| Save and receive | Eligible to create placeholder earlier |
| Complete service | Prompt staff to upload/link photos |
| Refund/cancel before service | Do not create new photo placeholder unless already used |

## UI Placement

| Page | Action |
| --- | --- |
| Order detail | Generate/repair photo album placeholder |
| Serving/completed order row | Upload/view photos when permission exists |
| Dashboard anomaly | Orders completed but no album/photos |
| Customer side | Phone + pickup code album access |

## Data Rules

- `yy_order` stores order facts; photo metadata stays in photo tables.
- A generated placeholder should be idempotent per order/channel.
- If no phone exists, do not create a customer-facing album.
- If no store exists, fix mapping first.
- Do not expose original OSS URLs directly to customer pages.

## Acceptance

- A valid order with phone/store can generate a placeholder album once.
- Re-running placeholder generation does not duplicate albums.
- Customer access requires phone/code validation.
- Booking UI can show whether an album exists without loading all photo assets.
