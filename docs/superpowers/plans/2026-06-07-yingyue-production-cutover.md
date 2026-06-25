# Yingyue Production Cutover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把影约云从“本地客户取片和抖音来客代码已验证”推进到“正式 API 域名、私有 OSS、H5/微信/抖音小程序、DOUYIN_LIFE SPI 都能线上验收”。

**Architecture:** Spring Boot/RuoYi 作为唯一正式业务 API；`photo.evanshine.me` 不能继续承担正式 API，当前它是 Lsky 临时图床入口。正式客户取片走 `api.evanshine.me` 或同等 API 域名，OSS 保持私有，客户图片只通过后端鉴权后的短期签名 URL 或 `/client/photo/assets/{assetId}/stream` 访问。抖音来客主线固定为 `DOUYIN_LIFE`，生产 SPI 必须启用签名校验并返回抖音裸 JSON。

**Tech Stack:** Spring Boot, RuoYi-Vue-Plus, PostgreSQL, Redis, Vue 3/Element Plus, uni-app H5/mp-weixin/mp-toutiao, Aliyun OSS private bucket, Nginx/Caddy, systemd, Douyin Life OpenAPI/SPI.

---

## Current State

- Repo: `D:\OtherProject\CameraApp\yingyue-cloud-repo`
- Branch: `yingyue-closed-loop-optimization-20260603`
- PR: `https://github.com/dengzhekun/yingyue-cloud/pull/1`
- Repo visibility: private
- Local backend `http://127.0.0.1:8080` photo pickup smoke 已通过。
- H5 browser regression 已通过：登录、相册列表、2 张照片详情、预览、下载状态。
- Mobile builds 已通过：`npm run typecheck`、`npm run build:h5`、`npm run build:mp-weixin`、`npm run build:mp-toutiao`。
- Admin build 已通过：`admin-ui` 的 `npm run build:dev`。
- Backend tests/package 已通过：targeted yy tests 和 `mvn -pl ruoyi-admin -am -DskipTests package`。
- `http://47.94.157.55:8080` 是 Lsky PHP/Caddy 临时图床，不是影约云 Spring Boot API；`/client/photo/*` 在这个地址 404 是正常现象。
- Local deployment/preflight artifacts are committed locally but not pushed because GitHub HTTPS push is currently failing from this machine.

---

## Progress Snapshot 2026-06-07

| Area | Status | Evidence |
| --- | --- | --- |
| API topology docs | Done locally | `docs/yingyue-springboot-production-deploy.md` |
| Nginx/Caddy/systemd templates | Done locally | `backend/script/docker/nginx/conf/yingyue-api.nginx.example.conf`, `backend/script/docker/caddy/YingyueApi.Caddyfile.example`, `backend/script/deploy/yingyue-admin.service.example` |
| Production preflight script | Done locally | `tools/yingyue-production-preflight.ps1` |
| Local photo pickup preflight | Passed | `docs/evidence/production-cutover-preflight-local-20260607.md` |
| Signature-only preflight option | Done locally | `tools/yingyue-production-preflight.ps1 -SkipAuthJsonRoute` |
| Deploy package builder | Done locally | `tools/yingyue-build-deploy-package.ps1`, `docs/evidence/deploy-package-local-20260607.md` |
| Spring Boot production host | Pending external deployment | Need server deploy and reverse proxy cutover |
| Production database migrations | Pending external deployment | Need production backup and migration run |
| Douyin Life Spring Boot SPI cutover | Pending external platform config | Need Open Platform callback URL switch and real logid |
| GitHub push / PR update | Pending network recovery | Local branch is ahead of origin |

---

## File Structure

- Create: `docs/yingyue-springboot-production-deploy.md`
  - 正式部署步骤、端口、域名、环境变量、数据库迁移、回滚说明。
- Create: `backend/script/docker/nginx/conf/yingyue-api.nginx.example.conf`
  - Nginx API 反代模板，覆盖 `/prod-api/`、`/client/photo/`、`/api/douyin/life/`。
- Create: `backend/script/docker/caddy/YingyueApi.Caddyfile.example`
  - Caddy API 反代模板，适合当前已有 Caddy 服务器。
- Create: `backend/script/deploy/yingyue-admin.service.example`
  - Spring Boot systemd 服务模板。
- Create: `tools/yingyue-production-preflight.ps1`
  - 一键预检正式 API：客户取片、JSON 路由、可选 Douyin SPI 签名探针。
- Create: `tools/yingyue-build-deploy-package.ps1`
  - 生成不含密钥的 Spring Boot API 部署包，便于复制到服务器。
- Modify: `backend/.env.example`
  - 只补非密钥占位项：API 域名、OSS 私有策略说明、生产签名开关。
- Modify: `docs/photo-pickup-smoke.md`
  - 补充 `api.evanshine.me` 正式验证方式。
- Modify: `docs\yiyue\api_map.md`
  - 记录正式 API 域名和不要把 Lsky 当 Spring Boot API。
- Modify: `docs\yiyue\douyinapp\README.md`
  - 写明抖音小程序导入路径、API 域名、stream 兜底。
- Modify: `docs\yiyue\wechatapp\README.md`
  - 写明微信小程序导入路径、合法域名、手机号+取片码 MVP。

---

## Task 1: Confirm Target Production Topology

**Files:**
- Modify: `docs/yingyue-springboot-production-deploy.md`

- [x] **Step 1: Choose the API domain**

Use this target unless manually changed:

```text
API domain: https://api.evanshine.me
H5/customer entry: https://photo.evanshine.me or a later dedicated pickup domain
Temporary Lsky: http://47.94.157.55:8080, not official API
```

Expected decision:

```text
api.evanshine.me points to the server that actually runs Spring Boot.
photo.evanshine.me no longer needs to expose /client/photo/*.
```

- [ ] **Step 2: Choose the Spring Boot host**

Prefer a host whose outbound IP is already accepted by Douyin Life:

```text
preferred: 103.24.216.8 if it is the current Douyin Life whitelisted server
fallback: another server, but its outbound IP must be added to Douyin Life whitelist
```

Expected:

```text
One host runs java -jar ruoyi-admin.jar, PostgreSQL/Redis reachable, 80/443 open.
```

- [x] **Step 3: Record the decision**

Add this section to `docs/yingyue-springboot-production-deploy.md`:

```markdown
## Production Topology

- API domain: `https://api.evanshine.me`
- Spring Boot upstream: `127.0.0.1:8080`
- Public API prefixes:
  - `/prod-api/`
  - `/client/photo/`
  - `/api/douyin/life/`
- Temporary Lsky endpoint `http://47.94.157.55:8080` is not a Spring Boot API.
```

---

## Task 2: Add Reverse Proxy and Service Templates

**Files:**
- Create: `backend/script/docker/nginx/conf/yingyue-api.nginx.example.conf`
- Create: `backend/script/docker/caddy/YingyueApi.Caddyfile.example`
- Create: `backend/script/deploy/yingyue-admin.service.example`

- [x] **Step 1: Add Nginx API template**

Create `backend/script/docker/nginx/conf/yingyue-api.nginx.example.conf`:

```nginx
server {
    listen 80;
    server_name api.evanshine.me;

    client_max_body_size 50m;

    location /prod-api/ {
        proxy_pass http://127.0.0.1:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /client/photo/ {
        proxy_pass http://127.0.0.1:8080/client/photo/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/douyin/life/ {
        proxy_pass http://127.0.0.1:8080/api/douyin/life/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

- [x] **Step 2: Add Caddy API template**

Create `backend/script/docker/caddy/YingyueApi.Caddyfile.example`:

```caddyfile
api.evanshine.me {
    encode zstd gzip

    request_body {
        max_size 50MB
    }

    reverse_proxy /prod-api/* 127.0.0.1:8080
    reverse_proxy /client/photo/* 127.0.0.1:8080
    reverse_proxy /api/douyin/life/* 127.0.0.1:8080

    respond "not found" 404
}
```

- [x] **Step 3: Add systemd service template**

Create `backend/script/deploy/yingyue-admin.service.example`:

```ini
[Unit]
Description=Yingyue Cloud Spring Boot API
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/yingyue/backend
EnvironmentFile=/opt/yingyue/backend/.env.production
ExecStart=/usr/bin/java -jar /opt/yingyue/backend/ruoyi-admin.jar
Restart=always
RestartSec=5
SuccessExitStatus=143
User=yingyue
Group=yingyue

[Install]
WantedBy=multi-user.target
```

- [x] **Step 4: Verify config syntax locally**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
git diff --check
```

Expected:

```text
no output
```

- [ ] **Step 5: Commit**

Run:

```powershell
git add -- docs/yingyue-springboot-production-deploy.md backend/script/docker/nginx/conf/yingyue-api.nginx.example.conf backend/script/docker/caddy/YingyueApi.Caddyfile.example backend/script/deploy/yingyue-admin.service.example
git commit -m "docs: add yingyue spring boot deployment templates"
git push
```

---

## Task 3: Add Production Preflight Script

**Files:**
- Create: `tools/yingyue-production-preflight.ps1`
- Modify: `docs/photo-pickup-smoke.md`

- [x] **Step 1: Create preflight wrapper**

Create `tools/yingyue-production-preflight.ps1` with parameters:

```powershell
param(
  [Parameter(Mandatory = $true)][string]$BaseUrl,
  [string]$Phone = "13800003333",
  [string]$AccessCode = "PICK-202606-001",
  [string]$AlbumId = "903001",
  [switch]$SkipPhotoSmoke,
  [switch]$CheckDouyinMissingSignature
)
```

Required behavior:

```text
1. Print base URL only, never print tokens or full signed URLs.
2. If not SkipPhotoSmoke, call tools/photo-pickup-smoke.ps1.
3. POST /client/photo/auth/verify and fail if response looks like HTML.
4. If CheckDouyinMissingSignature, POST a harmless malformed request to a Douyin Life SPI path and verify response is JSON, not RuoYi R.ok and not HTML.
5. Exit 1 on any failed check.
```

- [x] **Step 2: Run local preflight**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\yingyue-production-preflight.ps1 -BaseUrl http://127.0.0.1:8080 -Phone 13800003333 -AccessCode PICK-202606-001 -AlbumId 903001
```

Expected:

```text
photo pickup smoke passes
auth response is JSON
preflight passed
```

- [ ] **Step 3: Commit**

Run:

```powershell
git add -- tools/yingyue-production-preflight.ps1 docs/photo-pickup-smoke.md
git commit -m "test: add yingyue production preflight"
git push
```

---

## Task 4: Deploy Spring Boot API to the Chosen Host

**Files:**
- Use: `backend/ruoyi-admin/target/ruoyi-admin.jar`
- Use: `backend/.env.example`
- Use: `tools/yingyue-build-deploy-package.ps1`
- Use on server only: `/opt/yingyue/backend/.env.production`

- [x] **Step 1: Build backend package**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-admin -am -DskipTests package
```

Expected:

```text
BUILD SUCCESS
ruoyi-admin/target/ruoyi-admin.jar exists
```

- [x] **Step 1.5: Create a deploy package**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\yingyue-build-deploy-package.ps1
```

Expected:

```text
dist\yingyue-api-deploy contains ruoyi-admin.jar, .env.production.example, service/reverse-proxy templates, SQL migrations, docs, and smoke scripts.
No real secrets are copied.
```

- [ ] **Step 2: Create production env file on server**

Use `backend/.env.example` as the source. Required production values:

```env
DB_URL=jdbc:postgresql://127.0.0.1:5432/yingyue_cloud?useUnicode=true&characterEncoding=utf8&sslmode=disable&reWriteBatchedInserts=true
DB_DRIVER=org.postgresql.Driver
DB_USERNAME=yingyue
DB_PASSWORD=<server-only-secret>
REDIS_PASSWORD=<server-only-secret>
YY_CLIENT_PHOTO_TOKEN_SECRET=<server-only-32-plus-char-secret>
DOUYIN_LIFE_BASE_URL=https://open.douyin.com
DOUYIN_LIFE_REQUIRE_SIGNATURE=true
DOUYIN_LIFE_REFUND_APPLY_MODE=processing
```

Never commit `/opt/yingyue/backend/.env.production`.

- [ ] **Step 3: Start service**

Run on server:

```bash
sudo systemctl daemon-reload
sudo systemctl enable yingyue-admin
sudo systemctl restart yingyue-admin
sudo systemctl status yingyue-admin --no-pager
```

Expected:

```text
Active: active (running)
Spring Boot listens on 127.0.0.1:8080 or configured internal port.
```

- [ ] **Step 4: Apply reverse proxy**

Use Nginx or Caddy template from Task 2. Expected public behavior:

```text
https://api.evanshine.me/client/photo/auth/verify returns JSON for POST.
https://api.evanshine.me/api/douyin/life/... returns Douyin-shaped JSON, not HTML.
```

---

## Task 5: Apply Production Database Migrations

**Files:**
- Use: `backend/script/sql/postgres/postgres_yy_photo_private_oss_migration_20260606.sql`
- Use: `backend/script/sql/postgres/postgres_yy_photo_asset_object_key_guard_20260607.sql`

- [ ] **Step 1: Back up production database**

Run on server:

```bash
pg_dump -Fc -f /opt/yingyue/backups/yingyue_cloud_$(date +%Y%m%d_%H%M%S).dump yingyue_cloud
```

Expected:

```text
backup file created under /opt/yingyue/backups
```

- [ ] **Step 2: Apply migrations**

Run:

```bash
psql "$YINGYUE_DB_URL" -f backend/script/sql/postgres/postgres_yy_photo_private_oss_migration_20260606.sql
psql "$YINGYUE_DB_URL" -f backend/script/sql/postgres/postgres_yy_photo_asset_object_key_guard_20260607.sql
```

Expected:

```text
no SQL error
visible active blank object_key count = 0
duplicate active object_key count = 0
```

- [ ] **Step 3: Record evidence**

Create or update:

```text
docs/evidence/photo-asset-db-guard-production-20260607.md
```

Include only:

```text
migration file names
constraint/index names
counts
timestamp
```

Do not include DB passwords or connection strings.

---

## Task 6: Verify Customer Photo Pickup Online

**Files:**
- Use: `tools/yingyue-production-preflight.ps1`
- Update: `docs/evidence/photo-pickup-production-smoke-20260607.md`

- [ ] **Step 1: Run production preflight**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\yingyue-production-preflight.ps1 -BaseUrl https://api.evanshine.me -Phone 13800003333 -AccessCode PICK-202606-001 -AlbumId 903001
```

Expected:

```text
auth success
albums count >= 1
detail assetCount = 2 or the current expected production count
preview-url success
stream success status=200
preflight passed
```

- [ ] **Step 2: Verify OSS privacy**

Expected results:

```text
裸 OSS object URL: 403
后端 stream URL + X-Client-Token: 200 image/*
签名 URL: valid before expiry, invalid after expiry
```

- [ ] **Step 3: Verify H5**

Open:

```text
http://127.0.0.1:5174/#/pages/pickup/login/index
```

and, after production H5 domain exists:

```text
https://photo.evanshine.me/#/pages/pickup/login/index
```

Expected:

```text
手机号 + 取片码登录
相册列表显示
相册详情只显示 visible=1 and objectKey non-empty assets
预览图片成功
下载不把 client_token 放进 URL
```

- [ ] **Step 4: Record evidence**

Create:

```text
docs/evidence/photo-pickup-production-smoke-20260607.md
```

Include:

```text
base URL
asset count
stream content type
OSS bare 403 result
signed URL expiry check result
```

Never include tokens or full signed URLs.

---

## Task 7: Cut DOUYIN_LIFE SPI to Spring Boot

**Files:**
- Read: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyDouyinLifeSpiController.java`
- Read: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/channel/douyin/DouyinLifeChannelAdapter.java`
- Update: `docs\yiyue\api_map.md`
- Update: `docs/evidence/douyin-life-springboot-spi-cutover-20260607.md`

- [ ] **Step 1: Ensure production env is safe**

Production must have:

```env
DOUYIN_LIFE_REQUIRE_SIGNATURE=true
DOUYIN_LIFE_REFUND_APPLY_MODE=processing
```

Expected:

```text
bad or missing signature is rejected with Douyin raw JSON.
refund_apply returns processing unless explicitly testing allow/reject mode.
```

- [ ] **Step 2: Configure Open Platform callback URLs**

Use Spring Boot API domain:

```text
https://api.evanshine.me/api/douyin/life/tripartite-code/create
https://api.evanshine.me/api/douyin/life/refund/apply
https://api.evanshine.me/api/douyin/life/refund/notify
https://api.evanshine.me/api/douyin/life/reservation/order-create
https://api.evanshine.me/api/douyin/life/reservation/pay-notify
https://api.evanshine.me/api/douyin/life/reservation/stock-query
```

Expected:

```text
All official callback URLs point to Spring Boot, not temporary Python SPI.
```

- [ ] **Step 3: Run safe signature probe**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\yingyue-production-preflight.ps1 -BaseUrl https://api.evanshine.me -SkipPhotoSmoke -CheckDouyinMissingSignature
```

If production demo photo data is not present, skip the photo auth route and check only the Douyin SPI guard:

```powershell
.\tools\yingyue-production-preflight.ps1 -BaseUrl https://api.evanshine.me -SkipPhotoSmoke -SkipAuthJsonRoute -CheckDouyinMissingSignature
```

Expected:

```text
response is JSON
response is Douyin raw shape
response is not RuoYi R.ok wrapper
response is not HTML
```

- [ ] **Step 4: Run Douyin Life OpenAPI smoke from whitelisted exit**

Run from the whitelisted server or via the approved proxy:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\run-douyin-life-current-order.ps1
```

Expected:

```text
client_token success
order query no longer fails with "应用未获得该能力" or "IP不在白名单"
OpenAPI logid is recorded
```

- [ ] **Step 5: Record platform logid evidence**

Create:

```text
docs/evidence/douyin-life-springboot-spi-cutover-20260607.md
```

Include:

```text
callback path
X-Bytedance-Logid from real Douyin SPI request
OpenAPI extra.logid from active calls
admin UI logid display location
```

Do not include buyer phone, token, app secret, or full request bodies.

---

## Task 8: Configure Mini Program Domains

**Files:**
- Update: `docs\yiyue\wechatapp\README.md`
- Update: `docs\yiyue\douyinapp\README.md`

- [ ] **Step 1: WeChat mini program**

Set legal domains:

```text
request合法域名: https://api.evanshine.me
downloadFile合法域名: https://api.evanshine.me
uploadFile合法域名: https://api.evanshine.me
```

Import path:

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-weixin
```

Expected:

```text
手机号 + 取片码登录 works.
预览/下载 uses /client/photo/assets/{assetId}/stream if OSS signed domain is blocked.
```

- [ ] **Step 2: Douyin mini program**

Set equivalent platform domains:

```text
request domain: https://api.evanshine.me
download/upload domain: https://api.evanshine.me
```

Import path:

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao
```

Expected:

```text
手机号 + 取片码登录 works.
后续 Douyin Life order phone/platform identity can link albums.
```

- [ ] **Step 3: Rebuild mini programs after API base config changes**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm run typecheck
npm run build:mp-weixin
npm run build:mp-toutiao
```

Expected:

```text
all builds pass
```

---

## Task 9: Final Regression and PR Update

**Files:**
- Update evidence docs under `docs/evidence/`
- Update PR body

- [ ] **Step 1: Run full verification set**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyPhotoAssetServiceImplTest,YyClientPhotoServiceImplTest,YyClientPhotoControllerTest,DouyinLifeChannelAdapterTest,DouyinOpenApiClientTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
mvn -pl ruoyi-admin -am -DskipTests package
```

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run build:dev
```

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm run typecheck
npm run build:h5
npm run build:mp-weixin
npm run build:mp-toutiao
```

Expected:

```text
all commands pass
```

- [ ] **Step 2: Commit docs/scripts/templates only with precise paths**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
git status --short
git add -- docs/yingyue-springboot-production-deploy.md backend/script/docker/nginx/conf/yingyue-api.nginx.example.conf backend/script/docker/caddy/YingyueApi.Caddyfile.example backend/script/deploy/yingyue-admin.service.example tools/yingyue-production-preflight.ps1 docs/photo-pickup-smoke.md docs/evidence/photo-pickup-production-smoke-20260607.md docs/evidence/douyin-life-springboot-spi-cutover-20260607.md
git commit -m "docs: add production cutover checklist"
git push
```

If a listed file was not changed, remove it from `git add`. Do not use `git add .`.

- [ ] **Step 3: Update PR**

Use `gh pr edit 1 --body-file <file>` or the GitHub UI. PR body must include:

```text
local verification passed
production API preflight passed
OSS private verification passed
mini program build paths
Douyin Life Spring Boot SPI cutover evidence
remaining external platform items
```

---

## Done Criteria

- [ ] `https://api.evanshine.me/client/photo/*` returns JSON from Spring Boot.
- [ ] Customer H5 can login, list albums, preview, and download.
- [ ] Private OSS bare URL returns 403.
- [ ] Backend stream/signed URL returns image with permission check.
- [ ] `mp-weixin` and `mp-toutiao` builds pass and import paths are documented.
- [ ] Douyin Life SPI URLs point to Spring Boot.
- [ ] Production `DOUYIN_LIFE_REQUIRE_SIGNATURE=true`.
- [ ] Refund apply default remains `processing`.
- [ ] Real Douyin SPI/OpenAPI logid evidence is recorded.
- [ ] PR has latest verification evidence.

---

## Self-Review

- Spec coverage: covers production API routing, private OSS, H5, WeChat mini program, Douyin mini program, DOUYIN_LIFE SPI cutover, database migrations, and evidence.
- Placeholder scan: all paths, domains, commands, and expected results are explicit. Secrets are intentionally represented as server-only values and must not be committed.
- Type consistency: customer photo API keeps IDs as strings in responses; Spring Boot paths remain `/client/photo/*` and `/api/douyin/life/*`; DOUYIN_LIFE remains separate from generic DOUYIN.
