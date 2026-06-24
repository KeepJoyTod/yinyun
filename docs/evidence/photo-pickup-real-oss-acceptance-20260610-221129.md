# 客户取片真实 OSS 验收证据

生成时间：2026-06-10 22:11:29

## 结论

本文件用于记录一次真实图片取片验收。命令结论只代表自动命令覆盖的部分；最终结论必须同时满足自动命令通过和人工确认 H5、微信、抖音、后台审计验收。

命令结论：

```text
PASS
```

人工确认：

```text
未确认
```

最终结论：

```text
PENDING
```

## 基础信息

| 项 | 值 |
| --- | --- |
| 环境 | https://api.evanshine.me |
| 手机号 | 13900001111 |
| 取片码 | PREVIEW-20260608 |
| 相册 ID | 990202606080001 |
| 底片 ID | 1781018145736000012 |
| OSS objectKey | photo-pickup-demo/990202606080001/20260609231447-01-retouch-cover.jpg |
| 缩略图 objectKey | <待填写> |
| OSS 裸链 | https://evanshine-photo-bj-prod.oss-cn-beijing.aliyuncs.com/photo-pickup-demo/990202606080001/20260609231447-01-retouch-cover.jpg |
| 验收人 | <待填写> |

## 一键命令

### 1. 真实 OSS 生产预检

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\yingyue-production-preflight.ps1 -BaseUrl "https://api.evanshine.me" -Phone "13900001111" -AccessCode "PREVIEW-20260608" -AlbumId "990202606080001" -AssetId "1781018145736000012" -BareOssUrl "https://evanshine-photo-bj-prod.oss-cn-beijing.aliyuncs.com/photo-pickup-demo/990202606080001/20260609231447-01-retouch-cover.jpg" -VerifyBareOssBlocked
```

预期：

```text
thumbnail-url: success
preview-url: success
download-url: success
bare-oss: blocked status=403
stream: success status=200
preflight: passed
```

实际结果：

```text
## production preflight
started: 2026-06-10 22:11:32
yingyue production preflight
baseUrl: https://api.evanshine.me
photo smoke mode: explicit
photo smoke account: 13900001111
photo smoke albumId: 990202606080001
photo pickup smoke
baseUrl: https://api.evanshine.me
photo smoke mode: explicit
auth: success (len=152, value=djF8...9NZU)
albums: success count=1
detail: success albumId=990202606080001, assetCount=4
thumbnail-url: success assetId=1781018145736000012, fileName=yingyue-demo-01-retouch-cover.jpg, contentType=image/jpeg, expiresAt=2026-06-10 22:21:33
preview-url: success assetId=1781018145736000012, fileName=yingyue-demo-01-retouch-cover.jpg, contentType=image/jpeg, expiresAt=2026-06-10 22:21:33
download-url: success assetId=1781018145736000012, fileName=yingyue-demo-01-retouch-cover.jpg, contentType=image/jpeg, expiresAt=2026-06-10 22:21:34
bare-oss: blocked status=403 url=https://evanshine-photo-bj-prod.oss-cn-beijing.aliyuncs.com/photo-pickup-demo/990202606080001/20260609231447-01-retouch-cover.jpg
stream: success status=200, contentType=image/jpeg, contentDisposition=attachment; filename="yingyue-demo-01-retouch-cover.jpg"; filename*=UTF-8''yingyue-demo-01-retouch-cover.jpg, bytes=70314
auth-json-route: success
preflight: passed
exit_code: 0
finished: 2026-06-10 22:11:37
```

### 2. 本地总验收

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\photo-pickup-local-acceptance.ps1 -BaseUrl "https://api.evanshine.me" -Phone "13900001111" -AccessCode "PREVIEW-20260608" -AlbumId "990202606080001" -AssetId "1781018145736000012" -SkipH5Browser -SkipPlatformReadiness
```

预期：

```text
mobile typecheck: passed
mobile unit tests: passed
mobile H5 build: passed
mobile WeChat mini build: passed
mobile Douyin mini build: passed
platform readiness local checks: passed
admin yy tests: passed
admin dev build: passed
photo pickup local acceptance: passed
```

实际结果：

```text
## local acceptance
started: 2026-06-10 22:11:37
photo pickup local acceptance
repoRoot: D:\OtherProject\CameraApp\yingyue-cloud-repo
baseUrl:  https://api.evanshine.me
albumId:  990202606080001
assetId:  1781018145736000012

==> mobile typecheck

> yingyue-photo-pickup-mobile@0.1.0 typecheck
> vue-tsc --noEmit

<== mobile typecheck passed in 6.6s

==> mobile unit tests

> yingyue-photo-pickup-mobile@0.1.0 test
> node --test tests/*.test.cjs

✔ empty active albums are labeled as waiting for upload (3.9508ms)
✔ albums with visible assets remain viewable for customers (0.5197ms)
✔ expired and disabled album status labels are still explicit (0.5394ms)
✔ album list empty and error states give operator-independent customer actions (7.2567ms)
✔ detail asset filters count selected pending and error photos (4.4694ms)
✔ detail asset filters return scoped asset lists (1.0012ms)
✔ detail asset filter empty copy gives customer next step (4.2554ms)
✔ detail selection sequence follows the customer selected order (0.8387ms)
✔ detail selection summary reflects draft and submitted states (24.1441ms)
✔ detail selection summary can show backend delivery workflow states (3.5368ms)
✔ detail selection timeline copy formats backend submit time (4.192ms)
✔ detail delivery next step gives customer an actionable state (2.9569ms)
✔ friend takeover maps keep production and reference project boundaries explicit (11.9472ms)
✔ friend takeover maps pin official API domain and miniapp import outputs (4.125ms)
✔ repo README points maintainers to the authoritative friend takeover entry (2.3831ms)
✔ reference project folders exist beside the production repo for map verification (1.4632ms)
✔ photo pickup smoke verifies thumbnail signed url before original preview and download (6.6084ms)
✔ photo pickup smoke can verify private OSS bare object is blocked (1.9343ms)
✔ production preflight passes private OSS verification options into photo smoke (0.9729ms)
✔ photo pickup smoke warns when public api is tested with local demo defaults (2.6549ms)
✔ photo pickup smoke has a preview account shortcut for public empty-album checks (4.6688ms)
✔ pickup login keeps customer trust cues visible (8.2019ms)
✔ pickup login explains the customer credential flow before entering albums (1.6779ms)
✔ album list shows a delivery dashboard before album cards (2.5251ms)
✔ album list empty and failed states provide clear recovery actions (3.4462ms)
✔ empty album cover looks like a delivery proof instead of a broken image (1.5637ms)
✔ album detail summary uses customer-facing delivery language (1.7032ms)
✔ album detail exposes selection status filters (1.2561ms)
✔ album detail shows selected sequence and submission state copy (1.5959ms)
✔ album detail exposes delivery proof metrics above the photo grid (1.5903ms)
✔ album detail gives an actionable next step after delivery metrics (5.5589ms)
✔ preview page explains swipe and private download behavior (2.2826ms)
✔ preview page shows file context and protected access proof (1.8515ms)
✔ result page gives diagnostic reason next step and safe pickup boundary (1.7792ms)
✔ wechat and douyin can show platform phone authorization entry (2.4847ms)
✔ phone authorization event extracts modern miniapp phone code (1.0214ms)
✔ platform login payload keeps only safe exchange fields (2.4642ms)
✔ platform phone authorization failures guide users back to pickup code (0.7579ms)
✔ login page exposes platform authorization UI without hiding pickup-code fallback (8.0477ms)
✔ platform readiness verifies miniapp build output files and project appids (3.9866ms)
✔ platform readiness prints devtools import paths and legal domain fill values (1.3163ms)
✔ local acceptance runs platform readiness after miniapp builds (1.6914ms)
✔ local acceptance includes admin album management checks (1.3508ms)
✔ preview image error clears preview url and shows retry copy (2.7915ms)
✔ preview error help text gives a customer next step (2.2869ms)
✔ preview image load marks image ready and clears error copy (0.622ms)
✔ download is disabled when preview is unavailable (0.6789ms)
✔ download failure feedback gives customer and operator next steps (3.3871ms)
✔ miniapp save failure feedback separates cancel permission and system failures (1.7298ms)
✔ customer-facing UI guards remain present in page templates (3.4946ms)
✔ detail preview signing failure moves asset into error state (0.8887ms)
✔ preview back target falls back to album detail on direct links (0.7744ms)
✔ detail preview signing batches prioritize first screen and chunk the rest (1.5646ms)
✔ album cover signing batches can use smaller first screen limits (1.4309ms)
✔ detail preview progress reports failed assets separately from prepared assets (1.71ms)
✔ real OSS evidence generator captures production photo pickup acceptance gates (9.0302ms)
✔ real OSS evidence generator captures PowerShell information stream output (1.2608ms)
✔ real OSS evidence summary verifier enforces handoff-ready JSON (3.2119ms)
✔ real OSS evidence summary verifier reports unreadable or incomplete summaries clearly (1398.911ms)
✔ real OSS evidence final pass requires preflight and local acceptance runs (633.0102ms)
✔ real OSS evidence summary verifier treats string false flags as not accepted (689.6899ms)
✔ real OSS evidence summary verifier rejects conclusion casing and whitespace drift (610.0944ms)
✔ latest real OSS evidence summary verifier gates release handoff (1.9766ms)
✔ real OSS runbooks document the latest-summary release gate (2.7763ms)
✔ photo pickup release gate requires local acceptance and real OSS final pass (2.4342ms)
✔ photo pickup release gate can report blocked status as JSON (664.3536ms)
✔ photo pickup release gate reports real OSS verifier failures as JSON (596.6291ms)
✔ photo pickup release gate reports child script exit failures as JSON (547.7834ms)
✔ photo pickup release gate treats skipped local acceptance as partial only (899.4095ms)
✔ photo pickup release gate stops early when release status is blocked (748.7114ms)
✔ photo pickup release status explains missing acceptance gates (1.622ms)
✔ photo pickup release status can print machine-readable JSON (539.3673ms)
✔ photo pickup release status can write a JSON artifact (650.5965ms)
✔ photo pickup release status handles legacy summaries without manual checks (632.5697ms)
✔ photo pickup release status handles partial manual check objects (676.8069ms)
✔ photo pickup release status handles corrupt summary json (558.7361ms)
✔ photo pickup release status handles summaries without conclusion fields (686.5998ms)
✔ photo pickup release status blocks final pass summaries without automatic runs (655.2219ms)
✔ photo pickup release status blocks forged final pass summaries without evidence integrity (706.44ms)
✔ real OSS evidence summary verifier rejects non-Aliyun OSS bare URLs (695.7403ms)
✔ photo pickup release status blocks non-Aliyun OSS bare URL summaries (663.8041ms)
✔ photo pickup release status blocks summaries with missing real OSS input ids (646.5196ms)
✔ photo pickup release status treats string false flags as not accepted (667.8489ms)
✔ deploy package carries photo pickup release evidence gates (12.9662ms)
✔ deploy package verifier enforces handoff package contents (2.6515ms)
✔ deploy package builder documents package verification JSON artifact handoff (0.5474ms)
✔ deploy package verifier rejects forbidden secret filenames in package (2098.8008ms)
✔ deploy package verifier reports missing package as machine-readable JSON (701.4377ms)
✔ result state normalizes unknown types to info (2.3469ms)
✔ result state gives actionable error diagnostics (2.2297ms)
✔ result state gives warning and info next steps (0.6297ms)
✔ result redirect sends errors to login and non-errors back to albums or redirect (1.2721ms)
✔ result redirect sanitizes unsafe error redirect targets (0.5632ms)
✔ client photo api exposes a separate thumbnail signed url endpoint (3.1063ms)
✔ thumbnail signed url falls back to preview signed url when backend lacks thumbnail endpoint (1.1496ms)
✔ miniapp image display uses api-domain stream temp files instead of direct OSS signed urls (3.5706ms)
✔ album directory and cover use thumbnails while preview keeps preview metadata (2.3416ms)
ℹ tests 97
ℹ suites 0
ℹ pass 97
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 17937.9149
<== mobile unit tests passed in 18.8s
mobile H5 browser smoke skipped

==> mobile H5 build

> yingyue-photo-pickup-mobile@0.1.0 build:h5
> uni build

编译器版本：4.66（vue3）
正在编译中...

uni-app 有新版本发布，请执行 `npx @dcloudio/uvm@latest` 更新，更新日志详见：https://download1.dcloud.net.cn/hbuilderx/changelog/5.07.2026041006.html

欢迎将web站点部署到uniCloud前端网页托管平台，高速、免费、安全、省心，详见：https://uniapp.dcloud.io/uniCloud/hosting
DONE  Build complete.
<== mobile H5 build passed in 18.6s

==> mobile WeChat mini build

> yingyue-photo-pickup-mobile@0.1.0 build:mp-weixin
> uni build -p mp-weixin --mode api

正在编译中...

uni-app 有新版本发布，请执行 `npx @dcloudio/uvm@latest` 更新，更新日志详见：https://download1.dcloud.net.cn/hbuilderx/changelog/5.07.2026041006.html
DONE  Build complete.
运行方式：打开 微信开发者工具, 导入 [36mdist\build\mp-weixin[39m 运行。
<== mobile WeChat mini build passed in 12.5s

==> mobile Douyin mini build

> yingyue-photo-pickup-mobile@0.1.0 build:mp-toutiao
> uni build -p mp-toutiao --mode api

正在编译中...

uni-app 有新版本发布，请执行 `npx @dcloudio/uvm@latest` 更新，更新日志详见：https://download1.dcloud.net.cn/hbuilderx/changelog/5.07.2026041006.html
DONE  Build complete.
运行方式：打开 抖音开发者工具, 导入 [36mdist\build\mp-toutiao[39m 运行。
<== mobile Douyin mini build passed in 12.3s
platform readiness skipped

==> admin yy tests

> ruoyi-vue-plus@5.6.1-2.6.1 test:yy
> vitest run src/views/yy/utils


[1m[46m RUN [49m[22m [36mv4.0.18 [39m[90mD:/OtherProject/CameraApp/yingyue-cloud-repo/admin-ui[39m

 [32m✓[39m src/views/yy/utils/orderPageContract.test.ts [2m([22m[2m9 tests[22m[2m)[22m[32m 17[2mms[22m[39m
 [32m✓[39m src/views/yy/utils/photoPageContract.test.ts [2m([22m[2m23 tests[22m[2m)[22m[32m 21[2mms[22m[39m
 [32m✓[39m src/views/yy/utils/photoThumbnail.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 9[2mms[22m[39m
 [32m✓[39m src/views/yy/utils/douyinLife.test.ts [2m([22m[2m3 tests[22m[2m)[22m[32m 12[2mms[22m[39m
 [32m✓[39m src/views/yy/utils/photoUpload.test.ts [2m([22m[2m10 tests[22m[2m)[22m[32m 18[2mms[22m[39m
 [32m✓[39m src/views/yy/utils/photoOperationsHealth.test.ts [2m([22m[2m4 tests[22m[2m)[22m[32m 14[2mms[22m[39m
 [32m✓[39m src/views/yy/utils/photoPickupEntry.test.ts [2m([22m[2m12 tests[22m[2m)[22m[32m 63[2mms[22m[39m
 [32m✓[39m src/views/yy/utils/homePageContract.test.ts [2m([22m[2m2 tests[22m[2m)[22m[32m 4[2mms[22m[39m

[2m Test Files [22m [1m[32m8 passed[39m[22m[90m (8)[39m
[2m      Tests [22m [1m[32m65 passed[39m[22m[90m (65)[39m
[2m   Start at [22m 22:12:57
[2m   Duration [22m 2.06s[2m (transform 7.20s, setup 0ms, import 7.81s, tests 158ms, environment 6ms)[22m

<== admin yy tests passed in 12.8s

==> admin dev build

> ruoyi-vue-plus@5.6.1-2.6.1 build:dev
> vite build --mode development

[36mvite v7.3.2 [32mbuilding client environment for development...[36m[39m
transforming...
[32m✓[39m 3262 modules transformed.
rendering chunks...
computing gzip size...
[2mdist/[22m[32massets/404_cloud-CPexjtDj.png                                                      [39m[1m[2m  4.77 kB[22m[1m[22m
[2mdist/[22m[32massets/iconfont.1773109208977-D9epzWxu.woff                                        [39m[1m[2m  4.86 kB[22m[1m[22m
[2mdist/[22m[32massets/logo-BCbpRHkf.png                                                           [39m[1m[2m  8.13 kB[22m[1m[22m
[2mdist/[22m[32massets/iconfont.1773109208977-BllfKX1O.ttf                                         [39m[1m[2m  8.63 kB[22m[1m[22m
[2mdist/[22m[32massets/maxkey-ChCLWCJG.svg                                                         [39m[1m[2m  9.49 kB[22m[1m[22m[2m │ gzip:   7.21 kB[22m
[2mdist/[22m[32massets/404-N4aRkdWY.png                                                            [39m[1m[2m 98.07 kB[22m[1m[22m
[2mdist/[22m[32mindex.html                                                                         [39m[1m[2m114.78 kB[22m[1m[22m[2m │ gzip:  49.75 kB[22m
[2mdist/[22m[32massets/401-HGF6Q5qM.gif                                                            [39m[1m[2m164.23 kB[22m[1m[22m
[2mdist/[22m[32massets/profile-ypoSwBLm.jpg                                                        [39m[1m[2m275.35 kB[22m[1m[22m
[2mdist/[22m[32massets/login-background-B2WH8JPc.jpg                                               [39m[1m[2m577.78 kB[22m[1m[22m
[2mdist/[22m[35massets/index-DvT2ARzV.css                                                          [39m[1m[2m  0.05 kB[22m[1m[22m[2m │ gzip:   0.07 kB[22m
[2mdist/[22m[35massets/index-DBAzI4d8.css                                                          [39m[1m[2m  0.11 kB[22m[1m[22m[2m │ gzip:   0.09 kB[22m
[2mdist/[22m[35massets/oper-info-dialog-FFOeB6T0.css                                               [39m[1m[2m  0.12 kB[22m[1m[22m[2m │ gzip:   0.10 kB[22m
[2mdist/[22m[35massets/index-BJGkirtX.css                                                          [39m[1m[2m  0.14 kB[22m[1m[22m[2m │ gzip:   0.11 kB[22m
[2mdist/[22m[35massets/index-Dv_WGVig.css                                                          [39m[1m[2m  0.19 kB[22m[1m[22m[2m │ gzip:   0.17 kB[22m
[2mdist/[22m[35massets/leaveEdit-B_JScZGy.css                                                      [39m[1m[2m  0.32 kB[22m[1m[22m[2m │ gzip:   0.22 kB[22m
[2mdist/[22m[35massets/index-BCFTm76R.css                                                          [39m[1m[2m  0.33 kB[22m[1m[22m[2m │ gzip:   0.20 kB[22m
[2mdist/[22m[35massets/userAvatar-C2tWFnK1.css                                                     [39m[1m[2m  0.35 kB[22m[1m[22m[2m │ gzip:   0.25 kB[22m
[2mdist/[22m[35massets/index-hhD4oEzE.css                                                          [39m[1m[2m  0.42 kB[22m[1m[22m[2m │ gzip:   0.23 kB[22m
[2mdist/[22m[35massets/index-DkBCB8xz.css                                                          [39m[1m[2m  0.46 kB[22m[1m[22m[2m │ gzip:   0.28 kB[22m
[2mdist/[22m[35massets/index-CqT0u-0q.css                                                          [39m[1m[2m  0.52 kB[22m[1m[22m[2m │ gzip:   0.29 kB[22m
[2mdist/[22m[35massets/index-DYBojRJV.css                                                          [39m[1m[2m  0.53 kB[22m[1m[22m[2m │ gzip:   0.30 kB[22m
[2mdist/[22m[35massets/401-CjUGjB8H.css                                                            [39m[1m[2m  0.75 kB[22m[1m[22m[2m │ gzip:   0.30 kB[22m
[2mdist/[22m[35massets/index-KKcUJ02H.css                                                          [39m[1m[2m  0.75 kB[22m[1m[22m[2m │ gzip:   0.37 kB[22m
[2mdist/[22m[35massets/thirdParty-Ktv7sZbT.css                                                     [39m[1m[2m  0.77 kB[22m[1m[22m[2m │ gzip:   0.46 kB[22m
[2mdist/[22m[35massets/index-DikHkR0t.css                                                          [39m[1m[2m  0.81 kB[22m[1m[22m[2m │ gzip:   0.39 kB[22m
[2mdist/[22m[35massets/vendor-utils-CSXic_Zd.css                                                   [39m[1m[2m  0.83 kB[22m[1m[22m[2m │ gzip:   0.40 kB[22m
[2mdist/[22m[35massets/vendor-highlight-ZgkIHsf0.css                                               [39m[1m[2m  0.86 kB[22m[1m[22m[2m │ gzip:   0.40 kB[22m
[2mdist/[22m[35massets/index-ja3Yhpd5.css                                                          [39m[1m[2m  0.89 kB[22m[1m[22m[2m │ gzip:   0.37 kB[22m
[2mdist/[22m[35massets/index-Nqt5OZPD.css                                                          [39m[1m[2m  1.05 kB[22m[1m[22m[2m │ gzip:   0.39 kB[22m
[2mdist/[22m[35massets/register-B56Yf9oE.css                                                       [39m[1m[2m  1.20 kB[22m[1m[22m[2m │ gzip:   0.51 kB[22m
[2mdist/[22m[35massets/index-C_TpwQpt.css                                                          [39m[1m[2m  1.52 kB[22m[1m[22m[2m │ gzip:   0.55 kB[22m
[2mdist/[22m[35massets/allTaskWaiting-DDheN0iY.css                                                 [39m[1m[2m  1.80 kB[22m[1m[22m[2m │ gzip:   0.38 kB[22m
[2mdist/[22m[35massets/YyChannelWorkbench-DW01BM64.css                                             [39m[1m[2m  2.46 kB[22m[1m[22m[2m │ gzip:   0.70 kB[22m
[2mdist/[22m[35massets/index-N7VkHBYI.css                                                          [39m[1m[2m  2.49 kB[22m[1m[22m[2m │ gzip:   0.51 kB[22m
[2mdist/[22m[35massets/404-BmUPfV6k.css                                                            [39m[1m[2m  2.85 kB[22m[1m[22m[2m │ gzip:   0.74 kB[22m
[2mdist/[22m[35massets/vendor-element-plus-CB6pnfZz.css                                            [39m[1m[2m  2.95 kB[22m[1m[22m[2m │ gzip:   0.85 kB[22m
[2mdist/[22m[35massets/index-BCKB09Nq.css                                                          [39m[1m[2m  4.55 kB[22m[1m[22m[2m │ gzip:   0.91 kB[22m
[2mdist/[22m[35massets/index-D8sSOkFI.css                                                          [39m[1m[2m  4.59 kB[22m[1m[22m[2m │ gzip:   1.15 kB[22m
[2mdist/[22m[35massets/login-Bw342pdY.css                                                          [39m[1m[2m  4.81 kB[22m[1m[22m[2m │ gzip:   1.43 kB[22m
[2mdist/[22m[35massets/vendor-core-BdIiHjsz.css                                                    [39m[1m[2m  7.27 kB[22m[1m[22m[2m │ gzip:   1.85 kB[22m
[2mdist/[22m[35massets/index-Dlg5GoCF.css                                                          [39m[1m[2m 15.61 kB[22m[1m[22m[2m │ gzip:   2.14 kB[22m
[2mdist/[22m[35massets/vendor-editor-C86WLP6Y.css                                                  [39m[1m[2m 20.38 kB[22m[1m[22m[2m │ gzip:   3.33 kB[22m
[2mdist/[22m[35massets/vendor-vxe-BQDsS6aq.css                                                     [39m[1m[2m134.49 kB[22m[1m[22m[2m │ gzip:  20.27 kB[22m
[2mdist/[22m[35massets/index-pyoue13w.css                                                          [39m[1m[2m440.68 kB[22m[1m[22m[2m │ gzip:  62.41 kB[22m
[2mdist/[22m[36massets/maxkey-Dd3VEiEz.js                                                          [39m[1m[2m  0.06 kB[22m[1m[22m[2m │ gzip:   0.08 kB[22m
[2mdist/[22m[36massets/echarts-D8k155I0.js                                                         [39m[1m[2m  0.13 kB[22m[1m[22m[2m │ gzip:   0.12 kB[22m
[2mdist/[22m[36massets/index-BpaKvpB0.js                                                           [39m[1m[2m  0.16 kB[22m[1m[22m[2m │ gzip:   0.15 kB[22m
[2mdist/[22m[36massets/index-VvR4Z9hB.js                                                           [39m[1m[2m  0.18 kB[22m[1m[22m[2m │ gzip:   0.15 kB[22m
[2mdist/[22m[36massets/index-DupeAv8W.js                                                           [39m[1m[2m  0.25 kB[22m[1m[22m[2m │ gzip:   0.21 kB[22m
[2mdist/[22m[36massets/chart-BsLMrzXU.js                                                           [39m[1m[2m  0.26 kB[22m[1m[22m[2m │ gzip:   0.21 kB[22m
[2mdist/[22m[36massets/index-uUz_g860.js                                                           [39m[1m[2m  0.28 kB[22m[1m[22m[2m │ gzip:   0.17 kB[22m
[2mdist/[22m[36massets/size-Cj9fB5Rp.js                                                            [39m[1m[2m  0.29 kB[22m[1m[22m[2m │ gzip:   0.23 kB[22m
[2mdist/[22m[36massets/auth-CSGUkDzz.js                                                            [39m[1m[2m  0.31 kB[22m[1m[22m[2m │ gzip:   0.21 kB[22m
[2mdist/[22m[36massets/index-W3W9-5dd.js                                                           [39m[1m[2m  0.32 kB[22m[1m[22m[2m │ gzip:   0.18 kB[22m
[2mdist/[22m[36massets/basicInfoForm-B2V1Rm_2.js                                                   [39m[1m[2m  0.32 kB[22m[1m[22m[2m │ gzip:   0.22 kB[22m
[2mdist/[22m[36massets/caret-back-5mdibKdo.js                                                      [39m[1m[2m  0.32 kB[22m[1m[22m[2m │ gzip:   0.25 kB[22m
[2mdist/[22m[36massets/caret-forward-D90KpvAo.js                                                   [39m[1m[2m  0.32 kB[22m[1m[22m[2m │ gzip:   0.25 kB[22m
[2mdist/[22m[36massets/resetPwd-CK5RxRmB.js                                                        [39m[1m[2m  0.34 kB[22m[1m[22m[2m │ gzip:   0.22 kB[22m
[2mdist/[22m[36massets/userInfo-DsqdK_Om.js                                                        [39m[1m[2m  0.34 kB[22m[1m[22m[2m │ gzip:   0.22 kB[22m
[2mdist/[22m[36massets/genInfoForm-CNCPx8K7.js                                                     [39m[1m[2m  0.35 kB[22m[1m[22m[2m │ gzip:   0.23 kB[22m
[2mdist/[22m[36massets/index-CsoMnlXm.js                                                           [39m[1m[2m  0.35 kB[22m[1m[22m[2m │ gzip:   0.18 kB[22m
[2mdist/[22m[36massets/importTable-TCdXANdK.js                                                     [39m[1m[2m  0.38 kB[22m[1m[22m[2m │ gzip:   0.23 kB[22m
[2mdist/[22m[36massets/link-C93f4PgI.js                                                            [39m[1m[2m  0.38 kB[22m[1m[22m[2m │ gzip:   0.27 kB[22m
[2mdist/[22m[36massets/onlineDevice-DSuo-11K.js                                                    [39m[1m[2m  0.39 kB[22m[1m[22m[2m │ gzip:   0.24 kB[22m
[2mdist/[22m[36massets/index-hXiIRW4l.js                                                           [39m[1m[2m  0.40 kB[22m[1m[22m[2m │ gzip:   0.22 kB[22m
[2mdist/[22m[36massets/index-DtZVOLik.js                                                           [39m[1m[2m  0.42 kB[22m[1m[22m[2m │ gzip:   0.20 kB[22m
[2mdist/[22m[36massets/selectUser-BofX5Hc3.js                                                      [39m[1m[2m  0.42 kB[22m[1m[22m[2m │ gzip:   0.25 kB[22m
[2mdist/[22m[36massets/guide-DZWUPi2j.js                                                           [39m[1m[2m  0.42 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m
[2mdist/[22m[36massets/money-B1qqPuhn.js                                                           [39m[1m[2m  0.43 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m
[2mdist/[22m[36massets/index-DnmeFm-Z.js                                                           [39m[1m[2m  0.44 kB[22m[1m[22m[2m │ gzip:   0.20 kB[22m
[2mdist/[22m[36massets/drag-BG1_I1vT.js                                                            [39m[1m[2m  0.45 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m
[2mdist/[22m[36massets/email-Dig28Vt2.js                                                           [39m[1m[2m  0.48 kB[22m[1m[22m[2m │ gzip:   0.30 kB[22m
[2mdist/[22m[36massets/documentation-uH9BvL5U.js                                                   [39m[1m[2m  0.52 kB[22m[1m[22m[2m │ gzip:   0.35 kB[22m
[2mdist/[22m[36massets/fullscreen-0JHt5yWX.js                                                      [39m[1m[2m  0.55 kB[22m[1m[22m[2m │ gzip:   0.34 kB[22m
[2mdist/[22m[36massets/excel-D3hj5F35.js                                                           [39m[1m[2m  0.56 kB[22m[1m[22m[2m │ gzip:   0.32 kB[22m
[2mdist/[22m[36massets/user-DqMuW5cU.js                                                            [39m[1m[2m  0.57 kB[22m[1m[22m[2m │ gzip:   0.35 kB[22m
[2mdist/[22m[36massets/lock-Bexeb9hp.js                                                            [39m[1m[2m  0.57 kB[22m[1m[22m[2m │ gzip:   0.35 kB[22m
[2mdist/[22m[36massets/index-DsRcV4_6.js                                                           [39m[1m[2m  0.59 kB[22m[1m[22m[2m │ gzip:   0.25 kB[22m
[2mdist/[22m[36massets/index-Cc84Aenx.js                                                           [39m[1m[2m  0.59 kB[22m[1m[22m[2m │ gzip:   0.39 kB[22m
[2mdist/[22m[36massets/index-CKQot92I.js                                                           [39m[1m[2m  0.60 kB[22m[1m[22m[2m │ gzip:   0.39 kB[22m
[2mdist/[22m[36massets/index-D1IhyS6H.js                                                           [39m[1m[2m  0.60 kB[22m[1m[22m[2m │ gzip:   0.23 kB[22m
[2mdist/[22m[36massets/index-BG6w0zi6.js                                                           [39m[1m[2m  0.61 kB[22m[1m[22m[2m │ gzip:   0.25 kB[22m
[2mdist/[22m[36massets/index-VXv1Hnge.js                                                           [39m[1m[2m  0.63 kB[22m[1m[22m[2m │ gzip:   0.26 kB[22m
[2mdist/[22m[36massets/example-CnLLAFb9.js                                                         [39m[1m[2m  0.63 kB[22m[1m[22m[2m │ gzip:   0.35 kB[22m
[2mdist/[22m[36massets/index-BLFXAQUb.js                                                           [39m[1m[2m  0.66 kB[22m[1m[22m[2m │ gzip:   0.25 kB[22m
[2mdist/[22m[36massets/table-5PRh60AQ.js                                                           [39m[1m[2m  0.70 kB[22m[1m[22m[2m │ gzip:   0.25 kB[22m
[2mdist/[22m[36massets/star-kST8a72V.js                                                            [39m[1m[2m  0.71 kB[22m[1m[22m[2m │ gzip:   0.43 kB[22m
[2mdist/[22m[36massets/index.vue_vue_type_script_setup_true_lang-1c2aapmx.js                       [39m[1m[2m  0.71 kB[22m[1m[22m[2m │ gzip:   0.46 kB[22m
[2mdist/[22m[36massets/slider-BGfehM6X.js                                                          [39m[1m[2m  0.73 kB[22m[1m[22m[2m │ gzip:   0.44 kB[22m
[2mdist/[22m[36massets/education-47KsSYIl.js                                                       [39m[1m[2m  0.76 kB[22m[1m[22m[2m │ gzip:   0.46 kB[22m
[2mdist/[22m[36massets/search-CUfclCsR.js                                                          [39m[1m[2m  0.79 kB[22m[1m[22m[2m │ gzip:   0.42 kB[22m
[2mdist/[22m[36massets/index-CZpp2R5R.js                                                           [39m[1m[2m  0.79 kB[22m[1m[22m[2m │ gzip:   0.57 kB[22m
[2mdist/[22m[36massets/tab-nA3f0aBt.js                                                             [39m[1m[2m  0.80 kB[22m[1m[22m[2m │ gzip:   0.37 kB[22m
[2mdist/[22m[36massets/index-u5TSpvhv.js                                                           [39m[1m[2m  0.85 kB[22m[1m[22m[2m │ gzip:   0.33 kB[22m
[2mdist/[22m[36massets/message-UkR-VIBB.js                                                         [39m[1m[2m  0.85 kB[22m[1m[22m[2m │ gzip:   0.39 kB[22m
[2mdist/[22m[36massets/code-DgJ8cT4a.js                                                            [39m[1m[2m  0.88 kB[22m[1m[22m[2m │ gzip:   0.51 kB[22m
[2mdist/[22m[36massets/theme-CyGq941x.js                                                           [39m[1m[2m  0.88 kB[22m[1m[22m[2m │ gzip:   0.48 kB[22m
[2mdist/[22m[36massets/switch-CvaargRJ.js                                                          [39m[1m[2m  0.90 kB[22m[1m[22m[2m │ gzip:   0.48 kB[22m
[2mdist/[22m[36massets/peoples-BRYsIqmI.js                                                         [39m[1m[2m  0.91 kB[22m[1m[22m[2m │ gzip:   0.50 kB[22m
[2mdist/[22m[36massets/druid-BybW_S_B.js                                                           [39m[1m[2m  0.93 kB[22m[1m[22m[2m │ gzip:   0.53 kB[22m
[2mdist/[22m[36massets/index-CdXahWxF.js                                                           [39m[1m[2m  0.94 kB[22m[1m[22m[2m │ gzip:   0.31 kB[22m
[2mdist/[22m[36massets/input-BJoPMnBW.js                                                           [39m[1m[2m  0.96 kB[22m[1m[22m[2m │ gzip:   0.52 kB[22m
[2mdist/[22m[36massets/edit-D0DI9pAq.js                                                            [39m[1m[2m  1.00 kB[22m[1m[22m[2m │ gzip:   0.51 kB[22m
[2mdist/[22m[36massets/nested-B4d5u3hW.js                                                          [39m[1m[2m  1.01 kB[22m[1m[22m[2m │ gzip:   0.43 kB[22m
[2mdist/[22m[36massets/textarea-CJWXlgbJ.js                                                        [39m[1m[2m  1.02 kB[22m[1m[22m[2m │ gzip:   0.54 kB[22m
[2mdist/[22m[36massets/server-unS7EyF7.js                                                          [39m[1m[2m  1.02 kB[22m[1m[22m[2m │ gzip:   0.50 kB[22m
[2mdist/[22m[36massets/row-CRXKIHjm.js                                                             [39m[1m[2m  1.05 kB[22m[1m[22m[2m │ gzip:   0.57 kB[22m
[2mdist/[22m[36massets/time-BVERp0sU.js                                                            [39m[1m[2m  1.05 kB[22m[1m[22m[2m │ gzip:   0.56 kB[22m
[2mdist/[22m[36massets/design-CtXI3jKU.js                                                          [39m[1m[2m  1.06 kB[22m[1m[22m[2m │ gzip:   0.70 kB[22m
[2mdist/[22m[36massets/workflow-CfALY0mT.js                                                        [39m[1m[2m  1.08 kB[22m[1m[22m[2m │ gzip:   0.45 kB[22m
[2mdist/[22m[36massets/monitor-gwnnVq4l.js                                                         [39m[1m[2m  1.09 kB[22m[1m[22m[2m │ gzip:   0.65 kB[22m
[2mdist/[22m[36massets/tree-table-CnOS99I9.js                                                      [39m[1m[2m  1.15 kB[22m[1m[22m[2m │ gzip:   0.46 kB[22m
[2mdist/[22m[36massets/eye-DqRz4sMZ.js                                                             [39m[1m[2m  1.15 kB[22m[1m[22m[2m │ gzip:   0.59 kB[22m
[2mdist/[22m[36massets/clipboard-DaV3cn7f.js                                                       [39m[1m[2m  1.19 kB[22m[1m[22m[2m │ gzip:   0.57 kB[22m
[2mdist/[22m[36massets/build-2jMyI6eP.js                                                           [39m[1m[2m  1.20 kB[22m[1m[22m[2m │ gzip:   0.61 kB[22m
[2mdist/[22m[36massets/list-C7O8B4zW.js                                                            [39m[1m[2m  1.24 kB[22m[1m[22m[2m │ gzip:   0.44 kB[22m
[2mdist/[22m[36massets/index-nDTGEt7_.js                                                           [39m[1m[2m  1.26 kB[22m[1m[22m[2m │ gzip:   0.41 kB[22m
[2mdist/[22m[36massets/icon-BtMv6Od8.js                                                            [39m[1m[2m  1.29 kB[22m[1m[22m[2m │ gzip:   0.64 kB[22m
[2mdist/[22m[36massets/index-CD7wT65z.js                                                           [39m[1m[2m  1.32 kB[22m[1m[22m[2m │ gzip:   0.72 kB[22m
[2mdist/[22m[36massets/download-DeIzgQWH.js                                                        [39m[1m[2m  1.36 kB[22m[1m[22m[2m │ gzip:   0.64 kB[22m
[2mdist/[22m[36massets/skill-B8f_I4m_.js                                                           [39m[1m[2m  1.40 kB[22m[1m[22m[2m │ gzip:   0.71 kB[22m
[2mdist/[22m[36massets/category-0ZczrG1A.js                                                        [39m[1m[2m  1.41 kB[22m[1m[22m[2m │ gzip:   0.56 kB[22m
[2mdist/[22m[36massets/index-CAQVKi2U.js                                                           [39m[1m[2m  1.41 kB[22m[1m[22m[2m │ gzip:   0.51 kB[22m
[2mdist/[22m[36massets/401-DS87nqj2.js                                                             [39m[1m[2m  1.42 kB[22m[1m[22m[2m │ gzip:   0.92 kB[22m
[2mdist/[22m[36massets/international-CmzG1OHg.js                                                   [39m[1m[2m  1.43 kB[22m[1m[22m[2m │ gzip:   0.67 kB[22m
[2mdist/[22m[36massets/question-CvYWQbyW.js                                                        [39m[1m[2m  1.46 kB[22m[1m[22m[2m │ gzip:   0.58 kB[22m
[2mdist/[22m[36massets/wechat-lmQOcPZu.js                                                          [39m[1m[2m  1.46 kB[22m[1m[22m[2m │ gzip:   0.65 kB[22m
[2mdist/[22m[36massets/404-DngCvAaE.js                                                             [39m[1m[2m  1.49 kB[22m[1m[22m[2m │ gzip:   0.87 kB[22m
[2mdist/[22m[36massets/people-CdGMHN63.js                                                          [39m[1m[2m  1.49 kB[22m[1m[22m[2m │ gzip:   0.69 kB[22m
[2mdist/[22m[36massets/checkbox-Bpiun3bf.js                                                        [39m[1m[2m  1.52 kB[22m[1m[22m[2m │ gzip:   0.68 kB[22m
[2mdist/[22m[36massets/post-DrLDyPY9.js                                                            [39m[1m[2m  1.52 kB[22m[1m[22m[2m │ gzip:   0.68 kB[22m
[2mdist/[22m[36massets/gitee-DQh54kYf.js                                                           [39m[1m[2m  1.53 kB[22m[1m[22m[2m │ gzip:   0.65 kB[22m
[2mdist/[22m[36massets/language-CaW1LMEk.js                                                        [39m[1m[2m  1.55 kB[22m[1m[22m[2m │ gzip:   0.69 kB[22m
[2mdist/[22m[36massets/eye-open-BxlshWqB.js                                                        [39m[1m[2m  1.55 kB[22m[1m[22m[2m │ gzip:   0.74 kB[22m
[2mdist/[22m[36massets/index-9e8CMVa6.js                                                           [39m[1m[2m  1.61 kB[22m[1m[22m[2m │ gzip:   1.13 kB[22m
[2mdist/[22m[36massets/radio-B0t9wPBQ.js                                                           [39m[1m[2m  1.61 kB[22m[1m[22m[2m │ gzip:   0.76 kB[22m
[2mdist/[22m[36massets/select-DhuHHMxz.js                                                          [39m[1m[2m  1.62 kB[22m[1m[22m[2m │ gzip:   0.73 kB[22m
[2mdist/[22m[36massets/company-DXbSSuVY.js                                                         [39m[1m[2m  1.65 kB[22m[1m[22m[2m │ gzip:   0.72 kB[22m
[2mdist/[22m[36massets/validCode-COB1iLxa.js                                                       [39m[1m[2m  1.66 kB[22m[1m[22m[2m │ gzip:   0.87 kB[22m
[2mdist/[22m[36massets/zip-DIOSZc69.js                                                             [39m[1m[2m  1.66 kB[22m[1m[22m[2m │ gzip:   0.84 kB[22m
[2mdist/[22m[36massets/index-v5LlS_DI.js                                                           [39m[1m[2m  1.72 kB[22m[1m[22m[2m │ gzip:   0.84 kB[22m
[2mdist/[22m[36massets/YyPlanShell-BCBlmzmS.js                                                     [39m[1m[2m  1.72 kB[22m[1m[22m[2m │ gzip:   0.89 kB[22m
[2mdist/[22m[36massets/404-Dy3nURRX.js                                                             [39m[1m[2m  1.73 kB[22m[1m[22m[2m │ gzip:   0.84 kB[22m
[2mdist/[22m[36massets/upload-BueI-Il1.js                                                          [39m[1m[2m  1.75 kB[22m[1m[22m[2m │ gzip:   0.85 kB[22m
[2mdist/[22m[36massets/model-HCazUHUN.js                                                           [39m[1m[2m  1.77 kB[22m[1m[22m[2m │ gzip:   0.77 kB[22m
[2mdist/[22m[36massets/onlineDevice.vue_vue_type_script_setup_true_name_Online_lang-m-tAj9p8.js    [39m[1m[2m  1.79 kB[22m[1m[22m[2m │ gzip:   1.00 kB[22m
[2mdist/[22m[36massets/phone-BpAUIz0g.js                                                           [39m[1m[2m  1.82 kB[22m[1m[22m[2m │ gzip:   0.87 kB[22m
[2mdist/[22m[36massets/my-copy-Cc4sZdjp.js                                                         [39m[1m[2m  1.86 kB[22m[1m[22m[2m │ gzip:   0.90 kB[22m
[2mdist/[22m[36massets/index-C86ApSJz.js                                                           [39m[1m[2m  1.86 kB[22m[1m[22m[2m │ gzip:   0.99 kB[22m
[2mdist/[22m[36massets/bug-10dePVta.js                                                             [39m[1m[2m  1.88 kB[22m[1m[22m[2m │ gzip:   0.85 kB[22m
[2mdist/[22m[36massets/log-CF2F-nSs.js                                                             [39m[1m[2m  1.89 kB[22m[1m[22m[2m │ gzip:   0.96 kB[22m
[2mdist/[22m[36massets/github-AJ0WQBa2.js                                                          [39m[1m[2m  1.96 kB[22m[1m[22m[2m │ gzip:   0.85 kB[22m
[2mdist/[22m[36massets/pdf-CD9mOGjJ.js                                                             [39m[1m[2m  2.01 kB[22m[1m[22m[2m │ gzip:   1.00 kB[22m
[2mdist/[22m[36massets/rate-CgnHQvKS.js                                                            [39m[1m[2m  2.03 kB[22m[1m[22m[2m │ gzip:   0.97 kB[22m
[2mdist/[22m[36massets/basicInfoForm.vue_vue_type_script_setup_true_lang-4Z6FZE5j.js               [39m[1m[2m  2.04 kB[22m[1m[22m[2m │ gzip:   0.74 kB[22m
[2mdist/[22m[36massets/job-BcmuINx7.js                                                             [39m[1m[2m  2.11 kB[22m[1m[22m[2m │ gzip:   0.70 kB[22m
[2mdist/[22m[36massets/index-CzQWttLB.js                                                           [39m[1m[2m  2.11 kB[22m[1m[22m[2m │ gzip:   1.04 kB[22m
[2mdist/[22m[36massets/exit-fullscreen-dXhGKlQm.js                                                 [39m[1m[2m  2.13 kB[22m[1m[22m[2m │ gzip:   0.98 kB[22m
[2mdist/[22m[36massets/swagger-BHGXZ2Jt.js                                                         [39m[1m[2m  2.13 kB[22m[1m[22m[2m │ gzip:   0.79 kB[22m
[2mdist/[22m[36massets/logininfor-Bm9ZYYR7.js                                                      [39m[1m[2m  2.16 kB[22m[1m[22m[2m │ gzip:   0.61 kB[22m
[2mdist/[22m[36massets/tree-BCtS3oPD.js                                                            [39m[1m[2m  2.16 kB[22m[1m[22m[2m │ gzip:   0.91 kB[22m
[2mdist/[22m[36massets/resetPwd.vue_vue_type_script_setup_true_lang-HSSucYTe.js                    [39m[1m[2m  2.18 kB[22m[1m[22m[2m │ gzip:   0.99 kB[22m
[2mdist/[22m[36massets/douyinLife-q1cZZ8um.js                                                      [39m[1m[2m  2.18 kB[22m[1m[22m[2m │ gzip:   0.92 kB[22m
[2mdist/[22m[36massets/password-DfGvqQpB.js                                                        [39m[1m[2m  2.19 kB[22m[1m[22m[2m │ gzip:   1.07 kB[22m
[2mdist/[22m[36massets/userInfo.vue_vue_type_script_setup_true_lang-D2UbXaEI.js                    [39m[1m[2m  2.19 kB[22m[1m[22m[2m │ gzip:   1.01 kB[22m
[2mdist/[22m[36massets/finish-BRuAx7NH.js                                                          [39m[1m[2m  2.32 kB[22m[1m[22m[2m │ gzip:   0.86 kB[22m
[2mdist/[22m[36massets/date-range-B8MgYLb1.js                                                      [39m[1m[2m  2.44 kB[22m[1m[22m[2m │ gzip:   0.83 kB[22m
[2mdist/[22m[36massets/oper-info-dialog-BkIuT7qt.js                                                [39m[1m[2m  2.46 kB[22m[1m[22m[2m │ gzip:   1.17 kB[22m
[2mdist/[22m[36massets/cascader-CXIOcY1C.js                                                        [39m[1m[2m  2.59 kB[22m[1m[22m[2m │ gzip:   0.93 kB[22m
[2mdist/[22m[36massets/waiting-D_cNzrMI.js                                                         [39m[1m[2m  2.61 kB[22m[1m[22m[2m │ gzip:   0.94 kB[22m
[2mdist/[22m[36massets/process-definition-e9KsNKRB.js                                              [39m[1m[2m  2.68 kB[22m[1m[22m[2m │ gzip:   1.02 kB[22m
[2mdist/[22m[36massets/shopping-CU1IRvxM.js                                                        [39m[1m[2m  2.75 kB[22m[1m[22m[2m │ gzip:   1.16 kB[22m
[2mdist/[22m[36massets/dashboard-Dy7qt_a2.js                                                       [39m[1m[2m  2.80 kB[22m[1m[22m[2m │ gzip:   0.90 kB[22m
[2mdist/[22m[36massets/button-CW0FARDd.js                                                          [39m[1m[2m  2.85 kB[22m[1m[22m[2m │ gzip:   1.18 kB[22m
[2mdist/[22m[36massets/component-Djp9s69L.js                                                       [39m[1m[2m  2.96 kB[22m[1m[22m[2m │ gzip:   1.25 kB[22m
[2mdist/[22m[36massets/form-BDTA_i-I.js                                                            [39m[1m[2m  3.01 kB[22m[1m[22m[2m │ gzip:   1.27 kB[22m
[2mdist/[22m[36massets/tool-D8kXk1l-.js                                                            [39m[1m[2m  3.04 kB[22m[1m[22m[2m │ gzip:   1.16 kB[22m
[2mdist/[22m[36massets/redis-list-BtKGPnqO.js                                                      [39m[1m[2m  3.14 kB[22m[1m[22m[2m │ gzip:   1.37 kB[22m
[2mdist/[22m[36massets/thirdParty-BE3w8UJf.js                                                      [39m[1m[2m  3.19 kB[22m[1m[22m[2m │ gzip:   1.45 kB[22m
[2mdist/[22m[36massets/redis-D4ECyT6a.js                                                           [39m[1m[2m  3.22 kB[22m[1m[22m[2m │ gzip:   1.24 kB[22m
[2mdist/[22m[36massets/time-range-D3dxgtLj.js                                                      [39m[1m[2m  3.35 kB[22m[1m[22m[2m │ gzip:   1.40 kB[22m
[2mdist/[22m[36massets/userAvatar-B6WXFlKH.js                                                      [39m[1m[2m  3.40 kB[22m[1m[22m[2m │ gzip:   1.66 kB[22m
[2mdist/[22m[36massets/dict-Bi_GqSXR.js                                                            [39m[1m[2m  3.43 kB[22m[1m[22m[2m │ gzip:   1.46 kB[22m
[2mdist/[22m[36massets/system-DcNSH_Fq.js                                                          [39m[1m[2m  3.44 kB[22m[1m[22m[2m │ gzip:   1.57 kB[22m
[2mdist/[22m[36massets/index-BhWdGMNT.js                                                           [39m[1m[2m  3.45 kB[22m[1m[22m[2m │ gzip:   1.47 kB[22m
[2mdist/[22m[36massets/importTable.vue_vue_type_script_setup_true_lang-aFbh-SYS.js                 [39m[1m[2m  3.49 kB[22m[1m[22m[2m │ gzip:   1.62 kB[22m
[2mdist/[22m[36massets/authRole-DhPGqIhJ.js                                                        [39m[1m[2m  3.54 kB[22m[1m[22m[2m │ gzip:   1.73 kB[22m
[2mdist/[22m[36massets/my-task-DDkdUS6J.js                                                         [39m[1m[2m  3.54 kB[22m[1m[22m[2m │ gzip:   1.24 kB[22m
[2mdist/[22m[36massets/selectUser.vue_vue_type_script_setup_true_name_SelectUser_lang-C3Dm2m6Z.js  [39m[1m[2m  3.57 kB[22m[1m[22m[2m │ gzip:   1.66 kB[22m
[2mdist/[22m[36massets/number-D4hB_nHC.js                                                          [39m[1m[2m  3.67 kB[22m[1m[22m[2m │ gzip:   1.69 kB[22m
[2mdist/[22m[36massets/date-B1FSITvi.js                                                            [39m[1m[2m  3.72 kB[22m[1m[22m[2m │ gzip:   0.88 kB[22m
[2mdist/[22m[36massets/topiam-dPXXy8nx.js                                                          [39m[1m[2m  3.87 kB[22m[1m[22m[2m │ gzip:   1.48 kB[22m
[2mdist/[22m[36massets/index-Dnlprmu2.js                                                           [39m[1m[2m  3.96 kB[22m[1m[22m[2m │ gzip:   1.76 kB[22m
[2mdist/[22m[36massets/qq-D8j4O83Y.js                                                              [39m[1m[2m  3.98 kB[22m[1m[22m[2m │ gzip:   1.81 kB[22m
[2mdist/[22m[36massets/index-FnroRFzV.js                                                           [39m[1m[2m  4.01 kB[22m[1m[22m[2m │ gzip:   2.07 kB[22m
[2mdist/[22m[36massets/photoPickupEntry-CgU0pFL7.js                                                [39m[1m[2m  4.23 kB[22m[1m[22m[2m │ gzip:   1.81 kB[22m
[2mdist/[22m[36massets/online-C2ZP8pdY.js                                                          [39m[1m[2m  4.25 kB[22m[1m[22m[2m │ gzip:   1.88 kB[22m
[2mdist/[22m[36massets/taskCopyList-OskL_M9U.js                                                    [39m[1m[2m  4.43 kB[22m[1m[22m[2m │ gzip:   1.85 kB[22m
[2mdist/[22m[36massets/color-y1Sshoou.js                                                           [39m[1m[2m  4.58 kB[22m[1m[22m[2m │ gzip:   1.65 kB[22m
[2mdist/[22m[36massets/authUser-BOSHkodZ.js                                                        [39m[1m[2m  5.17 kB[22m[1m[22m[2m │ gzip:   2.27 kB[22m
[2mdist/[22m[36massets/taskWaiting-DsCh-xYY.js                                                     [39m[1m[2m  5.54 kB[22m[1m[22m[2m │ gzip:   2.22 kB[22m
[2mdist/[22m[36massets/taskFinish-DVGVujch.js                                                      [39m[1m[2m  5.78 kB[22m[1m[22m[2m │ gzip:   2.23 kB[22m
[2mdist/[22m[36massets/index-BNmxrg64.js                                                           [39m[1m[2m  5.79 kB[22m[1m[22m[2m │ gzip:   2.80 kB[22m
[2mdist/[22m[36massets/index-BSSVMwAm.js                                                           [39m[1m[2m  5.82 kB[22m[1m[22m[2m │ gzip:   1.96 kB[22m
[2mdist/[22m[36massets/options-BMC82yhu.js                                                         [39m[1m[2m  5.92 kB[22m[1m[22m[2m │ gzip:   1.57 kB[22m
[2mdist/[22m[36massets/register-CQBaUJkd.js                                                        [39m[1m[2m  6.16 kB[22m[1m[22m[2m │ gzip:   2.35 kB[22m
[2mdist/[22m[36massets/index-C182e3FD.js                                                           [39m[1m[2m  6.48 kB[22m[1m[22m[2m │ gzip:   2.52 kB[22m
[2mdist/[22m[36massets/index-Dcr3McJd.js                                                           [39m[1m[2m  6.56 kB[22m[1m[22m[2m │ gzip:   2.59 kB[22m
[2mdist/[22m[36massets/editTable-Bb07aVV7.js                                                       [39m[1m[2m  6.62 kB[22m[1m[22m[2m │ gzip:   2.38 kB[22m
[2mdist/[22m[36massets/index.vue_vue_type_script_setup_true_lang-B0MvHBc7.js                       [39m[1m[2m  6.76 kB[22m[1m[22m[2m │ gzip:   2.92 kB[22m
[2mdist/[22m[36massets/index-CNKOzjZ9.js                                                           [39m[1m[2m  6.78 kB[22m[1m[22m[2m │ gzip:   3.04 kB[22m
[2mdist/[22m[36massets/index-DtSFQKp7.js                                                           [39m[1m[2m  6.88 kB[22m[1m[22m[2m │ gzip:   2.65 kB[22m
[2mdist/[22m[36massets/myDocument-BTJzywin.js                                                      [39m[1m[2m  6.90 kB[22m[1m[22m[2m │ gzip:   2.77 kB[22m
[2mdist/[22m[36massets/index-PqcdViih.js                                                           [39m[1m[2m  7.12 kB[22m[1m[22m[2m │ gzip:   3.02 kB[22m
[2mdist/[22m[36massets/index-w12MPGZV.js                                                           [39m[1m[2m  7.13 kB[22m[1m[22m[2m │ gzip:   2.76 kB[22m
[2mdist/[22m[36massets/index-qjAf8K5S.js                                                           [39m[1m[2m  7.14 kB[22m[1m[22m[2m │ gzip:   2.71 kB[22m
[2mdist/[22m[36massets/index-DWTJnpQa.js                                                           [39m[1m[2m  7.65 kB[22m[1m[22m[2m │ gzip:   2.71 kB[22m
[2mdist/[22m[36massets/login-DI0TeFuO.js                                                           [39m[1m[2m  7.86 kB[22m[1m[22m[2m │ gzip:   3.10 kB[22m
[2mdist/[22m[36massets/index-DA2hz5dm.js                                                           [39m[1m[2m  7.98 kB[22m[1m[22m[2m │ gzip:   3.01 kB[22m
[2mdist/[22m[36massets/index-CwdYbqu_.js                                                           [39m[1m[2m  8.43 kB[22m[1m[22m[2m │ gzip:   3.35 kB[22m
[2mdist/[22m[36massets/index-DvmYJ_hD.js                                                           [39m[1m[2m  8.51 kB[22m[1m[22m[2m │ gzip:   3.30 kB[22m
[2mdist/[22m[36massets/index-BzXdfvzd.js                                                           [39m[1m[2m  8.61 kB[22m[1m[22m[2m │ gzip:   3.33 kB[22m
[2mdist/[22m[36massets/genInfoForm.vue_vue_type_script_setup_true_lang-BtBMfKqF.js                 [39m[1m[2m  8.92 kB[22m[1m[22m[2m │ gzip:   2.53 kB[22m
[2mdist/[22m[36massets/index-BUMe8d-t.js                                                           [39m[1m[2m  9.08 kB[22m[1m[22m[2m │ gzip:   3.18 kB[22m
[2mdist/[22m[36massets/index-C4oibnDK.js                                                           [39m[1m[2m  9.69 kB[22m[1m[22m[2m │ gzip:   3.51 kB[22m
[2mdist/[22m[36massets/index-BVGJ_sbu.js                                                           [39m[1m[2m  9.78 kB[22m[1m[22m[2m │ gzip:   3.41 kB[22m
[2mdist/[22m[36massets/index-DUkyLSKc.js                                                           [39m[1m[2m 10.41 kB[22m[1m[22m[2m │ gzip:   3.39 kB[22m
[2mdist/[22m[36massets/index-D8XJaO_K.js                                                           [39m[1m[2m 10.48 kB[22m[1m[22m[2m │ gzip:   3.57 kB[22m
[2mdist/[22m[36massets/index-C_IG0cuY.js                                                           [39m[1m[2m 10.70 kB[22m[1m[22m[2m │ gzip:   4.09 kB[22m
[2mdist/[22m[36massets/index-CFCHuRk3.js                                                           [39m[1m[2m 11.06 kB[22m[1m[22m[2m │ gzip:   3.58 kB[22m
[2mdist/[22m[36massets/index-BTTm8gyk.js                                                           [39m[1m[2m 11.66 kB[22m[1m[22m[2m │ gzip:   3.70 kB[22m
[2mdist/[22m[36massets/leaveEdit-B9Mi7vfG.js                                                       [39m[1m[2m 11.68 kB[22m[1m[22m[2m │ gzip:   4.47 kB[22m
[2mdist/[22m[36massets/config-CDyQojDP.js                                                          [39m[1m[2m 12.28 kB[22m[1m[22m[2m │ gzip:   3.89 kB[22m
[2mdist/[22m[36massets/index-D9Z8QzML.js                                                           [39m[1m[2m 12.76 kB[22m[1m[22m[2m │ gzip:   3.96 kB[22m
[2mdist/[22m[36massets/submitVerify.vue_vue_type_script_setup_true_lang-BxICBQ_t.js                [39m[1m[2m 12.85 kB[22m[1m[22m[2m │ gzip:   3.85 kB[22m
[2mdist/[22m[36massets/index-CgC33B8U.js                                                           [39m[1m[2m 12.88 kB[22m[1m[22m[2m │ gzip:   4.32 kB[22m
[2mdist/[22m[36massets/index-CsmHKTU7.js                                                           [39m[1m[2m 13.65 kB[22m[1m[22m[2m │ gzip:   4.46 kB[22m
[2mdist/[22m[36massets/index-Bgrz7gAy.js                                                           [39m[1m[2m 14.02 kB[22m[1m[22m[2m │ gzip:   5.56 kB[22m
[2mdist/[22m[36massets/index-C7mrnANv.js                                                           [39m[1m[2m 14.38 kB[22m[1m[22m[2m │ gzip:   4.45 kB[22m
[2mdist/[22m[36massets/index-BOPFfY9r.js                                                           [39m[1m[2m 14.45 kB[22m[1m[22m[2m │ gzip:   4.75 kB[22m
[2mdist/[22m[36massets/allTaskWaiting-D7TR_Zc9.js                                                  [39m[1m[2m 14.81 kB[22m[1m[22m[2m │ gzip:   4.84 kB[22m
[2mdist/[22m[36massets/index-BdrA5K1E.js                                                           [39m[1m[2m 14.88 kB[22m[1m[22m[2m │ gzip:   4.85 kB[22m
[2mdist/[22m[36massets/index-Ou_dns3v.js                                                           [39m[1m[2m 16.46 kB[22m[1m[22m[2m │ gzip:   4.83 kB[22m
[2mdist/[22m[36massets/index-Y9doLzVV.js                                                           [39m[1m[2m 16.57 kB[22m[1m[22m[2m │ gzip:   5.12 kB[22m
[2mdist/[22m[36massets/index-Iasd-r-_.js                                                           [39m[1m[2m 16.72 kB[22m[1m[22m[2m │ gzip:   5.49 kB[22m
[2mdist/[22m[36massets/index-tRBe4fPq.js                                                           [39m[1m[2m 19.10 kB[22m[1m[22m[2m │ gzip:   5.00 kB[22m
[2mdist/[22m[36massets/index-DM3G2kTs.js                                                           [39m[1m[2m 19.76 kB[22m[1m[22m[2m │ gzip:   6.69 kB[22m
[2mdist/[22m[36massets/index-BtTNkDX8.js                                                           [39m[1m[2m 21.89 kB[22m[1m[22m[2m │ gzip:   5.08 kB[22m
[2mdist/[22m[36massets/index-Cez9ZYM5.js                                                           [39m[1m[2m 25.38 kB[22m[1m[22m[2m │ gzip:   7.46 kB[22m
[2mdist/[22m[36massets/index-BTaHOF9a.js                                                           [39m[1m[2m 27.75 kB[22m[1m[22m[2m │ gzip:   8.04 kB[22m
[2mdist/[22m[36massets/index-DeyKyvok.js                                                           [39m[1m[2m 34.65 kB[22m[1m[22m[2m │ gzip:   9.99 kB[22m
[2mdist/[22m[36massets/YyChannelWorkbench-CuTA69hY.js                                              [39m[1m[2m 38.23 kB[22m[1m[22m[2m │ gzip:   8.98 kB[22m
[2mdist/[22m[36massets/index-DVJ81kfr.js                                                           [39m[1m[2m 78.37 kB[22m[1m[22m[2m │ gzip:  19.86 kB[22m
[2mdist/[22m[36massets/vendor-utils-Ch3REnTQ.js                                                    [39m[1m[2m113.18 kB[22m[1m[22m[2m │ gzip:  43.28 kB[22m
[2mdist/[22m[36massets/vendor-highlight-CsfkxTeq.js                                                [39m[1m[2m163.59 kB[22m[1m[22m[2m │ gzip:  54.34 kB[22m
[2mdist/[22m[36massets/vendor-element-icons-B--VU_z7.js                                            [39m[1m[2m170.79 kB[22m[1m[22m[2m │ gzip:  44.12 kB[22m
[2mdist/[22m[36massets/vendor-zrender-DtA3N31y.js                                                  [39m[1m[2m173.76 kB[22m[1m[22m[2m │ gzip:  57.33 kB[22m
[2mdist/[22m[36massets/index-j-wzu6Vy.js                                                           [39m[1m[2m200.73 kB[22m[1m[22m[2m │ gzip:  78.38 kB[22m
[2mdist/[22m[36massets/vendor-editor-Ds0vmmHK.js                                                   [39m[1m[2m221.74 kB[22m[1m[22m[2m │ gzip:  57.48 kB[22m
[2mdist/[22m[36massets/vendor-echarts-CYbP5Dsd.js                                                  [39m[1m[2m381.60 kB[22m[1m[22m[2m │ gzip: 129.82 kB[22m
[2mdist/[22m[36massets/vendor-core-CT3krC3X.js                                                     [39m[1m[2m439.67 kB[22m[1m[22m[2m │ gzip: 154.19 kB[22m
[2mdist/[22m[36massets/vendor-vxe-Brl7xEYk.js                                                      [39m[1m[2m490.67 kB[22m[1m[22m[2m │ gzip: 153.63 kB[22m
[2mdist/[22m[36massets/vendor-element-plus-CpybtjfA.js                                             [39m[1m[2m736.45 kB[22m[1m[22m[2m │ gzip: 234.59 kB[22m
[32m✓ built in 1m 15s[39m
<== admin dev build passed in 86.9s

==> backend photo pickup smoke
photo pickup smoke
baseUrl: https://api.evanshine.me
photo smoke mode: explicit
auth: success (len=152, value=djF8...Vbbc)
albums: success count=1
detail: success albumId=990202606080001, assetCount=4
thumbnail-url: success assetId=1781018145736000012, fileName=yingyue-demo-01-retouch-cover.jpg, contentType=image/jpeg, expiresAt=2026-06-10 22:24:26
preview-url: success assetId=1781018145736000012, fileName=yingyue-demo-01-retouch-cover.jpg, contentType=image/jpeg, expiresAt=2026-06-10 22:24:26
download-url: success assetId=1781018145736000012, fileName=yingyue-demo-01-retouch-cover.jpg, contentType=image/jpeg, expiresAt=2026-06-10 22:24:26
stream: success status=200, contentType=image/jpeg, contentDisposition=attachment; filename="yingyue-demo-01-retouch-cover.jpg"; filename*=UTF-8''yingyue-demo-01-retouch-cover.jpg, bytes=70314
<== backend photo pickup smoke passed in 2.3s

==> backend client photo unit tests
[INFO] Scanning for projects...
[INFO] ------------------------------------------------------------------------
[INFO] Reactor Build Order:
[INFO]
[INFO] RuoYi-Vue-Plus                                                     [pom]
[INFO] ruoyi-common                                                       [pom]
[INFO] ruoyi-common-core                                                  [jar]
[INFO] ruoyi-common-json                                                  [jar]
[INFO] ruoyi-common-redis                                                 [jar]
[INFO] ruoyi-common-ratelimiter                                           [jar]
[INFO] ruoyi-common-satoken                                               [jar]
[INFO] ruoyi-common-mybatis                                               [jar]
[INFO] ruoyi-common-oss                                                   [jar]
[INFO] ruoyi-common-log                                                   [jar]
[INFO] ruoyi-common-excel                                                 [jar]
[INFO] ruoyi-common-tenant                                                [jar]
[INFO] ruoyi-common-security                                              [jar]
[INFO] ruoyi-common-web                                                   [jar]
[INFO] ruoyi-common-idempotent                                            [jar]
[INFO] ruoyi-common-encrypt                                               [jar]
[INFO] ruoyi-modules                                                      [pom]
[INFO] ruoyi-yy                                                           [jar]
[INFO]
[INFO] ---------------------< org.dromara:ruoyi-vue-plus >---------------------
[INFO] Building RuoYi-Vue-Plus 5.6.1                                     [1/18]
[INFO]   from pom.xml
[INFO] --------------------------------[ pom ]---------------------------------
[INFO]
[INFO] --- flatten:1.3.0:flatten (flatten) @ ruoyi-vue-plus ---
[INFO] Generating flattened POM of project org.dromara:ruoyi-vue-plus:pom:5.6.1...
[INFO]
[INFO] ----------------------< org.dromara:ruoyi-common >----------------------
[INFO] Building ruoyi-common 5.6.1                                       [2/18]
[INFO]   from ruoyi-common\pom.xml
[INFO] --------------------------------[ pom ]---------------------------------
[INFO]
[INFO] --- flatten:1.3.0:flatten (flatten) @ ruoyi-common ---
[INFO] Generating flattened POM of project org.dromara:ruoyi-common:pom:5.6.1...
[INFO]
[INFO] -------------------< org.dromara:ruoyi-common-core >--------------------
[INFO] Building ruoyi-common-core 5.6.1                                  [3/18]
[INFO]   from ruoyi-common\ruoyi-common-core\pom.xml
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- resources:3.3.1:resources (default-resources) @ ruoyi-common-core ---
[INFO] Copying 1 resource from src\main\resources to target\classes
[INFO] Copying 0 resource from src\main\resources to target\classes
[INFO]
[INFO] --- flatten:1.3.0:flatten (flatten) @ ruoyi-common-core ---
[INFO] Generating flattened POM of project org.dromara:ruoyi-common-core:jar:5.6.1...
[INFO]
[INFO] --- compiler:3.14.0:compile (default-compile) @ ruoyi-common-core ---
[INFO] Nothing to compile - all classes are up to date.
[INFO]
[INFO] --- resources:3.3.1:testResources (default-testResources) @ ruoyi-common-core ---
[INFO] skip non existing resourceDirectory D:\OtherProject\CameraApp\yingyue-cloud-repo\backend\ruoyi-common\ruoyi-common-core\src\test\resources
[INFO]
[INFO] --- compiler:3.14.0:testCompile (default-testCompile) @ ruoyi-common-core ---
[INFO] No sources to compile
[INFO]
[INFO] --- surefire:3.5.3:test (default-test) @ ruoyi-common-core ---
[INFO] No tests to run.
[INFO]
[INFO] -------------------< org.dromara:ruoyi-common-json >--------------------
[INFO] Building ruoyi-common-json 5.6.1                                  [4/18]
[INFO]   from ruoyi-common\ruoyi-common-json\pom.xml
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- resources:3.3.1:resources (default-resources) @ ruoyi-common-json ---
[INFO] Copying 1 resource from src\main\resources to target\classes
[INFO] Copying 0 resource from src\main\resources to target\classes
[INFO]
[INFO] --- flatten:1.3.0:flatten (flatten) @ ruoyi-common-json ---
[INFO] Generating flattened POM of project org.dromara:ruoyi-common-json:jar:5.6.1...
[INFO]
[INFO] --- compiler:3.14.0:compile (default-compile) @ ruoyi-common-json ---
[INFO] Nothing to compile - all classes are up to date.
[INFO]
[INFO] --- resources:3.3.1:testResources (default-testResources) @ ruoyi-common-json ---
[INFO] skip non existing resourceDirectory D:\OtherProject\CameraApp\yingyue-cloud-repo\backend\ruoyi-common\ruoyi-common-json\src\test\resources
[INFO]
[INFO] --- compiler:3.14.0:testCompile (default-testCompile) @ ruoyi-common-json ---
[INFO] No sources to compile
[INFO]
[INFO] --- surefire:3.5.3:test (default-test) @ ruoyi-common-json ---
[INFO] No tests to run.
[INFO]
[INFO] -------------------< org.dromara:ruoyi-common-redis >-------------------
[INFO] Building ruoyi-common-redis 5.6.1                                 [5/18]
[INFO]   from ruoyi-common\ruoyi-common-redis\pom.xml
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- resources:3.3.1:resources (default-resources) @ ruoyi-common-redis ---
[INFO] Copying 1 resource from src\main\resources to target\classes
[INFO] Copying 0 resource from src\main\resources to target\classes
[INFO]
[INFO] --- flatten:1.3.0:flatten (flatten) @ ruoyi-common-redis ---
[INFO] Generating flattened POM of project org.dromara:ruoyi-common-redis:jar:5.6.1...
[INFO]
[INFO] --- compiler:3.14.0:compile (default-compile) @ ruoyi-common-redis ---
[INFO] Nothing to compile - all classes are up to date.
[INFO]
[INFO] --- resources:3.3.1:testResources (default-testResources) @ ruoyi-common-redis ---
[INFO] skip non existing resourceDirectory D:\OtherProject\CameraApp\yingyue-cloud-repo\backend\ruoyi-common\ruoyi-common-redis\src\test\resources
[INFO]
[INFO] --- compiler:3.14.0:testCompile (default-testCompile) @ ruoyi-common-redis ---
[INFO] No sources to compile
[INFO]
[INFO] --- surefire:3.5.3:test (default-test) @ ruoyi-common-redis ---
[INFO] No tests to run.
[INFO]
[INFO] ----------------< org.dromara:ruoyi-common-ratelimiter >----------------
[INFO] Building ruoyi-common-ratelimiter 5.6.1                           [6/18]
[INFO]   from ruoyi-common\ruoyi-common-ratelimiter\pom.xml
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- resources:3.3.1:resources (default-resources) @ ruoyi-common-ratelimiter ---
[INFO] Copying 2 resources from src\main\resources to target\classes
[INFO] Copying 0 resource from src\main\resources to target\classes
[INFO]
[INFO] --- flatten:1.3.0:flatten (flatten) @ ruoyi-common-ratelimiter ---
[INFO] Generating flattened POM of project org.dromara:ruoyi-common-ratelimiter:jar:5.6.1...
[INFO]
[INFO] --- compiler:3.14.0:compile (default-compile) @ ruoyi-common-ratelimiter ---
[INFO] Nothing to compile - all classes are up to date.
[INFO]
[INFO] --- resources:3.3.1:testResources (default-testResources) @ ruoyi-common-ratelimiter ---
[INFO] skip non existing resourceDirectory D:\OtherProject\CameraApp\yingyue-cloud-repo\backend\ruoyi-common\ruoyi-common-ratelimiter\src\test\resources
[INFO]
[INFO] --- compiler:3.14.0:testCompile (default-testCompile) @ ruoyi-common-ratelimiter ---
[INFO] No sources to compile
[INFO]
[INFO] --- surefire:3.5.3:test (default-test) @ ruoyi-common-ratelimiter ---
[INFO] No tests to run.
[INFO]
[INFO] ------------------< org.dromara:ruoyi-common-satoken >------------------
[INFO] Building ruoyi-common-satoken 5.6.1                               [7/18]
[INFO]   from ruoyi-common\ruoyi-common-satoken\pom.xml
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- resources:3.3.1:resources (default-resources) @ ruoyi-common-satoken ---
[INFO] Copying 2 resources from src\main\resources to target\classes
[INFO] Copying 0 resource from src\main\resources to target\classes
[INFO]
[INFO] --- flatten:1.3.0:flatten (flatten) @ ruoyi-common-satoken ---
[INFO] Generating flattened POM of project org.dromara:ruoyi-common-satoken:jar:5.6.1...
[INFO]
[INFO] --- compiler:3.14.0:compile (default-compile) @ ruoyi-common-satoken ---
[INFO] Nothing to compile - all classes are up to date.
[INFO]
[INFO] --- resources:3.3.1:testResources (default-testResources) @ ruoyi-common-satoken ---
[INFO] skip non existing resourceDirectory D:\OtherProject\CameraApp\yingyue-cloud-repo\backend\ruoyi-common\ruoyi-common-satoken\src\test\resources
[INFO]
[INFO] --- compiler:3.14.0:testCompile (default-testCompile) @ ruoyi-common-satoken ---
[INFO] No sources to compile
[INFO]
[INFO] --- surefire:3.5.3:test (default-test) @ ruoyi-common-satoken ---
[INFO] No tests to run.
[INFO]
[INFO] ------------------< org.dromara:ruoyi-common-mybatis >------------------
[INFO] Building ruoyi-common-mybatis 5.6.1                               [8/18]
[INFO]   from ruoyi-common\ruoyi-common-mybatis\pom.xml
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- resources:3.3.1:resources (default-resources) @ ruoyi-common-mybatis ---
[INFO] Copying 3 resources from src\main\resources to target\classes
[INFO] Copying 0 resource from src\main\resources to target\classes
[INFO]
[INFO] --- flatten:1.3.0:flatten (flatten) @ ruoyi-common-mybatis ---
[INFO] Generating flattened POM of project org.dromara:ruoyi-common-mybatis:jar:5.6.1...
[INFO]
[INFO] --- compiler:3.14.0:compile (default-compile) @ ruoyi-common-mybatis ---
[INFO] Nothing to compile - all classes are up to date.
[INFO]
[INFO] --- resources:3.3.1:testResources (default-testResources) @ ruoyi-common-mybatis ---
[INFO] skip non existing resourceDirectory D:\OtherProject\CameraApp\yingyue-cloud-repo\backend\ruoyi-common\ruoyi-common-mybatis\src\test\resources
[INFO]
[INFO] --- compiler:3.14.0:testCompile (default-testCompile) @ ruoyi-common-mybatis ---
[INFO] No sources to compile
[INFO]
[INFO] --- surefire:3.5.3:test (default-test) @ ruoyi-common-mybatis ---
[INFO] No tests to run.
[INFO]
[INFO] --------------------< org.dromara:ruoyi-common-oss >--------------------
[INFO] Building ruoyi-common-oss 5.6.1                                   [9/18]
[INFO]   from ruoyi-common\ruoyi-common-oss\pom.xml
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- resources:3.3.1:resources (default-resources) @ ruoyi-common-oss ---
[INFO] skip non existing resourceDirectory D:\OtherProject\CameraApp\yingyue-cloud-repo\backend\ruoyi-common\ruoyi-common-oss\src\main\resources
[INFO] skip non existing resourceDirectory D:\OtherProject\CameraApp\yingyue-cloud-repo\backend\ruoyi-common\ruoyi-common-oss\src\main\resources
[INFO]
[INFO] --- flatten:1.3.0:flatten (flatten) @ ruoyi-common-oss ---
[INFO] Generating flattened POM of project org.dromara:ruoyi-common-oss:jar:5.6.1...
[INFO]
[INFO] --- compiler:3.14.0:compile (default-compile) @ ruoyi-common-oss ---
[INFO] Nothing to compile - all classes are up to date.
[INFO]
[INFO] --- resources:3.3.1:testResources (default-testResources) @ ruoyi-common-oss ---
[INFO] skip non existing resourceDirectory D:\OtherProject\CameraApp\yingyue-cloud-repo\backend\ruoyi-common\ruoyi-common-oss\src\test\resources
[INFO]
[INFO] --- compiler:3.14.0:testCompile (default-testCompile) @ ruoyi-common-oss ---
[INFO] No sources to compile
[INFO]
[INFO] --- surefire:3.5.3:test (default-test) @ ruoyi-common-oss ---
[INFO] No tests to run.
[INFO]
[INFO] --------------------< org.dromara:ruoyi-common-log >--------------------
[INFO] Building ruoyi-common-log 5.6.1                                  [10/18]
[INFO]   from ruoyi-common\ruoyi-common-log\pom.xml
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- resources:3.3.1:resources (default-resources) @ ruoyi-common-log ---
[INFO] Copying 1 resource from src\main\resources to target\classes
[INFO] Copying 0 resource from src\main\resources to target\classes
[INFO]
[INFO] --- flatten:1.3.0:flatten (flatten) @ ruoyi-common-log ---
[INFO] Generating flattened POM of project org.dromara:ruoyi-common-log:jar:5.6.1...
[INFO]
[INFO] --- compiler:3.14.0:compile (default-compile) @ ruoyi-common-log ---
[INFO] Nothing to compile - all classes are up to date.
[INFO]
[INFO] --- resources:3.3.1:testResources (default-testResources) @ ruoyi-common-log ---
[INFO] skip non existing resourceDirectory D:\OtherProject\CameraApp\yingyue-cloud-repo\backend\ruoyi-common\ruoyi-common-log\src\test\resources
[INFO]
[INFO] --- compiler:3.14.0:testCompile (default-testCompile) @ ruoyi-common-log ---
[INFO] No sources to compile
[INFO]
[INFO] --- surefire:3.5.3:test (default-test) @ ruoyi-common-log ---
[INFO] No tests to run.
[INFO]
[INFO] -------------------< org.dromara:ruoyi-common-excel >-------------------
[INFO] Building ruoyi-common-excel 5.6.1                                [11/18]
[INFO]   from ruoyi-common\ruoyi-common-excel\pom.xml
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- resources:3.3.1:resources (default-resources) @ ruoyi-common-excel ---
[INFO] skip non existing resourceDirectory D:\OtherProject\CameraApp\yingyue-cloud-repo\backend\ruoyi-common\ruoyi-common-excel\src\main\resources
[INFO] skip non existing resourceDirectory D:\OtherProject\CameraApp\yingyue-cloud-repo\backend\ruoyi-common\ruoyi-common-excel\src\main\resources
[INFO]
[INFO] --- flatten:1.3.0:flatten (flatten) @ ruoyi-common-excel ---
[INFO] Generating flattened POM of project org.dromara:ruoyi-common-excel:jar:5.6.1...
[INFO]
[INFO] --- compiler:3.14.0:compile (default-compile) @ ruoyi-common-excel ---
[INFO] Nothing to compile - all classes are up to date.
[INFO]
[INFO] --- resources:3.3.1:testResources (default-testResources) @ ruoyi-common-excel ---
[INFO] skip non existing resourceDirectory D:\OtherProject\CameraApp\yingyue-cloud-repo\backend\ruoyi-common\ruoyi-common-excel\src\test\resources
[INFO]
[INFO] --- compiler:3.14.0:testCompile (default-testCompile) @ ruoyi-common-excel ---
[INFO] No sources to compile
[INFO]
[INFO] --- surefire:3.5.3:test (default-test) @ ruoyi-common-excel ---
[INFO] No tests to run.
[INFO]
[INFO] ------------------< org.dromara:ruoyi-common-tenant >-------------------
[INFO] Building ruoyi-common-tenant 5.6.1                               [12/18]
[INFO]   from ruoyi-common\ruoyi-common-tenant\pom.xml
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- resources:3.3.1:resources (default-resources) @ ruoyi-common-tenant ---
[INFO] Copying 1 resource from src\main\resources to target\classes
[INFO] Copying 0 resource from src\main\resources to target\classes
[INFO]
[INFO] --- flatten:1.3.0:flatten (flatten) @ ruoyi-common-tenant ---
[INFO] Generating flattened POM of project org.dromara:ruoyi-common-tenant:jar:5.6.1...
[INFO]
[INFO] --- compiler:3.14.0:compile (default-compile) @ ruoyi-common-tenant ---
[INFO] Nothing to compile - all classes are up to date.
[INFO]
[INFO] --- resources:3.3.1:testResources (default-testResources) @ ruoyi-common-tenant ---
[INFO] skip non existing resourceDirectory D:\OtherProject\CameraApp\yingyue-cloud-repo\backend\ruoyi-common\ruoyi-common-tenant\src\test\resources
[INFO]
[INFO] --- compiler:3.14.0:testCompile (default-testCompile) @ ruoyi-common-tenant ---
[INFO] No sources to compile
[INFO]
[INFO] --- surefire:3.5.3:test (default-test) @ ruoyi-common-tenant ---
[INFO] No tests to run.
[INFO]
[INFO] -----------------< org.dromara:ruoyi-common-security >------------------
[INFO] Building ruoyi-common-security 5.6.1                             [13/18]
[INFO]   from ruoyi-common\ruoyi-common-security\pom.xml
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- resources:3.3.1:resources (default-resources) @ ruoyi-common-security ---
[INFO] Copying 1 resource from src\main\resources to target\classes
[INFO] Copying 0 resource from src\main\resources to target\classes
[INFO]
[INFO] --- flatten:1.3.0:flatten (flatten) @ ruoyi-common-security ---
[INFO] Generating flattened POM of project org.dromara:ruoyi-common-security:jar:5.6.1...
[INFO]
[INFO] --- compiler:3.14.0:compile (default-compile) @ ruoyi-common-security ---
[INFO] Nothing to compile - all classes are up to date.
[INFO]
[INFO] --- resources:3.3.1:testResources (default-testResources) @ ruoyi-common-security ---
[INFO] skip non existing resourceDirectory D:\OtherProject\CameraApp\yingyue-cloud-repo\backend\ruoyi-common\ruoyi-common-security\src\test\resources
[INFO]
[INFO] --- compiler:3.14.0:testCompile (default-testCompile) @ ruoyi-common-security ---
[INFO] No sources to compile
[INFO]
[INFO] --- surefire:3.5.3:test (default-test) @ ruoyi-common-security ---
[INFO] No tests to run.
[INFO]
[INFO] --------------------< org.dromara:ruoyi-common-web >--------------------
[INFO] Building ruoyi-common-web 5.6.1                                  [14/18]
[INFO]   from ruoyi-common\ruoyi-common-web\pom.xml
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- resources:3.3.1:resources (default-resources) @ ruoyi-common-web ---
[INFO] Copying 1 resource from src\main\resources to target\classes
[INFO] Copying 0 resource from src\main\resources to target\classes
[INFO]
[INFO] --- flatten:1.3.0:flatten (flatten) @ ruoyi-common-web ---
[INFO] Generating flattened POM of project org.dromara:ruoyi-common-web:jar:5.6.1...
[INFO]
[INFO] --- compiler:3.14.0:compile (default-compile) @ ruoyi-common-web ---
[INFO] Nothing to compile - all classes are up to date.
[INFO]
[INFO] --- resources:3.3.1:testResources (default-testResources) @ ruoyi-common-web ---
[INFO] skip non existing resourceDirectory D:\OtherProject\CameraApp\yingyue-cloud-repo\backend\ruoyi-common\ruoyi-common-web\src\test\resources
[INFO]
[INFO] --- compiler:3.14.0:testCompile (default-testCompile) @ ruoyi-common-web ---
[INFO] No sources to compile
[INFO]
[INFO] --- surefire:3.5.3:test (default-test) @ ruoyi-common-web ---
[INFO] No tests to run.
[INFO]
[INFO] ----------------< org.dromara:ruoyi-common-idempotent >-----------------
[INFO] Building ruoyi-common-idempotent 5.6.1                           [15/18]
[INFO]   from ruoyi-common\ruoyi-common-idempotent\pom.xml
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- resources:3.3.1:resources (default-resources) @ ruoyi-common-idempotent ---
[INFO] Copying 1 resource from src\main\resources to target\classes
[INFO] Copying 0 resource from src\main\resources to target\classes
[INFO]
[INFO] --- flatten:1.3.0:flatten (flatten) @ ruoyi-common-idempotent ---
[INFO] Generating flattened POM of project org.dromara:ruoyi-common-idempotent:jar:5.6.1...
[INFO]
[INFO] --- compiler:3.14.0:compile (default-compile) @ ruoyi-common-idempotent ---
[INFO] Nothing to compile - all classes are up to date.
[INFO]
[INFO] --- resources:3.3.1:testResources (default-testResources) @ ruoyi-common-idempotent ---
[INFO] skip non existing resourceDirectory D:\OtherProject\CameraApp\yingyue-cloud-repo\backend\ruoyi-common\ruoyi-common-idempotent\src\test\resources
[INFO]
[INFO] --- compiler:3.14.0:testCompile (default-testCompile) @ ruoyi-common-idempotent ---
[INFO] No sources to compile
[INFO]
[INFO] --- surefire:3.5.3:test (default-test) @ ruoyi-common-idempotent ---
[INFO] No tests to run.
[INFO]
[INFO] ------------------< org.dromara:ruoyi-common-encrypt >------------------
[INFO] Building ruoyi-common-encrypt 5.6.1                              [16/18]
[INFO]   from ruoyi-common\ruoyi-common-encrypt\pom.xml
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- resources:3.3.1:resources (default-resources) @ ruoyi-common-encrypt ---
[INFO] Copying 1 resource from src\main\resources to target\classes
[INFO] Copying 0 resource from src\main\resources to target\classes
[INFO]
[INFO] --- flatten:1.3.0:flatten (flatten) @ ruoyi-common-encrypt ---
[INFO] Generating flattened POM of project org.dromara:ruoyi-common-encrypt:jar:5.6.1...
[INFO]
[INFO] --- compiler:3.14.0:compile (default-compile) @ ruoyi-common-encrypt ---
[INFO] Nothing to compile - all classes are up to date.
[INFO]
[INFO] --- resources:3.3.1:testResources (default-testResources) @ ruoyi-common-encrypt ---
[INFO] skip non existing resourceDirectory D:\OtherProject\CameraApp\yingyue-cloud-repo\backend\ruoyi-common\ruoyi-common-encrypt\src\test\resources
[INFO]
[INFO] --- compiler:3.14.0:testCompile (default-testCompile) @ ruoyi-common-encrypt ---
[INFO] No sources to compile
[INFO]
[INFO] --- surefire:3.5.3:test (default-test) @ ruoyi-common-encrypt ---
[INFO] No tests to run.
[INFO]
[INFO] ---------------------< org.dromara:ruoyi-modules >----------------------
[INFO] Building ruoyi-modules 5.6.1                                     [17/18]
[INFO]   from ruoyi-modules\pom.xml
[INFO] --------------------------------[ pom ]---------------------------------
[INFO]
[INFO] --- flatten:1.3.0:flatten (flatten) @ ruoyi-modules ---
[INFO] Generating flattened POM of project org.dromara:ruoyi-modules:pom:5.6.1...
[INFO]
[INFO] ------------------------< org.dromara:ruoyi-yy >------------------------
[INFO] Building ruoyi-yy 5.6.1                                          [18/18]
[INFO]   from ruoyi-modules\ruoyi-yy\pom.xml
[INFO] --------------------------------[ jar ]---------------------------------
[INFO]
[INFO] --- resources:3.3.1:resources (default-resources) @ ruoyi-yy ---
[INFO] Copying 11 resources from src\main\resources to target\classes
[INFO] Copying 0 resource from src\main\resources to target\classes
[INFO]
[INFO] --- flatten:1.3.0:flatten (flatten) @ ruoyi-yy ---
[INFO] Generating flattened POM of project org.dromara:ruoyi-yy:jar:5.6.1...
[INFO]
[INFO] --- compiler:3.14.0:compile (default-compile) @ ruoyi-yy ---
[INFO] Nothing to compile - all classes are up to date.
[INFO]
[INFO] --- resources:3.3.1:testResources (default-testResources) @ ruoyi-yy ---
[INFO] skip non existing resourceDirectory D:\OtherProject\CameraApp\yingyue-cloud-repo\backend\ruoyi-modules\ruoyi-yy\src\test\resources
[INFO]
[INFO] --- compiler:3.14.0:testCompile (default-testCompile) @ ruoyi-yy ---
[INFO] Nothing to compile - all classes are up to date.
[INFO]
[INFO] --- surefire:3.5.3:test (default-test) @ ruoyi-yy ---
[INFO] Using auto detected provider org.apache.maven.surefire.junitplatform.JUnitPlatformProvider
[INFO]
[INFO] -------------------------------------------------------
[INFO]  T E S T S
[INFO] -------------------------------------------------------
[INFO] Running org.dromara.yy.service.impl.YyClientPhotoServiceImplTest
OpenJDK 64-Bit Server VM warning: Sharing is only supported for boot loader classes because bootstrap classpath has been appended
[INFO] Tests run: 14, Failures: 0, Errors: 0, Skipped: 0, Time elapsed: 13.94 s -- in org.dromara.yy.service.impl.YyClientPhotoServiceImplTest
[INFO]
[INFO] Results:
[INFO]
[INFO] Tests run: 14, Failures: 0, Errors: 0, Skipped: 0
[INFO]
[INFO] ------------------------------------------------------------------------
[INFO] Reactor Summary for RuoYi-Vue-Plus 5.6.1:
[INFO]
[INFO] RuoYi-Vue-Plus ..................................... SUCCESS [  1.457 s]
[INFO] ruoyi-common ....................................... SUCCESS [  0.162 s]
[INFO] ruoyi-common-core .................................. SUCCESS [  1.617 s]
[INFO] ruoyi-common-json .................................. SUCCESS [  0.254 s]
[INFO] ruoyi-common-redis ................................. SUCCESS [  0.859 s]
[INFO] ruoyi-common-ratelimiter ........................... SUCCESS [  0.269 s]
[INFO] ruoyi-common-satoken ............................... SUCCESS [  0.379 s]
[INFO] ruoyi-common-mybatis ............................... SUCCESS [  0.489 s]
[INFO] ruoyi-common-oss ................................... SUCCESS [  0.559 s]
[INFO] ruoyi-common-log ................................... SUCCESS [  0.219 s]
[INFO] ruoyi-common-excel ................................. SUCCESS [  0.300 s]
[INFO] ruoyi-common-tenant ................................ SUCCESS [  0.271 s]
[INFO] ruoyi-common-security .............................. SUCCESS [  0.313 s]
[INFO] ruoyi-common-web ................................... SUCCESS [  0.582 s]
[INFO] ruoyi-common-idempotent ............................ SUCCESS [  0.273 s]
[INFO] ruoyi-common-encrypt ............................... SUCCESS [  0.340 s]
[INFO] ruoyi-modules ...................................... SUCCESS [  0.146 s]
[INFO] ruoyi-yy ........................................... SUCCESS [ 18.352 s]
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  28.335 s
[INFO] Finished at: 2026-06-10T22:15:00+08:00
[INFO] ------------------------------------------------------------------------
<== backend client photo unit tests passed in 32.2s

photo pickup local acceptance: passed
exit_code: 0
finished: 2026-06-10 22:15:00
```

### 3. JSON 摘要校验

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\verify-photo-pickup-real-oss-summary.ps1 -SummaryJsonPath "D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\evidence\photo-pickup-real-oss-acceptance-20260610-221129.json"
```

预期：

```text
real OSS evidence summary: passed
```

### 4. 最终发布前校验

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\verify-photo-pickup-real-oss-summary.ps1 -SummaryJsonPath "D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\evidence\photo-pickup-real-oss-acceptance-20260610-221129.json" -RequireFinalPass
```

说明：只有自动命令通过且已执行 -ConfirmManualAcceptance 后，本命令才会通过。

### 5. 发布状态 JSON

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\get-photo-pickup-release-status.ps1 -OutputJsonPath "D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\evidence\photo-pickup-release-status.json"
```

说明：生成本证据后会自动更新该状态文件，供 CI、部署包或其他 agent 读取。

## 小程序导入和域名

| 平台 | 项 | 值 | 结果 |
| --- | --- | --- | --- |
| 微信 | 导入目录 | D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-weixin | <PASS/FAIL> |
| 微信 | request 合法域名 | https://api.evanshine.me | <PASS/FAIL> |
| 微信 | uploadFile 合法域名 | https://api.evanshine.me | <PASS/FAIL> |
| 微信 | downloadFile 合法域名 | https://api.evanshine.me | <PASS/FAIL> |
| 抖音 | 导入目录 | D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao | <PASS/FAIL> |
| 抖音 | request 合法域名 | https://api.evanshine.me | <PASS/FAIL> |
| 抖音 | uploadFile 合法域名 | https://api.evanshine.me | <PASS/FAIL> |
| 抖音 | downloadFile 合法域名 | https://api.evanshine.me | <PASS/FAIL> |

## 页面验收

| 场景 | 通过标准 | 结果 |
| --- | --- | --- |
| H5 登录 | 手机号 + 取片码进入相册 | <PASS/FAIL> |
| H5 相册目录 | 真实图缩略图可见 | <PASS/FAIL> |
| H5 预览 | 原图可预览，错误态清晰 | <PASS/FAIL> |
| H5 下载 | 下载成功，URL 不暴露 client_token | <PASS/FAIL> |
| 微信开发者工具 | 登录、相册、预览可用 | <PASS/FAIL> |
| 微信真机 | 保存图片可用 | <PASS/FAIL> |
| 抖音开发者工具 | 登录、相册、预览可用 | <PASS/FAIL> |
| 抖音真机 | 保存图片可用 | <PASS/FAIL> |

## 后台审计

| 动作 | 通过标准 | 结果 |
| --- | --- | --- |
| VERIFY | 登录动作有成功日志 | <PASS/FAIL> |
| ALBUM_DETAIL | 打开相册目录有成功日志 | <PASS/FAIL> |
| PREVIEW | 生成预览 URL 有成功日志 | <PASS/FAIL> |
| DOWNLOAD | 下载 URL 或下载动作有成功日志 | <PASS/FAIL> |
| STREAM | 后端图片流有成功日志 | <PASS/FAIL> |
| 失败日志 | 如果失败，原因能区分无权限、过期、对象不存在、OSS 读取失败 | <PASS/FAIL> |

## 判定

| 项 | 状态 |
| --- | --- |
| 私有 OSS 裸链 403 | <PASS/FAIL> |
| 签名 URL 可用 | <PASS/FAIL> |
| /stream 可用 | <PASS/FAIL> |
| H5 可用 | <PASS/FAIL> |
| 微信可用 | <PASS/FAIL> |
| 抖音可用 | <PASS/FAIL> |
| 后台审计可追踪 | <PASS/FAIL> |
