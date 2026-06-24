# Studio Workbench Acceptance Evidence

GeneratedAt: 2026-06-16 01:38:16 +08:00

## Result

Status:

```text
FAIL
```

This script only creates an acceptance evidence skeleton by default. With `-ProbeHttp`, it only probes public page HTTP status. It does not log in, read secrets, or write databases.

## Basics

| Item | Value |
| --- | --- |
| BaseUrl | https://studio.evanshine.me |
| Repo | D:\OtherProject\CameraApp\yingyue-cloud-repo |
| Output | D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\evidence\studio-workbench-acceptance-20260616-013816.md |

## Route Probes

| Route | Status | HTTP | URL | Detail |
| --- | --- | --- | --- | --- |
| / | FAIL | 0 | https://studio.evanshine.me/ | 无法连接到远程服务器 |
| /login | FAIL | 0 | https://studio.evanshine.me/login | 无法连接到远程服务器 |
| /order/appointment | FAIL | 0 | https://studio.evanshine.me/order/appointment | 无法连接到远程服务器 |
| /dashboard/today | FAIL | 0 | https://studio.evanshine.me/dashboard/today | 无法连接到远程服务器 |
| /settings/logs | FAIL | 0 | https://studio.evanshine.me/settings/logs | 无法连接到远程服务器 |
| /order/verification | FAIL | 0 | https://studio.evanshine.me/order/verification | 无法连接到远程服务器 |

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