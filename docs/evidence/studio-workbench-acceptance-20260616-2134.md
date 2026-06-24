# Studio Workbench Acceptance Evidence

GeneratedAt: 2026-06-16 21:32:42 +08:00

## Result

Status:

```text
PASS
```

This deployment only updates the static `studio.evanshine.me` frontend. It does not touch backend services, databases, or secrets.

## Basics

| Item | Value |
| --- | --- |
| BaseUrl | https://studio.evanshine.me |
| Repo | D:\OtherProject\CameraApp\yingyue-cloud-repo |
| Output | D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\evidence\studio-workbench-acceptance-20260616-2134.md |

## Route Probes

| Route | Status | HTTP | URL | Detail |
| --- | --- | --- | --- | --- |
| / | PASS | 200 | https://studio.evanshine.me/ | OK |
| /login | PASS | 200 | https://studio.evanshine.me/login | OK |
| /order/appointment | PASS | 200 | https://studio.evanshine.me/order/appointment | OK |
| /dashboard/today | PASS | 200 | https://studio.evanshine.me/dashboard/today | OK |
| /merchant/store | PASS | 200 | https://studio.evanshine.me/merchant/store | OK |
| /schedule | PASS | 200 | https://studio.evanshine.me/schedule | OK |

## Browser Smoke

| Check | Result |
| --- | --- |
| `https://studio.evanshine.me/login` | PASS |
| `prod-a2ded19-studio-jianyue-20260616` asset present | PASS |
| captcha visible | NO |
| login text visible | YES |

## Deployment

| Item | Value |
| --- | --- |
| Git commit | `a2ded19` |
| Server | `103.24.216.8` |
| Site dir | `/var/www/studio.evanshine.me` |
| Backup dir | `/opt/yingyue/backups/studio-workbench-jianyue-a2ded19-20260616-212643-pre` |
| Remote package | `/opt/yingyue/releases/studio-workbench-jianyue-a2ded19-20260616-212643.zip` |
| Release dir | `/opt/yingyue/releases/studio-workbench-jianyue-a2ded19-20260616-212643` |
| nginx -t | successful |
| nginx reload | successful |

## Next Commands

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
cd studio-workbench
npm test
npm run build
```
