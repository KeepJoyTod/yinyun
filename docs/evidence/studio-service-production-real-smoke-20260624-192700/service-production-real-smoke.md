# Studio Workbench Service Production Real Smoke

- Status: FAIL
- CheckedAt: 2026-06-24T11:27:00.751Z
- BaseUrl: https://studio.evanshine.me
- ReleaseId: prod-b1900b8-service-production-frontend-20260624-1924
- ReleaseTxt: prod-b1900b8-service-production-frontend-20260624-1924
- MarkerMatched: true
- TokenPresent: true

## Routes

| Key | Status | Final URL | Detail |
| --- | --- | --- | --- |
| retouch-center | FAIL | https://studio.evanshine.me/service/retouch-center?cb=prod-b1900b8-service-production-frontend-20260624-1924 | missing-text:Retouch Center,Task Detail |
| retouch-providers | FAIL | https://studio.evanshine.me/service/retouch-providers?cb=prod-b1900b8-service-production-frontend-20260624-1924 | missing-text:Retouch Providers,Provider Detail |
| collaboration-retouch-center-settings | FAIL | https://studio.evanshine.me/collaboration/retouch-center-settings?cb=prod-b1900b8-service-production-frontend-20260624-1924 | missing-text:Retouch Center |
| collaboration-common-settings | FAIL | https://studio.evanshine.me/collaboration/common-settings?cb=prod-b1900b8-service-production-frontend-20260624-1924 | missing-text:Common Config |
| collaboration-open-settings | FAIL | https://studio.evanshine.me/collaboration/open-settings?cb=prod-b1900b8-service-production-frontend-20260624-1924 | missing-text:License Binding |

## Console Errors

- Failed to load resource: net::ERR_CONNECTION_TIMED_OUT
- Failed to load resource: net::ERR_CONNECTION_TIMED_OUT
- TypeError: Failed to fetch
    at u (https://studio.evanshine.me/assets/prod-b1900b8-service-production-frontend-[redacted-id]-1924/request-BPuxpABQ.js:1:1941)
    at async An (https://studio.evanshine.me/assets/prod-b1900b8-service-production-frontend-[redacted-id]-1924/index-BwwYpb6f.js:2:43547)
    at async Promise.all (index 0)
    at async Object.listAlbums (https://studio.evanshine.me/assets/prod-b1900b8-service-production-frontend-[redacted-id]-1924/index-BwwYpb6f.js:3:533)
    at async P
- Failed to load resource: net::ERR_CONNECTION_TIMED_OUT
- TypeError: Failed to fetch
- Failed to load resource: net::ERR_CONNECTION_TIMED_OUT
- Error: Missing backend id
    at I (https://studio.evanshine.me/assets/prod-b1900b8-service-production-frontend-[redacted-id]-1924/index-BwwYpb6f.js:2:23588)
    at Rt (https://studio.evanshine.me/assets/prod-b1900b8-service-production-frontend-[redacted-id]-1924/index-BwwYpb6f.js:2:33981)
    at Object.getCollaborationPolicy (https://studio.evanshine.me/assets/prod-b1900b8-service-production-frontend-[redacted-id]-1924/index-BwwYpb6f.js:3:35612)
    at async c (https://studio.evanshine.me/asset
- Failed to load resource: net::ERR_CONNECTION_TIMED_OUT
- TypeError: Failed to fetch
    at u (https://studio.evanshine.me/assets/prod-b1900b8-service-production-frontend-[redacted-id]-1924/request-BPuxpABQ.js:1:1941)
    at async An (https://studio.evanshine.me/assets/prod-b1900b8-service-production-frontend-[redacted-id]-1924/index-BwwYpb6f.js:2:43547)
    at async Promise.all (index 0)
    at async Object.listAlbums (https://studio.evanshine.me/assets/prod-b1900b8-service-production-frontend-[redacted-id]-1924/index-BwwYpb6f.js:3:533)
    at async P
- Failed to load resource: net::ERR_CONNECTION_TIMED_OUT

## Page Errors

- 发生未知异常，请联系管理员

## Screenshots

- D:\Java\class\projectKu\codex-repo-guardrails\yingyue-cloud-feat-codex-repo-guardrails-20260623\docs\evidence\studio-service-production-real-smoke-20260624-192700\01-retouch-center.png
- D:\Java\class\projectKu\codex-repo-guardrails\yingyue-cloud-feat-codex-repo-guardrails-20260623\docs\evidence\studio-service-production-real-smoke-20260624-192700\02-retouch-providers.png
- D:\Java\class\projectKu\codex-repo-guardrails\yingyue-cloud-feat-codex-repo-guardrails-20260623\docs\evidence\studio-service-production-real-smoke-20260624-192700\03-collaboration-retouch-center-settings.png
- D:\Java\class\projectKu\codex-repo-guardrails\yingyue-cloud-feat-codex-repo-guardrails-20260623\docs\evidence\studio-service-production-real-smoke-20260624-192700\04-collaboration-common-settings.png
- D:\Java\class\projectKu\codex-repo-guardrails\yingyue-cloud-feat-codex-repo-guardrails-20260623\docs\evidence\studio-service-production-real-smoke-20260624-192700\05-collaboration-open-settings.png

## Boundary

This smoke logs in and reads service production pages only. It does not click save, create providers, update licenses, or change collaboration policy.
