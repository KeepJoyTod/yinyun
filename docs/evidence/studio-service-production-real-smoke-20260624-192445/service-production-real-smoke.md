# Studio Workbench Service Production Real Smoke

- Status: FAIL
- CheckedAt: 2026-06-24T11:24:45.788Z
- BaseUrl: https://studio.evanshine.me
- ReleaseId: prod-b1900b8-service-production-frontend-20260624-1924
- ReleaseTxt: prod-local-schedule-store-date-frontend-20260624-002219
- MarkerMatched: false
- TokenPresent: true

## Routes

| Key | Status | Final URL | Detail |
| --- | --- | --- | --- |
| retouch-center | FAIL | https://studio.evanshine.me/?cb=prod-b1900b8-service-production-frontend-20260624-1924&storeId=900000000000000100 | path-mismatch:/ |
| retouch-providers | FAIL | https://studio.evanshine.me/?cb=prod-b1900b8-service-production-frontend-20260624-1924&storeId=900000000000000100 | path-mismatch:/ |
| collaboration-retouch-center-settings | FAIL | https://studio.evanshine.me/collaboration/retouch-center-settings?cb=prod-b1900b8-service-production-frontend-20260624-1924 | missing-text:Retouch Center |
| collaboration-common-settings | FAIL | https://studio.evanshine.me/collaboration/common-settings?cb=prod-b1900b8-service-production-frontend-20260624-1924 | missing-text:Common Config |
| collaboration-open-settings | FAIL | https://studio.evanshine.me/collaboration/open-settings?cb=prod-b1900b8-service-production-frontend-20260624-1924 | missing-text:License Binding |

## Console Errors

- Failed to load resource: net::ERR_CONNECTION_TIMED_OUT
- Failed to load resource: net::ERR_CONNECTION_TIMED_OUT
- Failed to load resource: net::ERR_CONNECTION_TIMED_OUT
- Failed to load resource: net::ERR_CONNECTION_TIMED_OUT
- Error: Missing backend id
    at I (https://studio.evanshine.me/assets/prod-b1900b8-service-production-frontend-[redacted-id]-1924/index-BwwYpb6f.js:2:23588)
    at Rt (https://studio.evanshine.me/assets/prod-b1900b8-service-production-frontend-[redacted-id]-1924/index-BwwYpb6f.js:2:33981)
    at Object.getCollaborationPolicy (https://studio.evanshine.me/assets/prod-b1900b8-service-production-frontend-[redacted-id]-1924/index-BwwYpb6f.js:3:35612)
    at async c (https://studio.evanshine.me/asset
- Failed to load resource: net::ERR_CONNECTION_TIMED_OUT
- TypeError: Failed to fetch
- Failed to load resource: net::ERR_CONNECTION_TIMED_OUT

## Page Errors

- 发生未知异常，请联系管理员
- 发生未知异常，请联系管理员
- 发生未知异常，请联系管理员

## Screenshots

- D:\Java\class\projectKu\codex-repo-guardrails\yingyue-cloud-feat-codex-repo-guardrails-20260623\docs\evidence\studio-service-production-real-smoke-20260624-192445\01-retouch-center.png
- D:\Java\class\projectKu\codex-repo-guardrails\yingyue-cloud-feat-codex-repo-guardrails-20260623\docs\evidence\studio-service-production-real-smoke-20260624-192445\02-retouch-providers.png
- D:\Java\class\projectKu\codex-repo-guardrails\yingyue-cloud-feat-codex-repo-guardrails-20260623\docs\evidence\studio-service-production-real-smoke-20260624-192445\03-collaboration-retouch-center-settings.png
- D:\Java\class\projectKu\codex-repo-guardrails\yingyue-cloud-feat-codex-repo-guardrails-20260623\docs\evidence\studio-service-production-real-smoke-20260624-192445\04-collaboration-common-settings.png
- D:\Java\class\projectKu\codex-repo-guardrails\yingyue-cloud-feat-codex-repo-guardrails-20260623\docs\evidence\studio-service-production-real-smoke-20260624-192445\05-collaboration-open-settings.png

## Boundary

This smoke logs in and reads service production pages only. It does not click save, create providers, update licenses, or change collaboration policy.
