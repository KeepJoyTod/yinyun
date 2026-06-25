# Yingyue Next Operations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the current 影约云 customer photo pickup and DOUYIN_LIFE integration from "local code verified" to "test server and production-like links verified with evidence".

**Architecture:** Keep RuoYi-Vue-Plus as the admin/backend system, uni-app as the shared H5/WeChat/Douyin client, and Aliyun OSS as private object storage. Customer images are always fetched through backend permission checks and short-lived signed URLs or `/client/photo/assets/{assetId}/stream`; DOUYIN_LIFE SPI traffic must be handled by Spring Boot with raw Douyin JSON responses and signature verification in production.

**Tech Stack:** Spring Boot, RuoYi-Vue-Plus, MyBatis-Plus, PostgreSQL, Vue 3, Element Plus, uni-app H5/mp-weixin/mp-toutiao, Aliyun OSS, Nginx/Caddy reverse proxy, Douyin Life OpenAPI/SPI.

---

## Current State

- Repo: `D:\OtherProject\CameraApp\yingyue-cloud-repo`
- Branch: `yingyue-closed-loop-optimization-20260603`
- PR: `https://github.com/dengzhekun/yingyue-cloud/pull/1`
- Repo visibility: private
- Current `git status --short --branch`: clean branch line only
- Local backend `127.0.0.1:8080` was restarted with `tools/start-yingyue-local.ps1 -SkipFrontend -SkipPrototype`
- Local photo pickup smoke previously passed:
  - auth success
  - album count success
  - album `903001` detail asset count `2`
  - preview URL success
  - stream success with `X-Client-Token`
- Public `http://47.94.157.55:8080` smoke fails because the server is the Lsky PHP/Caddy entry, not a Spring Boot API server
- Mobile builds previously passed:
  - `npm run typecheck`
  - `npm run build:h5`
  - `npm run build:mp-weixin`
  - `npm run build:mp-toutiao`
- Backend package previously passed after stopping the locking Java process
- DOUYIN_LIFE is the main Douyin business channel; do not mix it with generic `DOUYIN`

---

## Task 1: Restore Local Backend and Reconfirm Clean Baseline

**Files:**
- Read only: `D:\OtherProject\CameraApp\yingyue-cloud-repo`
- No code changes expected

- [ ] **Step 1: Confirm working tree status**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
git status --short --branch
```

Expected:

```text
## yingyue-closed-loop-optimization-20260603...origin/yingyue-closed-loop-optimization-20260603
```

- [x] **Step 2: Restart local Spring Boot backend**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\start-yingyue-local.ps1 -SkipFrontend -SkipPrototype
```

Expected:

```text
Spring Boot starts on port 8080 with local PostgreSQL and Redis env vars.
```

- [x] **Step 3: Re-run local photo pickup smoke**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\photo-pickup-smoke.ps1 -BaseUrl http://127.0.0.1:8080 -Phone 13800003333 -AccessCode PICK-202606-001 -AlbumId 903001
```

Expected:

```text
auth: success
albums: success count=1
detail: success albumId=903001, assetCount=2
preview-url: success
stream: success status=200
```

Evidence:

```text
docs/evidence/photo-pickup-local-smoke-20260607.md
```

---

## Task 2: Fix Public Test Server API Routing

**Files:**
- Server config only, no repo code expected
- Evidence: `D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\evidence\photo-pickup-public-api-routing-20260607.md`

- [x] **Step 1: Reproduce the public routing failure**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\photo-pickup-smoke.ps1 -BaseUrl http://47.94.157.55:8080 -Phone 13800003333 -AccessCode PICK-202606-001 -AlbumId 903001
```

Expected before fix:

```text
received HTML page instead of JSON; check BaseUrl API prefix or reverse proxy
```

Observed:

```text
47.94.157.55:8080 is the Lsky PHP/Caddy entry.
/client/photo/*, /prod-api/client/photo/*, and /api/client/photo/* all return 404.
```

- [x] **Step 1.5: Confirm root cause**

SSH read-only checks on `aliyun-lsky` show:

```text
:8080 -> Caddy -> /var/www/photo.evanshine.me/public
no Java / Spring Boot process
no Docker container
running services: Caddy + PHP-FPM + MariaDB
```

Evidence:

```text
docs/evidence/photo-pickup-public-api-routing-20260607.md
```

- [ ] **Step 2: Confirm which public prefix should reach Spring Boot**

Run:

```powershell
Invoke-WebRequest -Method Post -Uri "http://47.94.157.55:8080/client/photo/auth/verify" -ContentType "application/json" -Body '{"phone":"13800003333","accessCode":"PICK-202606-001"}' | Select-Object -ExpandProperty Content
```

Expected after routing fix:

```json
{"code":200,"msg":"操作成功","data":{"clientToken":"..."}}
```

The token value must not be copied into docs or chat.

- [ ] **Step 3: Adjust the server reverse proxy**

On the server that owns `47.94.157.55:8080`, route these API prefixes to Spring Boot instead of the static frontend:

```text
/client/photo/
/yy/
/resource/
/api/douyin/life/
/prod-api/
```

Expected:

```text
Frontend routes still serve the admin/H5 page.
API routes return JSON from Spring Boot.
```

- [ ] **Step 4: Re-run public smoke**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\photo-pickup-smoke.ps1 -BaseUrl http://47.94.157.55:8080 -Phone 13800003333 -AccessCode PICK-202606-001 -AlbumId 903001
```

Expected:

```text
auth: success
albums: success
detail: success
preview-url: success
stream: success
```

- [ ] **Step 5: Save routing evidence**

Create `docs/evidence/photo-pickup-public-api-routing-20260607.md` with:

```text
BaseUrl: http://47.94.157.55:8080
auth: success
albums: success
detail: success
preview-url: success
stream: success
proxy result: /client/photo/* returns JSON, not frontend HTML
```

Do not include tokens, signed URLs, cookies, or server passwords.

---

## Task 3: Apply Photo Asset Database Guards on Test Database

**Files:**
- Use: `D:\OtherProject\CameraApp\yingyue-cloud-repo\backend\script\sql\postgres\postgres_yy_photo_private_oss_migration_20260606.sql`
- Use: `D:\OtherProject\CameraApp\yingyue-cloud-repo\backend\script\sql\postgres\postgres_yy_photo_asset_object_key_guard_20260607.sql`
- Optional evidence: `D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\evidence\photo-asset-db-guard-20260607.md`

- [x] **Step 1: Confirm target DB type**

Run on the actual test DB host:

```sql
select version();
```

Expected:

```text
PostgreSQL version is returned.
```

Observed:

```text
PostgreSQL 16.14 on yy-postgres
```

- [x] **Step 2: Apply private OSS migration**

Run:

```powershell
psql "<connection string>" -f "D:\OtherProject\CameraApp\yingyue-cloud-repo\backend\script\sql\postgres\postgres_yy_photo_private_oss_migration_20260606.sql"
```

Expected:

```text
No SQL error.
yy_photo_album and yy_photo_asset private OSS fields exist.
```

Observed:

```text
script executed successfully; existing columns skipped; 2 old visible blank object_key rows hidden
```

- [x] **Step 3: Apply object key guard migration**

Run:

```powershell
psql "<connection string>" -f "D:\OtherProject\CameraApp\yingyue-cloud-repo\backend\script\sql\postgres\postgres_yy_photo_asset_object_key_guard_20260607.sql"
```

Expected:

```text
No SQL error.
visible active assets cannot have blank object_key.
active duplicate object_key in the same tenant + album is blocked.
```

Observed:

```text
script executed successfully; unique index already existed; check constraint exists
```

- [x] **Step 4: Verify constraints**

Run:

```sql
select count(*)
from yy_photo_asset
where del_flag = '0'
  and visible = '1'
  and (object_key is null or btrim(object_key) = '');
```

Expected:

```text
0
```

Run:

```sql
select tenant_id, album_id, object_key, count(*)
from yy_photo_asset
where del_flag = '0'
  and object_key is not null
  and btrim(object_key) <> ''
group by tenant_id, album_id, object_key
having count(*) > 1;
```

Expected:

```text
0 rows
```

Observed:

```text
visible active blank object_key count: 0
duplicate active object_key count: 0
constraint: ck_yy_photo_asset_visible_object_key
index: uk_yy_photo_asset_album_object_key_active
post-migration smoke: success assetCount=2
```

Evidence:

```text
docs/evidence/photo-asset-db-guard-20260607.md
```

---

## Task 4: Verify Admin Upload to Private OSS

**Files:**
- Verify UI: `D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui\src\views\yy\photo\index.vue`
- Verify API: `D:\OtherProject\CameraApp\yingyue-cloud-repo\backend\ruoyi-modules\ruoyi-yy\src\main\java\org\dromara\yy\service\impl\YyPhotoAssetServiceImpl.java`
- Evidence: `D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\evidence\photo-admin-upload-20260607.md`

- [ ] **Step 1: Open admin photo album page**

Use the admin site and go to:

```text
客片选片 / 相册管理
```

Expected:

```text
Album list is visible.
Each album row has an "上传照片" action.
```

- [ ] **Step 2: Upload two real images**

Use one test album and upload two image files.

Expected:

```text
Upload succeeds through /resource/oss/upload.
Two yy_photo_asset rows are created.
visible = 1
is_selected = 0
object_key is not blank
```

- [ ] **Step 3: Verify no duplicate asset is created**

Upload the same OSS object or repeat the same returned `ossId/objectKey` through the UI flow.

Expected:

```text
Backend rejects duplicate active object_key in the same album, or frontend reports the existing asset clearly.
```

- [ ] **Step 4: Verify admin build still passes**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run build:dev
```

Expected:

```text
✓ built
```

---

## Task 5: Verify Private OSS Access Rules

**Files:**
- Evidence: `D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\evidence\photo-pickup-oss-private-20260607.md`

- [ ] **Step 1: Confirm OSS bucket policy**

In Aliyun OSS console confirm:

```text
阻止公共访问：开启
读写权限：私有
```

Expected:

```text
Bucket cannot be read anonymously.
```

- [x] **Step 2: Verify bare OSS URL is blocked**

Open a raw OSS object URL without a signature.

Expected:

```text
HTTP 403 or AccessDenied
```

Observed:

```text
two visible OSS object URLs returned 403 without signature
```

- [x] **Step 3: Verify backend stream works**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\photo-pickup-smoke.ps1 -BaseUrl http://127.0.0.1:8080 -Phone 13800003333 -AccessCode PICK-202606-001 -AlbumId 903001
```

Expected:

```text
stream: success status=200
contentType starts with image/
```

Observed:

```text
stream: success status=200, contentType=image/png
```

- [x] **Step 4: Save OSS evidence**

Create `docs/evidence/photo-pickup-oss-private-20260607.md` with:

```text
OSS public access: blocked
backend stream: success
preview signed URL: success
token in URL: no
```

Do not include AccessKey, Secret, signed URLs, or tokens.

Evidence:

```text
docs/evidence/photo-pickup-oss-private-20260607.md
```

---

## Task 6: H5 Customer Pickup Browser Regression

**Files:**
- Verify: `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\src\pages\pickup\login\index.vue`
- Verify: `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\src\pages\pickup\albums\index.vue`
- Verify: `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\src\pages\pickup\detail\index.vue`
- Verify: `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\src\pages\pickup\preview\index.vue`
- Verify: `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\src\api\clientPhoto.ts`

- [x] **Step 1: Start H5 dev server**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm run dev:h5
```

Expected:

```text
Local H5 URL is available at http://127.0.0.1:5174/#/
```

- [x] **Step 2: Login**

Use:

```text
手机号：13800003333
取片码：PICK-202606-001
```

Expected:

```text
Login succeeds and enters album list.
```

- [x] **Step 3: Detail page**

Open:

```text
http://127.0.0.1:5174/#/pages/pickup/detail/index?albumId=903001
```

Expected:

```text
Only visible assets with objectKey are shown.
No stale four-image demo issue.
Image card click uses string assetId with no JS precision loss.
```

- [x] **Step 4: Preview and download**

Open a real asset preview page.

Expected:

```text
Preview loads.
Download original works.
Browser URL does not contain client_token.
401/403 redirects to login and returns to original page after login.
```

Observed:

```text
login success
detail shows 2 assets
preview image natural size 1500x2272
download button shows 下载已开始
URL does not contain client_token
```

Evidence:

```text
docs/evidence/photo-pickup-h5-browser-20260607.md
```

- [x] **Step 5: H5 build**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm run typecheck
npm run build:h5
```

Expected:

```text
typecheck passes
build:h5 passes
```

Observed:

```text
npm run typecheck passed
npm run build:h5 passed
```

---

## Task 7: WeChat Mini Program Readiness

**Files:**
- Verify: `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\src\manifest.json`
- Verify: `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\src\api\clientPhoto.ts`
- Update if behavior changes: `docs\yiyue\wechatapp\README.md`
- Update if behavior changes: `docs\yiyue\wechatapp\code-map.md`
- Update if behavior changes: `docs\yiyue\wechatapp\feature-map.md`
- Update if behavior changes: `docs\yiyue\wechatapp\optimization-map.md`

- [x] **Step 1: Build WeChat mini program**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm run build:mp-weixin
```

Expected:

```text
dist/build/mp-weixin exists
build passes
```

Observed:

```text
npm run build:mp-weixin passed
output: dist\build\mp-weixin
```

- [ ] **Step 2: Configure legal domains**

In WeChat mini program backend configure:

```text
request合法域名: production API domain
downloadFile合法域名: production API domain
```

Expected:

```text
Customer pickup uses backend /stream as the stable download domain.
OSS signed domain is not required for MVP.
```

- [ ] **Step 3: Import build output**

Use WeChat DevTools and import:

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-weixin
```

Expected:

```text
Phone + pickup code login works.
Album list works.
Preview works through backend stream.
```

- [ ] **Step 4: Update WeChat maps**

Update the desktop WeChat map files with:

```text
入口页
构建命令
导入路径
MVP 登录方式：手机号 + 取片码
P1：微信手机号授权
合法域名要求
图片下载走后端 stream
```

Do not include AppSecret, token, AccessKey, or customer phone data.

---

## Task 8: Douyin Mini Program Readiness

**Files:**
- Verify: `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\src\manifest.json`
- Verify: `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\src\api\clientPhoto.ts`
- Update if behavior changes: `docs\yiyue\douyinapp\README.md`
- Update if behavior changes: `docs\yiyue\douyinapp\code-map.md`
- Update if behavior changes: `docs\yiyue\douyinapp\feature-map.md`
- Update if behavior changes: `docs\yiyue\douyinapp\optimization-map.md`

- [x] **Step 1: Build Douyin/Toutiao mini program**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm run build:mp-toutiao
```

Expected:

```text
dist/build/mp-toutiao exists
build passes
```

Observed:

```text
npm run build:mp-toutiao passed
output: dist\build\mp-toutiao
```

Evidence:

```text
docs/evidence/photo-pickup-mobile-builds-20260607.md
```

- [ ] **Step 2: Configure Douyin mini app domains**

In Douyin mini app backend configure:

```text
request domain: production API domain
download domain: production API domain
```

Expected:

```text
Photo preview/download can use /client/photo/assets/{assetId}/stream.
```

- [ ] **Step 3: Import build output**

Use Douyin DevTools and import:

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao
```

Expected:

```text
Phone + pickup code login works.
Album list works.
Preview works through backend stream.
```

- [ ] **Step 4: Update Douyin mini app maps**

Update the desktop Douyin mini app map files with:

```text
入口页
构建命令
导入路径
MVP 登录方式：手机号 + 取片码
P1：抖音手机号授权
合法域名要求
图片下载走后端 stream
```

Do not mix this with DOUYIN_LIFE SPI callback maps.

---

## Task 9: DOUYIN_LIFE Production SPI Routing and Safety

**Files:**
- Verify controller: `D:\OtherProject\CameraApp\yingyue-cloud-repo\backend\ruoyi-modules\ruoyi-yy\src\main\java\org\dromara\yy\controller\YyDouyinLifeSpiController.java`
- Verify adapter: `D:\OtherProject\CameraApp\yingyue-cloud-repo\backend\ruoyi-modules\ruoyi-yy\src\main\java\org\dromara\yy\channel\douyin\DouyinLifeChannelAdapter.java`
- Reference: `docs\yiyue\callback_map.md`
- Reference: `docs\yiyue\liucheng_map.md`

- [ ] **Step 1: Confirm production environment variables**

On production server set:

```text
YY_CLIENT_PHOTO_TOKEN_SECRET=<strong random secret>
DOUYIN_LIFE_REQUIRE_SIGNATURE=true
DOUYIN_LIFE_REFUND_APPLY_MODE=processing
```

Expected:

```text
Photo tokens use a strong secret.
Douyin SPI rejects invalid signatures.
Refund apply defaults to processing, not auto-agree.
```

- [ ] **Step 2: Route `/api/douyin/life/*` to Spring Boot**

Ensure these paths reach Spring Boot, not the temporary Python SPI:

```text
/api/douyin/life/tripartite-code/create
/api/douyin/life/refund/apply
/api/douyin/life/refund/notify
/api/douyin/life/order/query
/api/douyin/life/reservation/stock-query
/api/douyin/life/reservation/order-create
/api/douyin/life/reservation/pay-notify
```

Expected:

```text
Spring Boot returns Douyin raw JSON shape.
No RuoYi R.ok wrapper is returned to Douyin SPI.
```

- [ ] **Step 3: Verify signature mode**

Send a missing-signature probe to a DOUYIN_LIFE SPI URL in production.

Expected:

```text
Request is rejected with Douyin-compatible JSON.
No order, voucher, or refund state is mutated.
```

- [ ] **Step 4: Verify refund apply mode**

For production default mode:

```text
DOUYIN_LIFE_REFUND_APPLY_MODE=processing
```

Expected response shape:

```json
{
  "data": {
    "error_code": 0,
    "description": "success",
    "result": 0
  }
}
```

Use `agree` or `reject` only during explicit platform test cases.

---

## Task 10: DOUYIN_LIFE Acceptance Evidence

**Files:**
- Reference: `docs\yiyue\callback_map.md`
- Reference: `docs\yiyue\liucheng_map.md`
- Optional evidence: `D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\evidence\douyin-life-acceptance-20260607.md`

- [ ] **Step 1: Reconfirm callback URLs**

Use these official callback URLs:

```text
发券 SPI: https://yingyueyun.evanshine.me/api/douyin/life/tripartite-code/create
退款申请 SPI: https://yingyueyun.evanshine.me/api/douyin/life/refund/apply
退款信息同步 SPI: https://yingyueyun.evanshine.me/api/douyin/life/refund/notify
服务商订单查询 SPI: https://yingyueyun.evanshine.me/api/douyin/life/order/query
预约库存 SPI: https://yingyueyun.evanshine.me/api/douyin/life/reservation/stock-query
预约创单 SPI: https://yingyueyun.evanshine.me/api/douyin/life/reservation/order-create
预约支付通知 SPI: https://yingyueyun.evanshine.me/api/douyin/life/reservation/pay-notify
```

- [ ] **Step 2: Run OpenAPI smoke through whitelisted exit**

Run from the environment that exits as `103.24.216.8`:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\run-douyin-life-current-order.ps1
```

Expected:

```text
client_token: success
no IP whitelist error
OpenAPI logid is captured from extra.logid or logid
```

- [ ] **Step 3: Capture SPI logid correctly**

Rules:

```text
SPI logid = request header X-Bytedance-Logid
OpenAPI logid = response extra.logid or response logid
Never use order_id, product_id, account_id, or certificate_id as logid.
```

Expected:

```text
All accepted test cases have the right logid source recorded in yy_channel_sync_log.
```

- [ ] **Step 4: Update acceptance evidence**

Create or update `docs/evidence/douyin-life-acceptance-20260607.md` with:

```text
test case name
callback URL
logid source type
logid value
result
operator note
```

Do not include secrets, raw access tokens, or full customer phone numbers.

---

## Task 11: Final Regression and PR Closeout

**Files:**
- No code changes expected unless tests fail

- [x] **Step 1: Backend targeted tests**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyPhotoAssetServiceImplTest,YyClientPhotoServiceImplTest,YyClientPhotoControllerTest,DouyinLifeChannelAdapterTest,DouyinOpenApiClientTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
```

Expected:

```text
BUILD SUCCESS
39 tests
0 failures
```

- [x] **Step 2: Backend package**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-admin -am -DskipTests package
```

Expected:

```text
BUILD SUCCESS
```

Observed:

```text
mvn -pl ruoyi-admin -am -DskipTests package passed
BUILD SUCCESS
```

Observed:

```text
BUILD SUCCESS
Tests run: 39, Failures: 0, Errors: 0, Skipped: 0
```

- [x] **Step 3: Admin build**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run build:dev
```

Expected:

```text
✓ built
```

Observed:

```text
npm run build:dev passed
✓ built
```

- [x] **Step 4: Mobile builds**

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
All commands pass.
```

Observed:

```text
npm run typecheck passed
npm run build:h5 passed
npm run build:mp-weixin passed
npm run build:mp-toutiao passed
```

Evidence:

```text
docs/evidence/photo-pickup-regression-20260607.md
docs/evidence/photo-pickup-mobile-builds-20260607.md
```

- [ ] **Step 5: Update PR body**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
gh pr view 1
```

Then update the PR body with:

```text
backend tests result
backend package result
admin build result
mobile build result
local smoke result
public smoke result
OSS private evidence path
DOUYIN_LIFE acceptance state
remaining external platform tasks
```

Expected:

```text
PR clearly tells what is code-complete and what still depends on server/platform configuration.
```

---

## Multi-Agent Execution Split

Use three agents only when executing, not while merely reading the plan:

```text
Agent A: Backend and server routing
- Restore local backend
- Fix public API proxy
- Run backend/package/smoke

Agent B: Admin/H5/miniapp
- Verify admin upload
- Verify H5 browser flow
- Build mp-weixin and mp-toutiao
- Update wechatapp/douyinapp maps

Agent C: OSS/DOUYIN_LIFE/evidence
- Verify OSS private access
- Confirm DOUYIN_LIFE SPI routing and signature mode
- Collect logid evidence
- Update PR/evidence docs
```

Expected merge rule:

```text
Each agent reports commands, outputs, changed files, and remaining blockers.
Only the coordinator commits with precise git add -- <paths>.
```

---

## Done Criteria

This plan is complete when all of these are true:

- Local backend restarted and photo pickup smoke passes.
- Public `47.94.157.55:8080` or chosen test domain returns JSON for `/client/photo/*`.
- Test DB has private OSS/object key guard migrations applied.
- Admin upload creates real `yy_photo_asset` rows with nonblank `object_key`.
- Bare OSS URL is blocked.
- Backend stream and preview access work with valid `X-Client-Token`.
- H5 login/detail/preview/download pass in browser.
- `mp-weixin` and `mp-toutiao` builds pass.
- WeChat and Douyin miniapp maps are accurate.
- DOUYIN_LIFE production SPI routes to Spring Boot.
- `DOUYIN_LIFE_REQUIRE_SIGNATURE=true` is enabled in production.
- `DOUYIN_LIFE_REFUND_APPLY_MODE=processing` is production default.
- DOUYIN_LIFE acceptance logids are recorded from the correct source.
- PR body is updated with verification evidence and external blockers.
