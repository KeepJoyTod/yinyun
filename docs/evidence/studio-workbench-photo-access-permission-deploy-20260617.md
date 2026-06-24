# Studio Workbench Photo Access Permission Deploy - 2026-06-17

## Result

`studio-workbench` release `prod-6f617c8-photo-access-perm-20260617-20260617-234913` has been deployed to Hong Kong 2 at `https://studio.evanshine.me`.

This deployment aligns the production static workbench with commit `6f617c8 fix(studio): grant photo access log permission`.

## Scope

- Frontend static files: updated under `/var/www/studio.evanshine.me`.
- Database: permission SQL had already been applied before this frontend deploy.
- Backend service, nginx site config, miniapp builds: unchanged.

## Artifact

```text
Local package: C:\Users\Administrator\AppData\Local\Temp\yingyue-deploy\studio-workbench-prod-6f617c8-photo-access-perm-20260617-20260617-234913.zip
SHA256: 4AD94D65244DDED9028B07CED933138180105EBBC000C8545D7C569FA3EE2E2E
Size: 602329
Remote package: /opt/yingyue/releases/studio-workbench-prod-6f617c8-photo-access-perm-20260617-20260617-234913.zip
```

## Deployment

```text
release=prod-6f617c8-photo-access-perm-20260617-20260617-234913
release_dir=/opt/yingyue/releases/prod-6f617c8-photo-access-perm-20260617-20260617-234913
backup=/opt/yingyue/backups/20260617-235022-pre-studio-workbench-prod-6f617c8-photo-access-perm-20260617-20260617-234913
marker_count=9
asset_count=79
nginx -t -> successful
systemctl reload nginx -> successful
```

## Verification

Local:

```text
npm --prefix studio-workbench run test -- src/features/settings/RolesView.contract.test.ts
-> 17 passed

npm --prefix studio-workbench run test -- src/features/albums/PhotoMgmtView.contract.test.ts src/features/albums/photoMgmtOperations.test.ts
-> 28 passed

npm --prefix studio-workbench run build
-> passed, existing Vite chunk-size warning only
```

Production HTTP:

```text
GET https://studio.evanshine.me/dashboard/today?cb=prod-6f617c8-photo-access-perm-20260617-20260617-234913
-> 200, marker=True

GET https://studio.evanshine.me/service/photos?cb=prod-6f617c8-photo-access-perm-20260617-20260617-234913
-> 200, marker=True

GET https://studio.evanshine.me/settings/roles?cb=prod-6f617c8-photo-access-perm-20260617-20260617-234913
-> 200, marker=True

GET https://api.evanshine.me/auth/code
-> 200, application/json, bytes=80
```

Production API with a fresh login token:

```text
POST https://api.evanshine.me/auth/login
-> code=200, token_present=True

GET https://api.evanshine.me/yy/photoAccessLog/list?pageNum=1&pageSize=1
-> code=200, total=974, rows=1
```

## Rollback

```bash
find /var/www/studio.evanshine.me -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +
cp -a /opt/yingyue/backups/20260617-235022-pre-studio-workbench-prod-6f617c8-photo-access-perm-20260617-20260617-234913/. /var/www/studio.evanshine.me/
nginx -t
systemctl reload nginx
```

## Notes

- Browser sessions created before the permission SQL change may still need logout/login to refresh role permissions.
- No token, password, customer photo data, phone number, or raw private payload is recorded in this file.
