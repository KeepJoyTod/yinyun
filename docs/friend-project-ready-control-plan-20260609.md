# Friend Project Ready Control Plan

Date: 2026-06-09

## Result

Production stays in:

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo
```

Friend projects are reference assets only:

| Project | Path | Role |
| --- | --- | --- |
| Friend admin demo | `D:\OtherProject\CameraApp\photoshop-master` | Admin UX and workflow reference |
| Friend miniapp demo | `D:\OtherProject\CameraApp\yuyue-main` | Taro miniapp flow reference |
| Desktop maps | `docs\yiyue` | Local maps, runbooks, acceptance notes |

Do not migrate demo backends, MinIO, public image URLs, legacy AppIDs, secrets, or demo database models.

## Current Production Status

| Area | Status |
| --- | --- |
| Admin orders | Operations overview, pickup delivery summary, `photoDeliveryIssueOnly`, order-to-album shortcut, and order-to-upload shortcut are implemented |
| Admin albums | Upload, asset creation, pickup entry, troubleshooting, batch visible/hidden, thumbnail fields, and `intent=upload` upload auto-open are implemented |
| H5 pickup | Phone + pickup code, albums, detail, preview, download, selection, empty states, and error states are implemented |
| WeChat miniapp | Uses `mobile-uniapp`; AppID is `wx2a1a34748f56a6c6`; import `dist\build\mp-weixin` |
| Douyin miniapp | Uses `mobile-uniapp`; AppID is `tta3c8d5753dac3aae01`; import `dist\build\mp-toutiao` |
| Douyin Life | Stays in Spring Boot backend under `DOUYIN_LIFE` |

## Fixed Values

| Platform | Build | Import |
| --- | --- | --- |
| WeChat | `npm run build:mp-weixin` | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-weixin` |
| Douyin | `npm run build:mp-toutiao` | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao` |

Legal domain:

```text
https://api.evanshine.me
```

## Next Plan

### P0

1. Verify real private OSS upload from admin.
2. Confirm `yy_photo_asset.object_key` and `thumbnail_object_key`.
3. Verify H5 preview, download, and selection with real images.
4. Verify raw OSS URL returns 403, signed URL works, and `/stream` works.
5. Import WeChat and Douyin builds into official devtools.

### P1

1. Add customer pickup copy shortcut on order rows.
2. Improve pickup entry QR download and customer message template.
3. Improve album image diagnostics for missing key, thumbnail failure, and signing failure.
4. Add WeChat/Douyin phone auth with pickup-code fallback.
5. Bind Douyin Life paid/reserved orders to album placeholders.

### P2

1. Customer order center.
2. Retouching/add-on/delivery workflow.
3. Reservation stock board.
4. Optional platform-cloud BFF POC.
5. Audit and report export.

## Verification

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run test:yy
npm run build:dev
```

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm test
npm run typecheck
npm run build:h5
npm run build:mp-weixin
npm run build:mp-toutiao
```

