# Mobile Miniapp Platform Readiness 2026-06-09

## Result

The current `mobile-uniapp` client and platform readiness checks passed.

Production miniapp import directories:

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-weixin
D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao
```

API domain to fill in WeChat/Douyin miniapp backend:

```text
https://api.evanshine.me
```

## Commands

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm test
npm run typecheck
npm run build:h5
npm run build:mp-weixin
npm run build:mp-toutiao
```

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\yingyue-platform-readiness.ps1
.\tools\yingyue-production-preflight.ps1 -BaseUrl https://api.evanshine.me -PreviewAccount
.\tools\photo-pickup-local-acceptance.ps1 -SkipH5Browser -SkipBackendSmoke -SkipBackendUnit
```

## Evidence

| Check | Result |
| --- | --- |
| `mobile-uniapp npm test` | PASS, 32 tests passed |
| `mobile-uniapp npm run typecheck` | PASS |
| `mobile-uniapp npm run build:h5` | PASS, `DONE Build complete` |
| `mobile-uniapp npm run build:mp-weixin` | PASS, import `dist\build\mp-weixin` |
| `mobile-uniapp npm run build:mp-toutiao` | PASS, import `dist\build\mp-toutiao` |
| API HTTPS domain | PASS, `https://api.evanshine.me` |
| Douyin miniapp AppID | PASS, `mp-toutiao.appid` configured |
| WeChat miniapp AppID | PASS, `mp-weixin.appid` configured |
| Douyin miniapp dist | PASS |
| Douyin miniapp dist files | PASS, `app.js`、`app.json`、`app.ttss`、`project.config.json`、`pages` exist |
| Douyin project config AppID | PASS, `project.config.json` appid matches manifest |
| WeChat miniapp dist | PASS |
| WeChat miniapp dist files | PASS, `app.js`、`app.json`、`app.wxss`、`project.config.json`、`pages` exist |
| WeChat project config AppID | PASS, `project.config.json` appid matches manifest |
| Douyin webhook challenge | PASS, returns JSON and echoes challenge |
| Douyin missing signature probe | PASS, rejected with `error_code=9999` |
| GitHub repo private | PASS, `dengzhekun/yingyue-cloud` |
| Public preview empty-album preflight | PASS, `auth / albums / detail / auth-json-route` |

## Public Preview Preflight

Command:

```powershell
.\tools\yingyue-production-preflight.ps1 -BaseUrl https://api.evanshine.me -PreviewAccount
```

Result:

```text
photo smoke mode: preview-empty
photo smoke account: 13900001111
auth: success
albums: success count=1
albums: selected first albumId=990202606080001
detail: success albumId=990202606080001, assetCount=0
detail: empty album accepted
auth-json-route: success
preflight: passed
```

This proves the public API routing, customer auth, album list, empty album detail, and JSON response shape. It does not replace real-image OSS acceptance.

## 2026-06-09 Readiness Guard Upgrade

`tools\yingyue-platform-readiness.ps1` now checks more than directory existence:

| Miniapp | Required files |
| --- | --- |
| WeChat | `app.js`、`app.json`、`app.wxss`、`project.config.json`、`pages` |
| Douyin | `app.js`、`app.json`、`app.ttss`、`project.config.json`、`pages` |

It also verifies `project.config.json.appid` matches the AppID in `mobile-uniapp/src/manifest.json`.

Verification:

```text
mobile-uniapp npm test -> 32 passed
tools\yingyue-platform-readiness.ps1 -> passed
```

The readiness output now prints the exact developer-tool import directories and legal-domain fill values:

```text
WeChat devtools import: D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-weixin
Douyin devtools import: D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao
WeChat legal domains: request=https://api.evanshine.me; uploadFile=https://api.evanshine.me; downloadFile=https://api.evanshine.me
Douyin legal domains: request=https://api.evanshine.me; uploadFile=https://api.evanshine.me; downloadFile=https://api.evanshine.me
```

## 2026-06-09 Local Acceptance Integration

`tools\photo-pickup-local-acceptance.ps1` now runs platform readiness local checks after H5 / WeChat / Douyin builds, then runs the admin album-management guard by default. The readiness call uses `-SkipNetwork -SkipGithub`, so local acceptance verifies miniapp AppID and build output integrity without depending on external network probes.

Command:

```powershell
.\tools\photo-pickup-local-acceptance.ps1 -SkipH5Browser -SkipBackendSmoke -SkipBackendUnit
```

Result:

```text
mobile typecheck: passed
mobile unit tests: 32 passed
mobile H5 build: passed
mobile WeChat mini build: passed
mobile Douyin mini build: passed
platform readiness local checks: passed
admin yy tests: 49 passed
admin dev build: passed
photo pickup local acceptance: passed
```

## 2026-06-09 Real OSS Evidence Generator

`tools\new-photo-pickup-real-oss-evidence.ps1` now generates a fillable acceptance record for real uploaded images. The generated record includes:

- Production preflight command with `-VerifyBareOssBlocked`.
- Local acceptance command.
- WeChat/Douyin devtools import paths.
- request/uploadFile/downloadFile legal-domain table.
- H5, WeChat, Douyin, and backend audit acceptance tables.
- Optional `-RunPreflight` and `-RunLocalAcceptance` switches to capture sanitized command output.
- Bare OSS URL cleanup: signed query params are stripped before writing the evidence and before running the 403 probe.
- Automatic conclusion: `PASS` when production preflight and local acceptance both pass, `FAIL` when an auto-run command fails, otherwise `PENDING`.

Verification:

```text
mobile-uniapp npm test -> 32 passed
new-photo-pickup-real-oss-evidence.ps1 temp generation -> passed
signed BareOssUrl cleanup -> passed
automatic conclusion default PENDING -> passed
```

Admin guard switches:

```text
-SkipAdminCheck
-SkipAdminBuild
```

## Remaining Manual Items

| Item | Status |
| --- | --- |
| WeChat miniapp request/download/upload domain | Manual, fill `https://api.evanshine.me` |
| Douyin miniapp request/download/upload domain | Manual, fill `https://api.evanshine.me` |
| WeChat devtools import | Manual, import `mobile-uniapp\dist\build\mp-weixin` |
| Douyin devtools import | Manual, import `mobile-uniapp\dist\build\mp-toutiao` |
| Real-device image save | Manual, validate after legal domains are configured |
| Real OSS image acceptance | Pending real uploaded image: bare OSS 403, signed URL, `/stream` |
