# Studio Workbench Backend Photo Store Scope Deploy - 2026-06-19

## Result

Backend deployment completed on Hong Kong 2.

This release adds backend store-scope guards for staff-side photo management APIs:

- normal staff users are restricted to their bound `yy_employee_store` stores;
- `yy_employee.store_id` is used as fallback when no binding rows exist;
- super admin and tenant admin accounts keep global scope;
- no-login internal calls keep previous unrestricted behavior for sync, batch tasks, and order-driven album placeholder creation.

Customer public photo pickup APIs under `/client/photo/*` were not changed and still use the existing customer pickup authorization flow.

## Release

```text
branch: yingyue-closed-loop-optimization-20260603
commit: 0f654c47a419f29e6039130bd8eb38154e9a8a47
short commit: 0f654c4
release: prod-0f654c4-photo-store-scope-backend-20260619-0620
server: 103.24.216.8
service: yingyue-admin.service
runtime jar: /opt/yingyue/backend/ruoyi-admin.jar
backup: /opt/yingyue/backups/prod-0f654c4-photo-store-scope-backend-20260619-0620-pre/ruoyi-admin.jar
release jar: /opt/yingyue/releases/prod-0f654c4-photo-store-scope-backend-20260619-0620/ruoyi-admin.jar
sha256: 2a92268c6047539ab655bbdeca68364a626420ec2d82032b61fddb2f85000af1
```

## Scope

Changed files:

```text
backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyPhotoAlbumServiceImpl.java
backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyPhotoAssetServiceImpl.java
backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyPhotoAccessLogServiceImpl.java
backend/ruoyi-modules/ruoyi-yy/src/test/java/org/dromara/yy/service/impl/YyPhotoAlbumServiceImplTest.java
backend/ruoyi-modules/ruoyi-yy/src/test/java/org/dromara/yy/service/impl/YyPhotoAssetServiceImplTest.java
backend/ruoyi-modules/ruoyi-yy/src/test/java/org/dromara/yy/service/impl/YyPhotoAccessLogServiceImplTest.java
```

Behavior:

- `GET /yy/photoAlbum/list` and export queries now restrict normal staff to bound stores.
- `GET /yy/photoAlbum/{id}` hides out-of-scope albums.
- `GET /yy/photoAlbum/operations-summary` filters album IDs by staff store scope before aggregating assets or failed access logs.
- `POST /yy/photoAlbum/{id}/selection/confirm`, `/deliver`, and `/notify` reject out-of-scope albums.
- `POST/PUT/DELETE /yy/photoAlbum` validates store scope before writes.
- `GET/POST/PUT/DELETE /yy/photoAsset/*` validates `yy_photo_asset.store_id` for staff operations.
- `GET /yy/photoAccessLog/list` and export queries validate `yy_photo_access_log.store_id`.

No database schema changes, no order writes, no inventory writes, no Douyin OpenAPI calls, and no frontend deploy were included in this backend release.

## Local Verification

```text
mvn -pl ruoyi-modules/ruoyi-yy -am "-DskipTests=false" "-Dsurefire.failIfNoSpecifiedTests=false" "-Dtest=YyPhotoAlbumServiceImplTest,YyPhotoAssetServiceImplTest,YyPhotoAccessLogServiceImplTest" test
Tests run: 15, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS

mvn -pl ruoyi-modules/ruoyi-yy -am "-DskipTests=false" "-Dsurefire.failIfNoSpecifiedTests=false" "-Dtest=YyOrderServiceImplTest,YyPhotoAlbumServiceImplTest,YyPhotoAssetServiceImplTest,YyPhotoAccessLogServiceImplTest,YyStudioServiceImplTest,YyEmployeeStoreServiceImplTest" test
Tests run: 56, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS

mvn -pl ruoyi-admin -am -DskipTests package
BUILD SUCCESS
```

`git diff --check` reported only CRLF normalization warnings for changed Java files; no whitespace errors.

## Deployment Verification

```text
sha256sum /opt/yingyue/releases/prod-0f654c4-photo-store-scope-backend-20260619-0620/ruoyi-admin.jar
2a92268c6047539ab655bbdeca68364a626420ec2d82032b61fddb2f85000af1

systemctl is-active yingyue-admin.service -> active
http://127.0.0.1:8080/ -> 200 after startup retry
http://127.0.0.1:8080/auth/code -> 200
https://api.evanshine.me/ -> 200
https://api.evanshine.me/prod-api/ -> 200
https://studio.evanshine.me/login -> 200
https://studio.evanshine.me/service/photos -> 200
```

Unauthenticated staff photo API probe:

```text
https://api.evanshine.me/yy/photoAlbum/list?pageNum=1&pageSize=1&storeId=900000000000000100
http_status=200
json_code=401
message=认证失败，无法访问系统资源
```

This confirms the staff photo API route exists and still requires authentication.

## Notes

- Immediately after restart, `127.0.0.1:8080` was not bound while Spring Boot was still starting. A retry loop succeeded on attempt 12.
- This deployment is backend-only. Existing frontend files and untracked visual evidence files in the working tree were not included.
- No sensitive credential, full customer contact value, raw private payload, or platform private value is recorded in this evidence.

## Rollback

```bash
cp /opt/yingyue/backups/prod-0f654c4-photo-store-scope-backend-20260619-0620-pre/ruoyi-admin.jar /opt/yingyue/backend/ruoyi-admin.jar
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
