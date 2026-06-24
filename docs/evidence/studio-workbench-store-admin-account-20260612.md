# Studio Workbench Store Admin Account 2026-06-12

## Result

Production now has an independent staff workbench account for `https://studio.evanshine.me/login`.

```text
username: store-admin
role_key: studio_staff
tenant_id: 000000
```

Password follows the shared demo password recorded in the local desktop handoff document. It is not printed in this repo evidence file.

## Role Scope

Role `studio_staff` was created with minimal workbench permissions instead of `superadmin`.

Included permission groups:

- Store/product read:
  - `yy:store:list`
  - `yy:product:list`
- Order read/update:
  - `yy:order:list`
  - `yy:order:query`
  - `yy:order:edit`
- Album/asset operations:
  - `yy:photoAlbum:list`
  - `yy:photoAlbum:add`
  - `yy:photoAlbum:edit`
  - `yy:photoAsset:list`
  - `yy:photoAsset:add`
  - `yy:photoAsset:edit`
- OSS upload/query:
  - `system:oss:list`
  - `system:oss:query`
  - `system:oss:upload`

## Database Evidence

Production PostgreSQL checks returned:

```text
store-admin -> user_id=990010, role_key=studio_staff, status=0
studio_staff role menu rows -> 16
```

## Next Manual Acceptance

Use the browser captcha on `https://studio.evanshine.me/login` and log in as `store-admin`.

Then verify:

- Orders page shows `API 已连接`.
- Order rows show `Backend Sync`.
- Advancing an order status persists after refresh.
- Photo management upload writes `yy_photo_asset`.
