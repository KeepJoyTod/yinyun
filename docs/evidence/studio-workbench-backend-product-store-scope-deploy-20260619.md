# Studio Workbench Backend Product Store Scope Deploy - 2026-06-19

## Result

Backend deployment completed on Hong Kong 2.

This release adds backend store-scope guards for staff-side product, channel product mapping, and store management APIs:

- normal staff users are restricted to their bound `yy_employee_store` stores;
- `yy_employee.store_id` is used as fallback when no binding rows exist;
- super admin and tenant admin accounts keep global scope;
- no-login internal calls keep previous unrestricted behavior for sync, batch tasks, and public read paths.

Public Douyin Life order-entry reads were not changed. They still use explicit `storeId` and enabled `DOUYIN_LIFE` mappings rather than staff login scope.

## Release

```text
branch: yingyue-closed-loop-optimization-20260603
commit: ba533036636247fef74e023e2ba430f8ee8b65f4
short commit: ba53303
release: prod-ba53303-product-store-scope-backend-20260619-0705
server: 103.24.216.8
service: yingyue-admin.service
runtime jar: /opt/yingyue/backend/ruoyi-admin.jar
backup: /opt/yingyue/backups/prod-ba53303-product-store-scope-backend-20260619-0705-pre/ruoyi-admin.jar
runtime sha256: 158dd138a657cbbd5fdf8c86e779a774e1b9fabf7ef1d4a9290e009dab47a2b1
local jar sha256: 158dd138a657cbbd5fdf8c86e779a774e1b9fabf7ef1d4a9290e009dab47a2b1
backup sha256: 9b2e8de4a800fbf2d6add8cb880fc52d3f5aeed7f966a63617023dafdff6014e
```

## Scope

Changed files:

```text
backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyProductServiceImpl.java
backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyChannelProductMappingServiceImpl.java
backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyStoreServiceImpl.java
backend/ruoyi-modules/ruoyi-yy/src/test/java/org/dromara/yy/service/impl/YyProductServiceImplTest.java
backend/ruoyi-modules/ruoyi-yy/src/test/java/org/dromara/yy/service/impl/YyChannelProductMappingServiceImplTest.java
backend/ruoyi-modules/ruoyi-yy/src/test/java/org/dromara/yy/service/impl/YyStoreServiceImplTest.java
```

Behavior:

- `GET/POST/PUT/DELETE /yy/product/*` validates `yy_product.store_id` for staff operations.
- `GET/POST/PUT/DELETE /yy/channelProductMapping/*` validates `yy_channel_product_mapping.store_id` for staff operations.
- `GET/PUT/DELETE /yy/store/*` validates `yy_store.id` against the employee store scope.
- `POST /yy/store` is rejected for normal staff users.
- Public `DOUYIN_LIFE` order-entry queries keep their existing public read behavior.

No database schema changes, no order writes, no inventory writes, no Douyin OpenAPI calls, and no frontend deploy were included in this backend release.

## Local Verification

```text
mvn -pl ruoyi-modules/ruoyi-yy -am "-DskipTests=false" "-Dsurefire.failIfNoSpecifiedTests=false" "-Dtest=YyProductServiceImplTest,YyChannelProductMappingServiceImplTest,YyStoreServiceImplTest" test
Tests run: 15, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS

mvn -pl ruoyi-modules/ruoyi-yy -am "-DskipTests=false" "-Dsurefire.failIfNoSpecifiedTests=false" "-Dtest=YyOrderServiceImplTest,YyBookingSlotInventoryServiceImplTest,YyScheduleRuleServiceImplTest,YyPhotoAlbumServiceImplTest,YyPhotoAssetServiceImplTest,YyPhotoAccessLogServiceImplTest,YyMerchantMicroPageServiceImplTest,YyMicroFormServiceImplTest,YyMicroFormSubmissionServiceImplTest,YyProductServiceImplTest,YyChannelProductMappingServiceImplTest,YyStoreServiceImplTest,YyStudioServiceImplTest,YyEmployeeStoreServiceImplTest" test
Tests run: 105, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS

mvn -pl ruoyi-admin -am -DskipTests package
BUILD SUCCESS
```

## Deployment Verification

```text
systemctl is-active yingyue-admin.service -> active
sha256sum /opt/yingyue/backend/ruoyi-admin.jar -> 158dd138a657cbbd5fdf8c86e779a774e1b9fabf7ef1d4a9290e009dab47a2b1
https://api.evanshine.me/ -> 200
https://studio.evanshine.me/product/card-management -> 200
https://studio.evanshine.me/product/douyin -> 200
https://studio.evanshine.me/merchant/store -> 200
https://studio.evanshine.me/order/appointment -> 200
https://studio.evanshine.me/dashboard/today -> 200
```

Earlier deploy smoke also verified Spring Boot startup and route recovery after restart. Connection failures during the warm-up window were expected while port `8080` was not yet listening; the final retry returned `200`.

## Notes

- This deployment is backend-only. Existing frontend files and untracked visual evidence files in the working tree were not included.
- Store scope is enforced on the backend; frontend store filters remain experience-layer controls.
- No sensitive credential, full customer contact value, raw private payload, or platform private value is recorded in this evidence.

## Rollback

```bash
cp /opt/yingyue/backups/prod-ba53303-product-store-scope-backend-20260619-0705-pre/ruoyi-admin.jar /opt/yingyue/backend/ruoyi-admin.jar
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
