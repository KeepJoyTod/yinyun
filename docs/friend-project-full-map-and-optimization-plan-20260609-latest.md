# Friend Project Full Map And Optimization Plan

Date: 2026-06-09

## Result

Production development stays in this repo:

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo
```

Friend projects are reference assets only:

| Asset | Path | Role |
| --- | --- | --- |
| Photo studio admin demo | `D:\OtherProject\CameraApp\photoshop-master` | Reference for album workspace, online selection, order filtering, schedule capacity UI |
| Taro miniapp demo | `D:\OtherProject\CameraApp\yuyue-main` | Reference for login, booking, orders, negatives selection |
| Desktop maps | `C:\Users\Administrator\Desktop\yiyue` | Operating maps, acceptance notes, platform configuration notes |

Production boundaries:

| Area | Production location |
| --- | --- |
| Core API | `https://api.evanshine.me` |
| Backend | `backend` |
| Admin UI | `admin-ui` |
| H5 / WeChat / Douyin pickup client | `mobile-uniapp` |
| WeChat miniapp import | `mobile-uniapp\dist\build\mp-weixin`, AppID `wx2a1a34748f56a6c6` |
| Douyin miniapp import | `mobile-uniapp\dist\build\mp-toutiao`, AppID `tta3c8d5753dac3aae01` |
| Douyin Local Life | backend `DOUYIN_LIFE`; SPI/OpenAPI only |
| Storage | Private Aliyun OSS plus signed URL or `/client/photo/assets/{assetId}/stream` |

## Current Status

| Module | Done | Next |
| --- | --- | --- |
| Admin albums | Upload, auto asset creation, pickup entry, operations diagnostics, bulk visible/hidden, quick rename, up/down sort, recent access/failure, copy feedback, copy OSS preflight command after upload | Verify real OSS image thumbnails and stream |
| H5 pickup | Phone + pickup code, albums, detail, preview, download, selection, empty-state UI, private-photo login copy, preview swipe guidance | Full public smoke with real images |
| WeChat miniapp | AppID and build path are clear | Devtools import and real-device save |
| Douyin miniapp | AppID and build path are clear | Devtools import and real-device save |
| OSS validation | Private OSS is the target model | Run bare OSS 403 + signed URL + stream smoke |
| Douyin Life | `api.evanshine.me/api/douyin/life/*` addresses are documented | Continue order/reservation to album binding |

## Code Map

| Feature | Production file |
| --- | --- |
| Client photo controller | `backend\ruoyi-modules\ruoyi-yy\src\main\java\org\dromara\yy\controller\YyClientPhotoController.java` |
| Client photo service | `backend\ruoyi-modules\ruoyi-yy\src\main\java\org\dromara\yy\service\impl\YyClientPhotoServiceImpl.java` |
| Signed URL / stream | `backend\ruoyi-modules\ruoyi-yy\src\main\java\org\dromara\yy\service\impl\DefaultYyPhotoAssetUrlSigner.java` |
| Admin album page | `admin-ui\src\views\yy\photo\index.vue` |
| Upload helper | `admin-ui\src\views\yy\utils\photoUpload.ts` |
| Pickup entry helper | `admin-ui\src\views\yy\utils\photoPickupEntry.ts` |
| Operations health helper | `admin-ui\src\views\yy\utils\photoOperationsHealth.ts` |
| Mobile request wrapper | `mobile-uniapp\src\api\request.ts` |
| Mobile photo API | `mobile-uniapp\src\api\clientPhoto.ts` |
| Pickup pages | `mobile-uniapp\src\pages\pickup\*` |
| WeChat adapter | `mobile-uniapp\src\platform\wechat.ts` |
| Douyin adapter | `mobile-uniapp\src\platform\douyin.ts` |
| Douyin Life channel | `backend\ruoyi-modules\ruoyi-yy\src\main\java\org\dromara\yy\channel\douyin\*` |

## Reference Absorption

| Reference | Useful files | Production target |
| --- | --- | --- |
| Admin album workspace | `photoshop-master\frontend\src\features\albums\PhotoMgmtView.vue` | `admin-ui\src\views\yy\photo\index.vue` |
| Online selection links | `photoshop-master\frontend\src\features\selection\OnlineSelectionView.vue` | pickup entry dialog, access audit |
| Schedule capacity | `photoshop-master\frontend\src\features\schedule\ScheduleView.vue` | Douyin reservation stock operations |
| Selection rules | `photoshop-master\frontend\src\features\products\components\SelectionConfigModal.vue` | album/package rules |
| Taro login | `yuyue-main\client\src\pages\auth\*` | `pickup/login` and `platform-login` |
| Taro negatives | `yuyue-main\client\src\pages\negatives\index.tsx` | `pickup/detail` selection |
| Taro orders | `yuyue-main\client\src\pages\orders\*` | future customer order entry |

Do not migrate demo backends, MinIO, Tailwind/Radix runtime, Taro/React runtime, localhost configs, old AppIDs, demo accounts, secrets, or long-lived public image URLs.

## P0 Verification

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run test:yy
npm run build:dev
```

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm test
npm run typecheck
npm run build:mp-weixin
npm run build:mp-toutiao
```

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\backend
mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests=false "-Dsurefire.failIfNoSpecifiedTests=false" "-Dtest=YyClientPhotoServiceImplTest,YyClientPhotoControllerTest,YyPhotoAccessLogServiceImplTest" test
```

Private OSS smoke:

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\photo-pickup-smoke.ps1 -BaseUrl https://api.evanshine.me -Phone <phone> -AccessCode <pickup-code> -AlbumId <album-id> -BareOssUrl "https://<bucket>.oss-cn-beijing.aliyuncs.com/<object-key>"
```

Expected: `bare-oss: blocked status=403`, plus `thumbnail-url`, `preview-url`, `download-url`, and `stream` success for real visible assets.

After uploading in the admin photo dialog, operators can click `复制预检命令` and paste the generated PowerShell command directly. The command strips signed query params and never includes `client_token`.

## Next Work

1. Upload a real production test image from admin UI.
2. Run private OSS smoke with `-BareOssUrl`, or copy the preflight command directly from the admin upload dialog.
3. Import `mp-weixin` and `mp-toutiao` builds in official devtools.
4. Verify real-device preview/save.
5. Implement WeChat and Douyin phone authorization fallback.
6. Continue `DOUYIN_LIFE` order/reservation to album binding.

Desktop twin:

```text
C:\Users\Administrator\Desktop\yiyue\朋友项目全量地图与优化总计划-20260609-latest.md
```

Final real-image evidence template:

```text
docs\evidence\photo-pickup-real-oss-acceptance-template-20260609.md
```
