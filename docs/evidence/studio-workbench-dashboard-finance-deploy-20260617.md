# Studio Workbench Dashboard Finance Deploy - 2026-06-17

## Release

- Commit: `bae442b feat(studio): add dashboard finance overview api`
- Release: `prod-bae442b-dashboard-finance-20260617`
- Backend runtime jar: `/opt/yingyue/backend/ruoyi-admin.jar`
- Frontend site: `/var/www/studio.evanshine.me`
- Backup: `/opt/yingyue/backups/prod-bae442b-dashboard-finance-20260617-20260617-195949-pre`

## Build

```powershell
mvn -pl ruoyi-admin -am -DskipTests package
```

Result: `BUILD SUCCESS`; produced `backend\ruoyi-admin\target\ruoyi-admin.jar`.

```powershell
$env:VITE_STUDIO_DEMO='false'
$env:VITE_API_BASE_URL='https://api.evanshine.me'
$env:VITE_STUDIO_RELEASE_ID='prod-bae442b-dashboard-finance-20260617'
npm --prefix studio-workbench run build
```

Result: `vue-tsc -b && vite build` passed. Existing Vite chunk-size warning remains for `echarts-vendor`.

## Deploy

- Uploaded backend jar to `/opt/yingyue/releases/prod-bae442b-dashboard-finance-20260617/ruoyi-admin.jar`.
- Uploaded frontend zip to `/opt/yingyue/releases/prod-bae442b-dashboard-finance-20260617/studio-workbench.zip`.
- Backed up existing backend jar and studio site.
- Replaced backend jar, restarted `yingyue-admin.service`.
- Replaced studio site static files, ran `nginx -t`, then reloaded nginx.

## Smoke

```text
studio_status=200 content_type=text/html
studio_marker=present
auth_code_status=200 content_type=application/json
finance_unauth_status=200 content_type=application/json
{"code":401,"msg":"认证失败，无法访问系统资源","data":null}
backend_finance_vo=present
yingyue-admin.service=active
```

Notes:

- `GET /yy/dashboard/finance?date=2026-06-17` returns JSON `code=401` without login, proving the route is mapped and protected by auth.
- An immediate post-restart request briefly returned 502 while Spring Boot was still in its startup window; the service completed startup and later smoke passed.
