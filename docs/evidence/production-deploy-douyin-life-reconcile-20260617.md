# Production Deploy: DOUYIN_LIFE 24h Reconcile Sync 2026-06-17

## Scope

Backend only. This deploy adds a low-frequency 24h DOUYIN_LIFE order reconciliation task.

No database schema change, no frontend deploy, no nginx config change, no secret change.

## Paths

```text
runtime jar: /opt/yingyue/backend/ruoyi-admin.jar
release:     /opt/yingyue/releases/douyin-life-reconcile-20260617-1458/ruoyi-admin.jar
backup:      /opt/yingyue/backups/douyin-life-reconcile-20260617-1458-pre/ruoyi-admin.jar
```

## Local Verification Before Deploy

```text
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=YyDouyinLifeAutoSyncServiceTest,YyChannelSyncLogServiceImplTest" "-Dsurefire.failIfNoSpecifiedTests=false" "-DskipTests=false" "-Dmaven.test.skip=false" test

Result: BUILD SUCCESS, tests run: 7, failures: 0, errors: 0
```

Package:

```text
mvn -pl ruoyi-admin -am -DskipTests package

Result: BUILD SUCCESS, produced backend/ruoyi-admin/target/ruoyi-admin.jar
```

## Deploy Verification

Service and public API:

```text
systemctl is-active yingyue-admin.service -> active
https://api.evanshine.me/ -> 200
https://api.evanshine.me/auth/code -> 200
```

Startup config log confirms the reconcile task is enabled:

```text
reconcileEnabled=true
reconcileInitialDelayMs=120000
reconcileFixedDelayMs=86400000
reconcileWindowHours=24
reconcilePageSize=100
reconcileMaxPages=3
reconcileMaxTotal=300
```

First scheduled runs after restart:

```text
15:01:09 auto sync:      SYNCED total=0 created=0 updated=0 failed=0
15:02:10 reconcile sync: SYNCED total=7 created=0 updated=7 failed=0
```

The reconcile run updated existing local orders and did not duplicate-create them.

## Rollback

```bash
cp /opt/yingyue/backups/douyin-life-reconcile-20260617-1458-pre/ruoyi-admin.jar /opt/yingyue/backend/ruoyi-admin.jar
chown yingyue:yingyue /opt/yingyue/backend/ruoyi-admin.jar
chmod 0644 /opt/yingyue/backend/ruoyi-admin.jar
systemctl restart yingyue-admin.service
```
