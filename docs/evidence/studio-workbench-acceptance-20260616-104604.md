# Studio Workbench Acceptance Evidence

GeneratedAt: 2026-06-16 10:46:05 +08:00

## Result

Status:

```text
READY_FOR_MANUAL_CHECK
```

This script only creates an acceptance evidence skeleton by default. With `-ProbeHttp`, it only probes public page HTTP status. It does not log in, read secrets, or write databases.

## Basics

| Item | Value |
| --- | --- |
| BaseUrl | https://studio.evanshine.me |
| Repo | D:\OtherProject\CameraApp\yingyue-cloud-repo |
| Output | D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\evidence\studio-workbench-acceptance-20260616-104604.md |

## Route Probes

| Route | Status | HTTP | URL | Detail |
| --- | --- | --- | --- | --- |
| / | PASS | 200 | https://studio.evanshine.me/ | OK |
| /login | PASS | 200 | https://studio.evanshine.me/login | OK |
| /order/appointment | PASS | 200 | https://studio.evanshine.me/order/appointment | OK |
| /dashboard/today | PASS | 200 | https://studio.evanshine.me/dashboard/today | OK |
| /settings/logs | PASS | 200 | https://studio.evanshine.me/settings/logs | OK |
| /order/verification | PASS | 200 | https://studio.evanshine.me/order/verification | OK |

## Manual Checks

| Scene | Pass Standard | Result |
| --- | --- | --- |
| Login | Staff login form is in the side/work area; errors do not block layout | `PASS` - browser smoke shows the form in the right side panel, new account/password copy visible, old password+captcha-required copy absent, and no captcha input visible |
| Dashboard | Today metrics, channel sync, and photo issue entry are readable | `BLOCKED_NO_STAFF_SESSION` - public shell route returns 200; login-required real data smoke still needs a valid staff session |
| Orders | Today queue, reschedule precheck, export boundary, and diagnostic package are usable | `BLOCKED_NO_STAFF_SESSION` - public shell route returns 200; login-required order interaction smoke still needs a valid staff session |
| Photos | Upload, batch selection, rename/delete refresh, and copyable errors are usable | `BLOCKED_NO_STAFF_SESSION` - not covered by this route probe |
| Channel Verification | Acceptance cases, recent logid, and diagnostic package are usable | `BLOCKED_NO_STAFF_SESSION` - public shell route returns 200; real logid interaction still needs a valid staff session |
| Settings | Runtime mode, permission boundary, and staff entry notes are clear | `BLOCKED_NO_STAFF_SESSION` - public shell route returns 200; login-required settings data smoke still needs a valid staff session |

## Verification Notes

| Item | Result |
| --- | --- |
| Public route shell probes | `PASS` - `/`, `/login`, `/order/appointment`, `/dashboard/today`, `/settings/logs`, `/order/verification` returned HTTP 200 |
| Release-scoped assets | `PASS` - `index.html` loads `/assets/studio-20260616-1044/index-Cra59_Q-.js` |
| Login layout smoke | `PASS` - staff login form is in the side panel, not at the bottom |
| API-mode captcha wording | `PASS` - copy says current testing flow uses store account/password and captcha is backend-configuration gated |
| Authenticated real-data smoke | `BLOCKED_NO_STAFF_SESSION` - do not mark Dashboard/Orders/Verification as full PASS until a valid staff login session is available |

## Next Commands

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
cd studio-workbench
npm test
npm run build
```
