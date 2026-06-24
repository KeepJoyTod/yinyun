# Studio Workbench Closed Loop Deploy 2026-06-17

## Release

```text
git commit: c54894e feat(studio): tighten appointment photo workflows
release: prod-c54894e-closed-loop-20260617-2316
branch: yingyue-closed-loop-optimization-20260603
```

## Scope

Deployed both backend and `studio-workbench` frontend to Hong Kong 2.

Reason: this batch adds backend Java endpoints for photo album actions, so a frontend-only deploy would make the new buttons return 404.

## Local Verification Before Deploy

| Command | Result |
| --- | --- |
| `npm --prefix studio-workbench run test -- src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts src/features/orders/OrdersView.contract.test.ts src/features/orders/orderOperations.test.ts src/features/albums/PhotoMgmtView.contract.test.ts src/features/schedule/scheduleOperations.test.ts src/shared/api/yingyueAdapter.test.ts src/shared/api/backend.contract.test.ts` | 8 files, 152 tests passed |
| `mvn -f backend/pom.xml -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyOrderServiceImplTest,YyBookingSlotInventoryServiceImplTest,YyPhotoAlbumServiceImplTest,YyClientPhotoServiceImplTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test` | BUILD SUCCESS, 62 tests, 0 failures |
| `npm --prefix studio-workbench run build` | Success; existing Vite chunk-size warning only |
| `git diff --check` | Exit 0; CRLF warnings only |

## Build Artifacts

| Artifact | Path |
| --- | --- |
| Backend JAR | `backend/ruoyi-admin/target/ruoyi-admin.jar` |
| Frontend zip | `dist/studio-workbench-prod-c54894e-closed-loop-20260617-2316.zip` |

Frontend build env:

```text
VITE_STUDIO_DEMO=false
VITE_API_BASE_URL=https://api.evanshine.me
VITE_STUDIO_RELEASE_ID=prod-c54894e-closed-loop-20260617-2316
```

## Remote Paths

```text
release: /opt/yingyue/releases/prod-c54894e-closed-loop-20260617-2316
backup:  /opt/yingyue/backups/prod-c54894e-closed-loop-20260617-2316-pre-20260617-232043
old web: /var/www/studio.evanshine.me.bak-prod-c54894e-closed-loop-20260617-2316-20260617-232043
jar:     /opt/yingyue/backend/ruoyi-admin.jar
web:     /var/www/studio.evanshine.me
```

## Deployment Verification

Initial smoke immediately after restart returned `502` for API because Spring Boot was still starting. Startup completed at `2026-06-17 23:21:23 +08:00`.

Final smoke:

```text
systemctl is-active yingyue-admin.service -> active
http://127.0.0.1:8080/ -> 200
https://api.evanshine.me/ -> 200
https://api.evanshine.me/auth/code -> 200
https://studio.evanshine.me/ -> 200
https://studio.evanshine.me/login -> 200
https://studio.evanshine.me/dashboard/today -> 200
https://studio.evanshine.me/order/appointment?quick=all&slotStart=10:00&slotEnd=10:30 -> 200
https://studio.evanshine.me/service/photos -> 200
release marker -> prod-c54894e-closed-loop-20260617-2316
nginx -t -> successful
```

## Rollback

```bash
cp /opt/yingyue/backups/prod-c54894e-closed-loop-20260617-2316-pre-20260617-232043/ruoyi-admin.jar /opt/yingyue/backend/ruoyi-admin.jar
chown yingyue:yingyue /opt/yingyue/backend/ruoyi-admin.jar
chmod 0644 /opt/yingyue/backend/ruoyi-admin.jar
rm -rf /var/www/studio.evanshine.me.rollback-target
mv /var/www/studio.evanshine.me /var/www/studio.evanshine.me.rollback-target
mv /var/www/studio.evanshine.me.bak-prod-c54894e-closed-loop-20260617-2316-20260617-232043 /var/www/studio.evanshine.me
systemctl restart yingyue-admin.service
nginx -t && systemctl reload nginx
```

## Manual Acceptance Still Needed

- Log in with a real staff account and click a dashboard slot to confirm slot details and order drilldown.
- Open an appointment order and test cancel reason validation on a safe non-production-test order only.
- Open photo management and confirm `通知客户` returns fallback/manual-follow-up rather than claiming real SMS delivery.
- Confirm `客片确认` and `资料发送` on an album with safe test assets.
