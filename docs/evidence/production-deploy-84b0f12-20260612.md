# Production Deploy Evidence - 84b0f12

Date: 2026-06-12

## Scope

- Backend only: `ruoyi-admin.jar`
- Server: Hong Kong 2, `103.24.216.8`
- Service: `yingyue-admin.service`
- Release commit: `84b0f12`

## Deployment

- Release dir: `/opt/yingyue/releases/84b0f12`
- Runtime jar: `/opt/yingyue/backend/ruoyi-admin.jar`
- Backup before deploy: `/opt/yingyue/backups/20260612-162252-pre-84b0f12`
- Deployed jar SHA256: `eaf5f0ad9a49019ce2cfadff0a45041e5572d1f57a83c7811230022726f90b03`
- Service status after restart: `active`

## Verification

- Targeted backend tests: passed, `Tests run: 5, Failures: 0, Errors: 0`
- Backend package: `mvn -pl ruoyi-admin -am -DskipTests package` passed
- Deploy package verifier: PASS
- Production preflight: PASS
- Platform readiness: PASS
- Admin captcha: `https://admin.evanshine.me/prod-api/captchaImage` returned `200 application/json`

## Douyin Life Auto Sync

- `yy_channel_sync_log` auto-sync count after deploy: `5`
- Latest `life_order_auto_sync` result:
  - success: `1`
  - sync status: `SYNCED`
  - total: `1000`
  - created: `0`
  - updated: `1000`
  - failed: `0`
  - OpenAPI logid: `20260612162537B71E901E5934AD6D5A3B`
  - created time: `2026-06-12 16:25:40`

Relevant service log:

```text
抖音来客自动同步配置: enabled=true, initialDelayMs=60000, fixedDelayMs=300000, windowMinutes=30, overlapMinutes=10, pageSize=50
抖音来客自动同步开始
抖音来客自动同步完成: status=SYNCED, total=1000, created=0, updated=1000, failed=0, logid=20260612162537B71E901E5934AD6D5A3B
```

## Notes

- This deploy fixes the business scheduling dependency issue by enabling 影约云 scheduling independently of SnailJob.
- `yingyue-cloud-repo` code commits included:
  - `fc92fb9 fix: enable yy business scheduling`
  - `84b0f12 chore: log douyin auto sync schedule`
