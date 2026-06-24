# Studio Workbench Backend Order Store Scope Deploy - 2026-06-19

## Result

Backend deployment completed on Hong Kong 2.

This release adds a backend guard for `GET /yy/order/list`: normal staff users are restricted to their bound `yy_employee_store` stores, while super admin and tenant admin accounts keep global scope.

## Release

```text
branch: yingyue-closed-loop-optimization-20260603
commit: 03b3847df917e7122fdf79466385ae38351abb28
short commit: 03b3847
release: prod-03b3847-order-store-scope-backend-20260619-0515
server: 103.24.216.8
service: yingyue-admin.service
runtime jar: /opt/yingyue/backend/ruoyi-admin.jar
backup: /opt/yingyue/backups/prod-03b3847-order-store-scope-backend-20260619-0515-pre/ruoyi-admin.jar
release jar: /opt/yingyue/releases/prod-03b3847-order-store-scope-backend-20260619-0515/ruoyi-admin.jar
sha256: acd54f925489421be637dca4148f42dae0ac89356db3560fdc2dea9ee6ccb734
```

## Scope

Changed files:

```text
backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyOrderServiceImpl.java
backend/ruoyi-modules/ruoyi-yy/src/test/java/org/dromara/yy/service/impl/YyOrderServiceImplTest.java
```

Behavior:

- No-login internal calls keep the previous unrestricted behavior.
- Super admin and tenant admin keep global order scope.
- Normal staff users resolve `LoginUser.userId -> yy_employee -> yy_employee_store`.
- If no `yy_employee_store` rows exist, the service falls back to `yy_employee.store_id`.
- Missing scope or out-of-scope requested `storeId` returns an empty result.

No database schema changes, no order writes, no inventory writes, no Douyin OpenAPI calls, and no frontend deploy were included in this backend release.

## Local Verification

```text
mvn -pl ruoyi-modules/ruoyi-yy -am "-DskipTests=false" "-Dsurefire.failIfNoSpecifiedTests=false" "-Dtest=YyOrderServiceImplTest,YyStudioServiceImplTest,YyEmployeeStoreServiceImplTest" test
Tests run: 41, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS

mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests compile
BUILD SUCCESS

mvn -pl ruoyi-admin -am -DskipTests package
BUILD SUCCESS
```

`git diff --check` only reported existing CRLF normalization warnings for the two Java files.

## Deployment Verification

```text
systemctl is-active yingyue-admin.service -> active
http://127.0.0.1:8080/ -> 200
http://127.0.0.1:8080/auth/code -> 200
https://api.evanshine.me/ -> 200
https://api.evanshine.me/prod-api/ -> 200
https://studio.evanshine.me/login -> 200
https://studio.evanshine.me/order/appointment?storeId=900000000000000100&slotDate=2026-06-19&slotStart=13:30&slotEnd=14:00 -> 200
```

Unauthenticated order API probe:

```text
https://api.evanshine.me/yy/order/list?pageNum=1&pageSize=1&storeId=900000000000000100
code=401
message=认证失败，无法访问系统资源
```

This confirms the real API route exists and still requires authentication.

## Notes

- Immediately after restart, public API returned temporary `502` while Spring Boot was still starting. Journal showed startup completed at `2026-06-19 05:17:06 +08:00`; final smoke checks returned `200`.
- Two attempted login-state smoke checks used stale or mismatched local handoff credentials and returned password-error responses. No password or token is recorded here. Further login-state verification should use the currently confirmed workbench account in the browser.
- Redis password-error counters were not cleared because Redis requires authentication and no secret values were read or printed during this evidence pass.

## Rollback

```bash
cp /opt/yingyue/backups/prod-03b3847-order-store-scope-backend-20260619-0515-pre/ruoyi-admin.jar /opt/yingyue/backend/ruoyi-admin.jar
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
