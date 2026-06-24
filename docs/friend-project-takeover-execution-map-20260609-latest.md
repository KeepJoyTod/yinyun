# Friend Project Takeover Execution Map

Date: 2026-06-09

## Result

Production work stays in:

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo
```

Friend projects are reference assets only:

| Asset | Path | Role |
| --- | --- | --- |
| Photo studio admin demo | `D:\OtherProject\CameraApp\photoshop-master` | UI and workflow reference for album workspace, online selection, schedule capacity |
| Taro miniapp demo | `D:\OtherProject\CameraApp\yuyue-main` | Reference for login, orders, negatives selection, customer tabs |
| Desktop maps | `C:\Users\Administrator\Desktop\yiyue` | Operator-facing maps and acceptance notes |

## Production Boundaries

| Area | Production location |
| --- | --- |
| API | `https://api.evanshine.me` |
| Backend | `backend` |
| Admin UI | `admin-ui` |
| H5 / WeChat / Douyin pickup client | `mobile-uniapp` |
| WeChat miniapp import | `mobile-uniapp\dist\build\mp-weixin`, AppID `wx2a1a34748f56a6c6` |
| Douyin miniapp import | `mobile-uniapp\dist\build\mp-toutiao`, AppID `tta3c8d5753dac3aae01` |
| Douyin Local Life | Backend `DOUYIN_LIFE` only |
| Storage | Private Aliyun OSS, signed URL or backend stream |

## Reference Absorption Map

| Reference feature | Friend file | Production target | Priority |
| --- | --- | --- | --- |
| Album workspace | `photoshop-master/frontend/src/features/albums/PhotoMgmtView.vue` | `admin-ui/src/views/yy/photo/index.vue` | P0 |
| Online selection link | `photoshop-master/frontend/src/features/selection/OnlineSelectionView.vue` | `photoPickupEntry.ts` and album dialog | P1 |
| Schedule capacity | `photoshop-master/frontend/src/features/schedule/ScheduleView.vue` | Douyin reservation stock operations | P2 |
| Selection rules | `photoshop-master/frontend/src/features/products/ProductConfigView.vue` | Album/package rules | P1 |
| Phone login | `yuyue-main/client/src/pages/auth/*` | `pickup/login`, platform login | P1 |
| Negatives selection | `yuyue-main/client/src/pages/negatives/index.tsx` | `pickup/detail/index.vue` | P1 |
| Orders | `yuyue-main/client/src/pages/orders/*` | Future customer order entry | P2 |

Do not migrate demo backends, MinIO, Tailwind/Radix runtime, Taro runtime, localhost configs, old miniapp config, old secrets, or public image URLs.

## Next Execution

1. Done: generated album smoke commands add `-AllowEmptyAlbum` when visible asset count is zero.
2. Done: `admin-ui npm run test:yy` passed with 49 tests and `admin-ui npm run build:dev` passed.
3. Run mobile tests, typecheck, H5, WeChat, and Douyin builds.
4. Import `mp-weixin` and `mp-toutiao` into official devtools.
5. Verify real OSS image with bare URL 403, signed URL success, and stream success.
6. Absorb friend UI ideas only after the production loop is green.

## Commands

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

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\photo-pickup-smoke.ps1 -BaseUrl "https://api.evanshine.me" -Phone "<phone>" -AccessCode "<pickup-code>" -AlbumId "<album-id>"
```
