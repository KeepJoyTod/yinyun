# Studio Workbench Backend Micro Page/Form Store Scope Deploy - 2026-06-19

## Result

Deployed to Hong Kong 2 for the backend store-scope guard release covering staff-side merchant micro pages, micro forms, and micro form submissions.

This release is backend-only. It does not add database schema, frontend assets, order writes, inventory writes, or Douyin OpenAPI calls.

## Scope

Changed files:

```text
backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyMerchantMicroPageServiceImpl.java
backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyMicroFormServiceImpl.java
backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyMicroFormSubmissionServiceImpl.java
backend/ruoyi-modules/ruoyi-yy/src/test/java/org/dromara/yy/service/impl/YyMerchantMicroPageServiceImplTest.java
backend/ruoyi-modules/ruoyi-yy/src/test/java/org/dromara/yy/service/impl/YyMicroFormServiceImplTest.java
backend/ruoyi-modules/ruoyi-yy/src/test/java/org/dromara/yy/service/impl/YyMicroFormSubmissionServiceImplTest.java
```

Behavior:

- normal staff users are restricted to stores from `yy_employee_store`;
- `yy_employee.store_id` remains the fallback when no active binding rows exist;
- super admin and tenant admin accounts keep global scope;
- no-login calls keep previous unrestricted behavior for public/customer flows and internal jobs;
- public micro page and public micro form APIs are unchanged and do not use employee store scope;
- micro form submissions are scoped through `form_id -> yy_micro_form.store_id` because `yy_micro_form_submission` has no direct `store_id`.

## Local Verification

```text
mvn -pl ruoyi-modules/ruoyi-yy -am "-DskipTests=false" "-Dsurefire.failIfNoSpecifiedTests=false" "-Dtest=YyMerchantMicroPageServiceImplTest,YyMicroFormServiceImplTest,YyMicroFormSubmissionServiceImplTest" test
Tests run: 15, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS

mvn -pl ruoyi-modules/ruoyi-yy -am "-DskipTests=false" "-Dsurefire.failIfNoSpecifiedTests=false" "-Dtest=YyOrderServiceImplTest,YyPhotoAlbumServiceImplTest,YyPhotoAssetServiceImplTest,YyPhotoAccessLogServiceImplTest,YyMerchantMicroPageServiceImplTest,YyMicroFormServiceImplTest,YyMicroFormSubmissionServiceImplTest,YyStudioServiceImplTest,YyEmployeeStoreServiceImplTest" test
Tests run: 71, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS

mvn -pl ruoyi-admin -am -DskipTests package
BUILD SUCCESS
```

## Deployment Verification

Deployment target:

```text
host: Hong Kong 2
service: yingyue-admin.service
release: prod-1d304d5-micro-page-form-scope-backend-20260619-0645
commit: 1d304d5f6d3a03395746e584ca06b5df6b4426c5
commit summary: 1d304d5 fix(studio): enforce micro page form store scope
local jar: backend/ruoyi-admin/target/ruoyi-admin.jar
release jar: /opt/yingyue/releases/prod-1d304d5-micro-page-form-scope-backend-20260619-0645/ruoyi-admin.jar
runtime jar: /opt/yingyue/backend/ruoyi-admin.jar
backup jar: /opt/yingyue/backups/prod-1d304d5-micro-page-form-scope-backend-20260619-0645-pre/ruoyi-admin.jar
runtime/release sha256: 9b2e8de4a800fbf2d6add8cb880fc52d3f5aeed7f966a63617023dafdff6014e
backup sha256: 2a92268c6047539ab655bbdeca68364a626420ec2d82032b61fddb2f85000af1
systemctl is-active yingyue-admin.service: active
http://127.0.0.1:8080/: 200
https://api.evanshine.me/: 200
https://studio.evanshine.me/merchant/micro-pages: 200
https://studio.evanshine.me/merchant/micro-forms: 200
https://studio.evanshine.me/order/forms: 200
```

## Rollback

Use the release-specific backup path:

```bash
cp /opt/yingyue/backups/prod-1d304d5-micro-page-form-scope-backend-20260619-0645-pre/ruoyi-admin.jar /opt/yingyue/backend/ruoyi-admin.jar
chown yingyue:yingyue /opt/yingyue/backend/ruoyi-admin.jar
chmod 0644 /opt/yingyue/backend/ruoyi-admin.jar
systemctl restart yingyue-admin.service
```

No sensitive credential, full customer contact value, raw private payload, or platform private value should be added to this evidence.
