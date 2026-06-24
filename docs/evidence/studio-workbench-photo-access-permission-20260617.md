# Studio Workbench Photo Access Permission Fix - 2026-06-17

## Problem

Production photo management page showed:

```text
访问日志加载失败：没有访问权限，请联系管理员授权
```

Root cause:

- `/yy/photoAccessLog/list` requires `yy:photoAccessLog:list`.
- Store workbench roles had `yy:photoAlbum:list`, but the access-log permission menu and role binding were missing.

## Fix

- Added role-template permission in `studio-workbench/src/features/settings/rolesOperations.ts`.
- Added PostgreSQL migration:
  - `backend/script/sql/postgres/postgres_yy_photo_access_log_permission_20260617.sql`
  - inserts `yy:photoAccessLog:list` and `yy:photoAccessLog:export` menu permissions;
  - grants `yy:photoAccessLog:list` to roles that already have `yy:photoAlbum:list`;
  - grants `yy:photoAccessLog:export` to roles that already have `yy:photoAlbum:export`.

## Production SQL Result

Applied on HK2 against `yingyue_cloud`:

```text
INSERT 0 2
INSERT 0 1
INSERT 0 0
menu_count=1
role_binding_count=1
```

## Verification

Local:

```text
npm --prefix studio-workbench run test -- src/features/settings/RolesView.contract.test.ts
17 passed

npm --prefix studio-workbench run test -- src/features/albums/PhotoMgmtView.contract.test.ts src/features/albums/photoMgmtOperations.test.ts
28 passed

npm --prefix studio-workbench run build
passed, existing Vite chunk-size warning only
```

Production API with fresh login token:

```text
POST https://api.evanshine.me/auth/login -> code=200
GET  https://api.evanshine.me/yy/photoAccessLog/list?pageNum=1&pageSize=1 -> code=200, total=974
```

## Notes

- Existing browser sessions may retain old permissions until token refresh or re-login.
- No customer photo data, token, password, or raw private payload was written to this evidence file.
