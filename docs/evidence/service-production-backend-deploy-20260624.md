# Service Production Backend Deploy - 2026-06-24

## Result

- Status: `PASS`
- Scope: backend jar deploy + PostgreSQL migration + authenticated API verification + production frontend deploy + real smoke for 5 service/collaboration routes
- Acceptance: service module environment has moved from “code patched” to “production deployed and smoke-verified”

## Release

- Commit: `b1900b8`
- Backend release dir: `/opt/yingyue/releases/service-production-b1900b8-20260624-183724`
- Backup dir: `/opt/yingyue/backups/service-production-b1900b8-20260624-183724-pre`
- Runtime jar: `/opt/yingyue/backend/ruoyi-admin.jar`
- Service: `yingyue-admin.service`
- Frontend release: `prod-b1900b8-service-production-frontend-20260624-1942`
- Frontend site dir: `/var/www/studio.evanshine.me`

## Build

```powershell
mvn -pl ruoyi-admin -am -DskipTests package
```

Result: `BUILD SUCCESS`; produced `backend\ruoyi-admin\target\ruoyi-admin.jar`.

Local jar used for deploy:

```text
backend\ruoyi-admin\target\ruoyi-admin.jar
size=163525864
```

## Deploy

Uploaded:

- `backend/ruoyi-admin/target/ruoyi-admin.jar`
- `backend/script/sql/postgres/postgres_yy_service_production_migration_20260624.sql`

Remote actions:

1. Backed up the existing runtime jar to `/opt/yingyue/backups/service-production-b1900b8-20260624-183724-pre/ruoyi-admin.jar`.
2. Ran PostgreSQL migration inside Docker container `yingyue-postgres` against database `yingyue_cloud`.
3. Replaced `/opt/yingyue/backend/ruoyi-admin.jar`.
4. Set owner to `yingyue:yingyue` and mode `0644`.
5. Restarted `yingyue-admin.service`.

Migration output:

```text
CREATE TABLE
CREATE INDEX
CREATE TABLE
CREATE INDEX
CREATE INDEX
CREATE TABLE
CREATE TABLE
CREATE INDEX
```

## Database Verification

Remote container facts:

```text
container=yingyue-postgres
POSTGRES_USER=yingyue
POSTGRES_DB=yingyue_cloud
```

Verified tables after migration:

```text
yy_collaboration_policy
yy_retouch_provider
yy_retouch_task
yy_service_license_binding
```

## Runtime Verification

Systemd status after restart:

```text
yingyue-admin.service active (running)
since 2026-06-24 18:46:10 CST
jar=/opt/yingyue/backend/ruoyi-admin.jar
jar_size=163525864
```

Warm-up behavior:

- First external checks returned `502` during the Spring Boot startup window.
- Subsequent checks recovered normally.

## API Smoke

Before deploy, the following routes returned JSON `code=404` from production:

- `/yy/serviceProduction/retouchTask/list`
- `/yy/serviceProduction/retouchProvider/list`
- `/yy/serviceProduction/collaborationPolicy`
- `/yy/serviceProduction/licenseBinding/list`

After deploy and warm-up:

```text
GET /auth/code -> 200
{"code":200,"data":{"captchaEnabled":false,"uuid":null,"img":null}}

GET /yy/serviceProduction/retouchTask/list?pageNum=1&pageSize=1 -> 200
{"code":401,"msg":"认证失败，无法访问系统资源","data":null}

GET /yy/serviceProduction/retouchProvider/list -> 200
{"code":401,"msg":"认证失败，无法访问系统资源","data":null}

GET /yy/serviceProduction/collaborationPolicy -> 200
{"code":401,"msg":"认证失败，无法访问系统资源","data":null}

GET /yy/serviceProduction/licenseBinding/list -> 200
{"code":401,"msg":"认证失败，无法访问系统资源","data":null}
```

Conclusion:

- The 4 service-production routes are now mapped in production.
- They are protected by auth as expected.
- This closes the backend environment gap from `404 route missing` to `401 auth required`.

## Frontend Deploy

Build/deploy facts:

- Build env:
  - `VITE_STUDIO_DEMO=false`
  - `VITE_API_BASE_URL=https://api.evanshine.me`
  - `VITE_STUDIO_RELEASE_ID=prod-b1900b8-service-production-frontend-20260624-1942`
- Local package:
  - `dist/studio-workbench-prod-b1900b8-service-production-frontend-20260624-1942.zip`
  - `dist/studio-workbench-prod-b1900b8-service-production-frontend-20260624-1942-posix.zip`
- Deploy path:
  - uploaded package to `/opt/yingyue/releases/studio-workbench-prod-b1900b8-service-production-frontend-20260624-1942.zip`
  - extracted to `/opt/yingyue/releases/studio-workbench-prod-b1900b8-service-production-frontend-20260624-1942`
  - replaced `/var/www/studio.evanshine.me`
- Deploy method:
  - local `Posh-SSH` was unavailable
  - frontend publish was completed via Python `paramiko` upload + remote unzip/copy + `nginx -t` + `systemctl reload nginx`

Release marker verification:

```text
GET https://studio.evanshine.me/release.txt -> 200
prod-b1900b8-service-production-frontend-20260624-1942

remote cat /var/www/studio.evanshine.me/release.txt
prod-b1900b8-service-production-frontend-20260624-1942
```

## Real Smoke

Evidence directory:

- `docs/evidence/studio-service-production-real-smoke-20260624-194430/`

Smoke command:

```powershell
$body = @{ tenantId='000000'; username='store-admin'; password='<verified-current-password>'; clientId='e5cd7e4891bf95d1d19206ce24a7b32e'; grantType='password' } | ConvertTo-Json
$login = Invoke-RestMethod -Uri 'https://api.evanshine.me/auth/login' -Method Post -ContentType 'application/json' -Body $body
$env:STUDIO_SMOKE_API_TOKEN = $login.data.access_token
$env:STUDIO_SMOKE_RELEASE_ID = 'prod-b1900b8-service-production-frontend-20260624-1942'
node .\tools\studio-workbench-service-production-real-smoke.mjs
```

Smoke summary:

```json
{
  "status": "PASS",
  "releaseTxt": "prod-b1900b8-service-production-frontend-20260624-1942",
  "markerMatched": true,
  "tokenPresent": true,
  "routeCount": 5,
  "failedRoutes": [],
  "pageErrorCount": 0
}
```

Passed routes:

- `/service/retouch-center`
- `/service/retouch-providers`
- `/collaboration/retouch-center-settings`
- `/collaboration/common-settings`
- `/collaboration/open-settings`

Key behavior verified:

- `collaboration/retouch-center-settings` no longer shows `Missing backend id`
- 5 pages stay on their target URLs after login/token injection
- release marker matches the new frontend package
- screenshots for all 5 pages were captured in the evidence directory

## Residual Risk

- The smoke JSON still records intermittent browser console `ERR_CONNECTION_TIMED_OUT` / `Failed to fetch` noise from background requests, but the 5 target routes all rendered successfully and produced `0` page errors.
- The current evidence covers read-only real smoke only; it does not click save or write production business data.
