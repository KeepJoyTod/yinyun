# Studio Workbench Backend Schedule Inventory Store Scope Deploy - 2026-06-19

## Result

Backend deployment completed on Hong Kong 2.

This release adds backend store-scope guards for appointment inventory and schedule rules:

- normal staff users are restricted to their bound `yy_employee_store` stores;
- `yy_employee.store_id` is used as fallback when no binding rows exist;
- super admin and tenant admin accounts keep global scope;
- no-login internal calls keep previous unrestricted behavior for sync and batch tasks.

## Release

```text
branch: yingyue-closed-loop-optimization-20260603
commit: d9e3d49c7002eb82b13cedee7472f7bc38773194
short commit: d9e3d49
release: prod-d9e3d49-schedule-inventory-store-scope-backend-20260619-0550
server: 103.24.216.8
service: yingyue-admin.service
runtime jar: /opt/yingyue/backend/ruoyi-admin.jar
backup: /opt/yingyue/backups/prod-d9e3d49-schedule-inventory-store-scope-backend-20260619-0550-pre/ruoyi-admin.jar
release jar: /opt/yingyue/releases/prod-d9e3d49-schedule-inventory-store-scope-backend-20260619-0550/ruoyi-admin.jar
sha256: 4d56b9ab62b879a19ce2620f3dd000955fcd2f71115159f793efa71d24c2d15f
```

## Scope

Changed files:

```text
backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyBookingSlotInventoryServiceImpl.java
backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyScheduleRuleServiceImpl.java
backend/ruoyi-modules/ruoyi-yy/src/test/java/org/dromara/yy/service/impl/YyBookingSlotInventoryServiceImplTest.java
backend/ruoyi-modules/ruoyi-yy/src/test/java/org/dromara/yy/service/impl/YyScheduleRuleServiceImplTest.java
```

Behavior:

- `GET /yy/bookingSlotInventory/list` and page queries now restrict normal staff to bound stores.
- `GET /yy/bookingSlotInventory/{id}` hides out-of-scope inventory.
- `PUT /yy/bookingSlotInventory` rejects updates to out-of-scope inventory.
- `GET /yy/scheduleRule/list` and page queries now restrict normal staff to bound stores.
- `GET /yy/scheduleRule/{id}` hides out-of-scope schedule rules.
- `POST /yy/scheduleRule` rejects creating rules for out-of-scope stores.
- `PUT /yy/scheduleRule` checks both the existing DB rule store and payload store.
- `DELETE /yy/scheduleRule/{ids}` rejects deleting out-of-scope rules.

No database schema changes, no order writes, no inventory count writes, no Douyin OpenAPI calls, and no frontend deploy were included in this backend release.

## Local Verification

```text
mvn -pl ruoyi-modules/ruoyi-yy -am "-DskipTests=false" "-Dsurefire.failIfNoSpecifiedTests=false" "-Dtest=YyOrderServiceImplTest,YyBookingSlotInventoryServiceImplTest,YyScheduleRuleServiceImplTest,YyStudioServiceImplTest,YyEmployeeStoreServiceImplTest" test
Tests run: 60, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS

mvn -pl ruoyi-admin -am -DskipTests package
BUILD SUCCESS
```

`git diff --check` reported only existing CRLF normalization warnings for the changed Java files.

## Deployment Verification

```text
sha256sum /opt/yingyue/releases/prod-d9e3d49-schedule-inventory-store-scope-backend-20260619-0550/ruoyi-admin.jar
4d56b9ab62b879a19ce2620f3dd000955fcd2f71115159f793efa71d24c2d15f

systemctl is-active yingyue-admin.service -> active
http://127.0.0.1:8080/ -> 200
http://127.0.0.1:8080/auth/code -> 200
https://api.evanshine.me/ -> 200
https://api.evanshine.me/prod-api/ -> 200
https://studio.evanshine.me/login -> 200
https://studio.evanshine.me/dashboard/today?date=2026-06-19&storeId=900000000000000100 -> 200
```

## Notes

- First smoke check hit the normal Spring Boot startup window: systemd already showed `active`, but `127.0.0.1:8080` was not bound yet. A condition-based retry returned `200`.
- During service stop, journal contained an old shutdown-hook logback class warning. The previous process exited successfully and the new process started normally.
- An accidental first backup command created `/opt/yingyue/backups/-pre/ruoyi-admin.jar` because the shell variable was expanded by local PowerShell before reaching SSH. The correct backup path above was then created and used. Runtime jar was not replaced until the correct release path was ready.

## Rollback

```bash
cp /opt/yingyue/backups/prod-d9e3d49-schedule-inventory-store-scope-backend-20260619-0550-pre/ruoyi-admin.jar /opt/yingyue/backend/ruoyi-admin.jar
chown yingyue:yingyue /opt/yingyue/backend/ruoyi-admin.jar
chmod 0644 /opt/yingyue/backend/ruoyi-admin.jar
systemctl restart yingyue-admin.service
```

After rollback, run:

```bash
systemctl is-active yingyue-admin.service
curl -fsS http://127.0.0.1:8080/ >/dev/null
curl -fsS https://api.evanshine.me/ >/dev/null
```
