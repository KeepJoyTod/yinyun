# Studio Workbench Jianyue Booking Workbench Deploy Evidence

Date: 2026-06-17

## Scope

- Release: `prod-efbee61-jianyue-workbench-20260617`
- Commit: `efbee61 feat(studio): align jianyue booking workbench flow`
- Frontend: `studio-workbench/dist` deployed to `https://studio.evanshine.me`
- Backend: `backend/ruoyi-admin/target/ruoyi-admin.jar` deployed to `yingyue-admin.service`

## Artifacts

| Artifact | Size | SHA256 |
| --- | ---: | --- |
| `ruoyi-admin.jar` | `162995003` | `caabc87463231b6d72040ead253b6b3863eef3110647869a66a504295ea9f761` |
| `studio-workbench-prod-efbee61-jianyue-workbench-20260617.zip` | `582273` | `68b5b51afcfe7e0f724c638449129836796cec4fc611d32de63d1e16b494a133` |

Remote upload note: large jar upload was split and reassembled on Hong Kong 2 because the SSH/SFTP connection repeatedly aborted during large single-file transfer. The final remote jar SHA256 matched the local build artifact before deployment.

## Deployment

| Item | Result |
| --- | --- |
| Server | Hong Kong 2 / `103.24.216.8` |
| Frontend path | `/var/www/studio.evanshine.me` |
| Backend jar path | `/opt/yingyue/backend/ruoyi-admin.jar` |
| Backend service | `yingyue-admin.service` |
| Backup path | `/opt/yingyue/backups/prod-efbee61-jianyue-workbench-20260617-20260617-185210` |
| Backend owner | `yingyue:yingyue` |

## Verification

| Check | Result |
| --- | --- |
| `systemctl is-active yingyue-admin.service` | `active` |
| Backend startup log | `影约云企业相馆管理系统启动成功` |
| Backend listen port | `127.0.0.1:8080` |
| `nginx -t` | successful |
| `HEAD https://api.evanshine.me/auth/code` | `200 application/json` |
| `GET https://api.evanshine.me/auth/code` | `200 application/json`, body length `80` |
| `GET https://studio.evanshine.me/order/appointment?quick=all&cb=prod-efbee61-jianyue-workbench-20260617` | `200`, release marker present |

## Notes

- The initial public API probe returned `502` while Spring Boot was still starting after restart. After the application logged startup success and began listening on `127.0.0.1:8080`, the same API probe returned `200`.
- No secrets, tokens, account passwords, raw private payloads, or customer phone numbers were recorded in this evidence.
