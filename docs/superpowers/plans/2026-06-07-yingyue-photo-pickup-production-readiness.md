# Yingyue Photo Pickup Production Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the 影约云客户取片 closed loop so admin upload, private OSS, H5 pickup, WeChat mini program, Douyin mini program, and Douyin Life acceptance can be verified and shipped with clear evidence.

**Architecture:** Keep RuoYi-Vue-Plus as the business backend and admin console. Keep OSS private; clients only access images through backend authorization and short-lived signed URLs or `/client/photo/assets/{assetId}/stream`. Keep `DOUYIN_LIFE` as the Douyin Life business channel and do not mix it with the generic `DOUYIN` app line.

**Tech Stack:** Spring Boot / RuoYi-Vue-Plus, MyBatis-Plus, PostgreSQL primary scripts plus MySQL compatibility scripts, Vue 3 / Element Plus admin UI, uni-app H5 / `mp-weixin` / `mp-toutiao`, Aliyun OSS, Douyin Life OpenAPI/SPI.

---

## Current State

- Branch: `yingyue-closed-loop-optimization-20260603`
- PR: `https://github.com/dengzhekun/yingyue-cloud/pull/1`
- Repository visibility: private
- Main repo: `D:\OtherProject\CameraApp\yingyue-cloud-repo`
- Current uncommitted code changes:
  - `admin-ui/src/views/yy/photo/index.vue`: admin form requires `objectKey`
  - `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/bo/YyPhotoAssetBo.java`: backend BO requires `objectKey`
- Already verified for current uncommitted changes:
  - `mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyPhotoAssetServiceImplTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test`
  - `npm run build:dev`
- Already completed in previous commits:
  - Douyin refund SPI defaults to `processing`, not auto-allow
  - Production SPI signature guard exists
  - customer photo token no longer supports URL query fallback
  - client photo IDs are strings
  - H5/miniapp download uses authenticated stream path
  - H5, WeChat miniapp, Douyin miniapp builds passed

---

## Task 0: Commit Current Object Key Validation

**Files:**
- Modify already done: `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/bo/YyPhotoAssetBo.java`
- Modify already done: `admin-ui/src/views/yy/photo/index.vue`

- [ ] **Step 1: Confirm only expected files are dirty**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
git status --short --branch
git diff --stat
git diff --check
```

Expected:

```text
 M admin-ui/src/views/yy/photo/index.vue
 M backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/bo/YyPhotoAssetBo.java
```

`git diff --check` may show LF/CRLF warnings only; it must not show whitespace errors.

- [ ] **Step 2: Re-run targeted verification**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyPhotoAssetServiceImplTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
```

Expected:

```text
BUILD SUCCESS
Tests run: 3, Failures: 0, Errors: 0
```

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run build:dev
```

Expected:

```text
✓ built
```

- [ ] **Step 3: Commit and push only these two files**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
git add -- backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/bo/YyPhotoAssetBo.java admin-ui/src/views/yy/photo/index.vue
git commit -m "fix: require photo asset object key in forms"
git push
```

Expected: branch pushes to `origin/yingyue-closed-loop-optimization-20260603`.

---

## Task 1: Add Database-Level Object Key Protection

**Files:**
- Modify: `backend/script/sql/postgres/postgres_yy_photo_private_oss_migration_20260606.sql`
- Modify: `backend/script/sql/postgres/postgres_yy_cloud.sql`
- Modify: `backend/script/sql/yy_cloud.sql`
- Create: `backend/script/sql/postgres/postgres_yy_photo_asset_object_key_guard_20260607.sql`
- Create: `backend/script/sql/yy_photo_asset_object_key_guard_20260607.sql`

- [ ] **Step 1: Add PostgreSQL migration**

Create `backend/script/sql/postgres/postgres_yy_photo_asset_object_key_guard_20260607.sql` with:

```sql
-- 影约云底片 OSS object_key 安全约束
-- 执行前先确认无重复 active object_key。

update yy_photo_asset
set visible = '0'
where del_flag = '0'
  and visible = '1'
  and (object_key is null or btrim(object_key) = '');

create unique index if not exists uk_yy_photo_asset_album_object_key_active
    on yy_photo_asset (tenant_id, album_id, object_key)
    where del_flag = '0' and object_key is not null and btrim(object_key) <> '';

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'ck_yy_photo_asset_visible_object_key'
    ) then
        alter table yy_photo_asset
            add constraint ck_yy_photo_asset_visible_object_key
            check (del_flag = '1' or visible <> '1' or btrim(coalesce(object_key, '')) <> '');
    end if;
end $$;
```

- [ ] **Step 2: Add MySQL migration**

Create `backend/script/sql/yy_photo_asset_object_key_guard_20260607.sql` with:

```sql
-- 影约云底片 OSS object_key 安全约束
-- MySQL 8 推荐执行。执行前先确认无重复 active object_key。

update yy_photo_asset
set visible = '0'
where del_flag = '0'
  and visible = '1'
  and (object_key is null or trim(object_key) = '');

alter table yy_photo_asset
    add column object_key_active varchar(500)
    generated always as (
        case
            when del_flag = '0' and object_key is not null and trim(object_key) <> ''
            then object_key
            else null
        end
    ) stored;

create unique index uk_yy_photo_asset_album_object_key_active
    on yy_photo_asset (tenant_id, album_id, object_key_active);
```

- [ ] **Step 3: Update base table scripts**

In `backend/script/sql/postgres/postgres_yy_cloud.sql`, change `yy_photo_asset.object_key` to keep the column but add the partial unique index after table creation:

```sql
create unique index if not exists uk_yy_photo_asset_album_object_key_active
    on yy_photo_asset (tenant_id, album_id, object_key)
    where del_flag = '0' and object_key is not null and btrim(object_key) <> '';
```

In `backend/script/sql/yy_cloud.sql`, add the generated column and unique index to the MySQL version:

```sql
object_key_active varchar(500)
    generated always as (
        case
            when del_flag = '0' and object_key is not null and trim(object_key) <> ''
            then object_key
            else null
        end
    ) stored,
unique key uk_yy_photo_asset_album_object_key_active (tenant_id, album_id, object_key_active)
```

- [ ] **Step 4: Verify duplicate service behavior still passes**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyPhotoAssetServiceImplTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
```

Expected:

```text
BUILD SUCCESS
```

- [ ] **Step 5: Commit**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
git add -- backend/script/sql/postgres/postgres_yy_photo_private_oss_migration_20260606.sql backend/script/sql/postgres/postgres_yy_cloud.sql backend/script/sql/yy_cloud.sql backend/script/sql/postgres/postgres_yy_photo_asset_object_key_guard_20260607.sql backend/script/sql/yy_photo_asset_object_key_guard_20260607.sql
git commit -m "fix: guard photo asset object keys at database level"
git push
```

---

## Task 2: Harden Admin Upload Flow

**Files:**
- Modify: `admin-ui/src/views/yy/photo/index.vue`
- Modify if needed: `admin-ui/src/api/yy/photoAsset/index.ts`
- Modify if needed: `admin-ui/src/api/yy/photoAsset/types.ts`
- Test: `admin-ui` build

- [ ] **Step 1: Replace count-based upload sort with max-sort behavior**

Current behavior uses the current asset count as the next sort value. Change it so upload starts from the max existing `sort + 1`. If the API cannot sort by `sort desc`, keep the current count fallback.

Expected behavior:

```text
existing sorts: 0, 1, 8
new uploads sort: 9, 10, 11
```

- [ ] **Step 2: Improve duplicate upload user message**

When backend rejects duplicate `objectKey`, show the uploaded file name and backend reason in the upload result table:

```text
IMG_001.jpg：同一相册已存在该 OSS 对象
```

- [ ] **Step 3: Make permission requirement explicit**

Keep button permission as:

```text
yy:photoAsset:add
```

Document that the operator role also needs:

```text
system:oss:upload
system:oss:query
```

Do not bypass `/resource/oss/upload` permission in frontend.

- [ ] **Step 4: Verify admin build**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run build:dev
```

Expected:

```text
✓ built
```

- [ ] **Step 5: Commit**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
git add -- admin-ui/src/views/yy/photo/index.vue admin-ui/src/api/yy/photoAsset/index.ts admin-ui/src/api/yy/photoAsset/types.ts
git commit -m "fix: improve photo upload ordering and errors"
git push
```

If API files did not change, remove them from `git add`.

---

## Task 3: Add Photo Pickup Smoke Script

**Files:**
- Create: `tools/photo-pickup-smoke.ps1`
- Document: `docs/photo-pickup-smoke.md`

- [ ] **Step 1: Create a local smoke script**

The script should accept:

```powershell
.\tools\photo-pickup-smoke.ps1 -BaseUrl http://47.94.157.55:8080 -Phone 13800003333 -AccessCode PICK-202606-001 -AlbumId 903001
```

It must verify:

```text
POST /client/photo/auth/verify returns client_token
GET /client/photo/albums returns albums
GET /client/photo/albums/{albumId} returns visible assets only
GET /client/photo/assets/{assetId}/preview-url returns url/expiresAt/fileName/contentType
GET /client/photo/assets/{assetId}/stream returns 200 with X-Client-Token
```

It must not print full token values. Print only token length and first/last 4 characters.

- [ ] **Step 2: Run smoke against local or test backend**

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

- [ ] **Step 3: Commit**

Run:

```powershell
git add -- tools/photo-pickup-smoke.ps1 docs/photo-pickup-smoke.md
git commit -m "test: add photo pickup smoke script"
git push
```

---

## Task 4: Verify Private OSS Behavior End-to-End

**Files:**
- No required code change unless smoke exposes a defect
- Evidence target: `docs/evidence/photo-pickup-oss-private-20260607.md`

- [ ] **Step 1: Confirm OSS bucket policy**

In Aliyun OSS console:

```text
阻止公共访问：开启
读写权限：私有
```

Record bucket region and endpoint without access keys.

- [ ] **Step 2: Upload from admin**

Open admin:

```text
http://47.94.157.55:8080
```

Use:

```text
客片选片 / 相册管理 -> 上传照片
```

Expected database row:

```text
albumId = current album
storeId = current store
visible = 1
isSelected = 0
objectKey = sys_oss.file_name
fileUrl = backend/admin preview url
```

- [ ] **Step 3: Verify bare OSS is blocked**

Use the uploaded file's OSS bare URL from `fileUrl` or OSS console.

Expected:

```text
HTTP 403 or AccessDenied
```

- [ ] **Step 4: Verify signed/stream access works**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\photo-pickup-smoke.ps1 -BaseUrl http://47.94.157.55:8080 -Phone 13800003333 -AccessCode PICK-202606-001 -AlbumId 903001
```

Expected:

```text
preview-url: success
stream: success
```

- [ ] **Step 5: Save evidence**

Create `docs/evidence/photo-pickup-oss-private-20260607.md` with:

```text
OSS public access: blocked
client auth: success
album detail visible asset count: N
preview-url: success
stream: success
```

Do not include OSS secrets or client token.

---

## Task 5: Verify H5 Pickup Flow in Browser

**Files:**
- Modify only if defects are found:
  - `mobile-uniapp/src/pages/pickup/login/index.vue`
  - `mobile-uniapp/src/pages/pickup/albums/index.vue`
  - `mobile-uniapp/src/pages/pickup/detail/index.vue`
  - `mobile-uniapp/src/pages/pickup/preview/index.vue`
  - `mobile-uniapp/src/api/clientPhoto.ts`
  - `mobile-uniapp/src/api/request.ts`
  - `mobile-uniapp/src/utils/auth.ts`

- [ ] **Step 1: Start/confirm H5 dev server**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm run dev:h5
```

Expected local URL:

```text
http://127.0.0.1:5174/#/
```

- [ ] **Step 2: Login test**

Use:

```text
手机号：13800003333
取片码：PICK-202606-001
```

Expected:

```text
login success -> albums page
```

- [ ] **Step 3: Album detail test**

Open:

```text
http://127.0.0.1:5174/#/pages/pickup/detail/index?albumId=903001
```

Expected:

```text
Only visible assets with objectKey are shown.
No four-card stale demo issue.
No precision loss in assetId.
```

- [ ] **Step 4: Preview/download test**

Open a real asset:

```text
http://127.0.0.1:5174/#/pages/pickup/preview/index?albumId=903001&assetId=<string asset id>
```

Expected:

```text
Preview loads.
Download original starts.
Browser URL does not contain client_token.
401/403 clears token and redirects back to login with redirect.
```

- [ ] **Step 5: Build H5**

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

---

## Task 6: Verify WeChat and Douyin Mini Program Builds

**Files:**
- Modify if needed: `mobile-uniapp/src/manifest.json`
- Modify if needed: `mobile-uniapp/src/api/clientPhoto.ts`
- Modify if needed: `mobile-uniapp/src/pages/pickup/preview/index.vue`
- Desktop maps:
  - `C:\Users\Administrator\Desktop\yiyue\wechatapp\README.md`
  - `C:\Users\Administrator\Desktop\yiyue\wechatapp\code-map.md`
  - `C:\Users\Administrator\Desktop\yiyue\wechatapp\feature-map.md`
  - `C:\Users\Administrator\Desktop\yiyue\wechatapp\optimization-map.md`
  - `C:\Users\Administrator\Desktop\yiyue\douyinapp\README.md`
  - `C:\Users\Administrator\Desktop\yiyue\douyinapp\code-map.md`
  - `C:\Users\Administrator\Desktop\yiyue\douyinapp\feature-map.md`
  - `C:\Users\Administrator\Desktop\yiyue\douyinapp\optimization-map.md`

- [ ] **Step 1: Build WeChat**

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

- [ ] **Step 2: Build Douyin/Toutiao**

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

- [ ] **Step 3: Configure platform domains before real-device test**

WeChat and Douyin mini programs need these domains:

```text
request domain: https://api.evanshine.me or production API domain
downloadFile domain: backend stream domain, preferred same API domain
uploadFile domain: not needed for customer pickup MVP
```

If OSS signed URL domain is rejected by platform domain rules, use only:

```text
GET /client/photo/assets/{assetId}/stream
X-Client-Token: <token>
```

- [ ] **Step 4: Update desktop maps**

Update both `wechatapp` and `douyinapp` map folders with:

```text
entry page
build command
dist import path
MVP login method: phone + pickup code
future phone authorization boundary
API domain requirements
download fallback: backend stream
```

Do not put secrets in these files.

---

## Task 7: Production Backend Deployment Readiness

**Files:**
- Verify: `backend/.env.local` locally only, never commit
- Verify server config manually
- Optional docs: `docs/deploy/photo-pickup-production-checklist.md`

- [ ] **Step 1: Required production environment variables**

Set on the server, not in Git:

```text
YY_CLIENT_PHOTO_TOKEN_SECRET=<strong random secret>
DOUYIN_LIFE_REQUIRE_SIGNATURE=true
DOUYIN_LIFE_REFUND_APPLY_MODE=processing
```

Expected:

```text
default token secret is rejected in production
Douyin SPI requires signature
refund apply returns processing unless explicitly configured
```

- [ ] **Step 2: Apply SQL migrations**

Run PostgreSQL migrations in this order:

```text
postgres_yy_photo_private_oss_migration_20260606.sql
postgres_yy_photo_asset_object_key_guard_20260607.sql
```

Expected:

```text
yy_photo_asset has object_key fields
visible assets cannot have blank object_key
active duplicate object_key in same album is blocked
```

- [ ] **Step 3: Ensure public reverse proxy targets Spring Boot**

For production, `/api/douyin/life/*` should route to Spring Boot, not the temporary Python SPI service.

Expected:

```text
https://yingyueyun.evanshine.me/api/douyin/life/tripartite-code/create
https://yingyueyun.evanshine.me/api/douyin/life/refund/apply
https://yingyueyun.evanshine.me/api/douyin/life/refund/notify
```

all hit Spring Boot controller `YyDouyinLifeSpiController`.

- [ ] **Step 4: Smoke backend**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-admin -am -DskipTests package
```

Expected:

```text
BUILD SUCCESS
```

---

## Task 8: Douyin Life Acceptance Follow-Up

**Files:**
- Reference: `C:\Users\Administrator\Desktop\yiyue\callback_map.md`
- Reference: `C:\Users\Administrator\Desktop\yiyue\api_map.md`
- Reference: `C:\Users\Administrator\Desktop\yiyue\liucheng_map.md`
- Modify if defects found:
  - `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyDouyinLifeSpiController.java`
  - `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/channel/douyin/DouyinLifeChannelAdapter.java`
  - `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/channel/douyin/DouyinOpenApiClient.java`
  - `tools/run-douyin-life-current-order.ps1`

- [ ] **Step 1: Reconfirm callback URLs**

Use these for current core SPI:

```text
发券 SPI: https://yingyueyun.evanshine.me/api/douyin/life/tripartite-code/create
退款申请 SPI: https://yingyueyun.evanshine.me/api/douyin/life/refund/apply
退款信息同步 SPI: https://yingyueyun.evanshine.me/api/douyin/life/refund/notify
服务商订单查询 SPI: https://yingyueyun.evanshine.me/api/douyin/life/order/query
预约库存 SPI: https://yingyueyun.evanshine.me/api/douyin/life/reservation/stock-query
预约创单 SPI: https://yingyueyun.evanshine.me/api/douyin/life/reservation/order-create
预约支付通知 SPI: https://yingyueyun.evanshine.me/api/douyin/life/reservation/pay-notify
```

- [ ] **Step 2: Run current order smoke through whitelisted exit**

Run from the environment that exits as `103.24.216.8`:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\run-douyin-life-current-order.ps1
```

Expected:

```text
client_token: success
order query: no IP whitelist error
OpenAPI logid printed
```

- [ ] **Step 3: Validate refund modes**

Production default:

```text
DOUYIN_LIFE_REFUND_APPLY_MODE=processing
```

Expected response:

```json
{
  "data": {
    "error_code": 0,
    "description": "success",
    "result": 0
  }
}
```

Only use `agree` or `reject` mode for explicit test cases.

- [ ] **Step 4: Collect acceptance logids**

Rules:

```text
SPI logid = request header X-Bytedance-Logid
OpenAPI logid = response extra.logid or logid
Do not use order id, product id, account id as logid
```

Record results in `yy_channel_sync_log` and admin UI before filling the platform.

---

## Task 9: Final Regression and PR Closeout

**Files:**
- No planned code change unless verification fails

- [ ] **Step 1: Run backend targeted tests**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyPhotoAssetServiceImplTest,YyClientPhotoServiceImplTest,DouyinLifeChannelAdapterTest,DouyinOpenApiClientTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test
```

Expected:

```text
BUILD SUCCESS
```

- [ ] **Step 2: Run backend package**

Run:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-admin -am -DskipTests package
```

Expected:

```text
BUILD SUCCESS
```

- [ ] **Step 3: Run frontend builds**

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
all builds pass
```

- [ ] **Step 4: Update PR summary**

Use `gh`:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
gh pr view 1
```

Then update the PR body with:

```text
backend tests passed
admin build passed
mobile H5/weixin/toutiao builds passed
OSS private evidence path
Douyin Life acceptance state
remaining external platform tasks
```

Do not include secrets or raw tokens.

---

## Done Criteria

The project is considered ready for the next deployment checkpoint when all of these are true:

- Current `objectKey` validation commit is pushed.
- Database guard migration exists and has been run on test DB.
- Admin upload creates exactly one `yy_photo_asset` per OSS object per album.
- H5 can login, list albums, preview, and download without token in URL.
- WeChat and Douyin miniapp builds pass.
- OSS bare URL is blocked, backend signed/stream access works.
- Production server has strong `YY_CLIENT_PHOTO_TOKEN_SECRET`.
- Douyin production SPI signature is required.
- Douyin refund apply defaults to `processing`.
- `/api/douyin/life/*` production traffic is handled by Spring Boot.
- Desktop maps under `C:\Users\Administrator\Desktop\yiyue` are updated after behavior changes.
