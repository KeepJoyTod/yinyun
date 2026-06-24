# Studio Workbench Acceptance Evidence

GeneratedAt: 2026-06-16 09:13:12 +08:00

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
| Output | D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\evidence\studio-workbench-acceptance-20260616-091311.md |

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
| Login | Staff login form is in the side/work area; errors do not block layout | `<PASS/FAIL>` |
| Dashboard | Today metrics, channel sync, and photo issue entry are readable | `<PASS/FAIL>` |
| Orders | Today queue, reschedule precheck, export boundary, and diagnostic package are usable | `<PASS/FAIL>` |
| Photos | Upload, batch selection, rename/delete refresh, and copyable errors are usable | `<PASS/FAIL>` |
| Channel Verification | Acceptance cases, recent logid, and diagnostic package are usable | `<PASS/FAIL>` |
| Settings | Runtime mode, permission boundary, and staff entry notes are clear | `<PASS/FAIL>` |

## Next Commands

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
cd studio-workbench
npm test
npm run build
```