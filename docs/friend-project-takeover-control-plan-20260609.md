# Friend Project Takeover Control Plan

Date: 2026-06-09

## Result

The production baseline remains:

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo
```

The friend projects are reference assets only:

| Asset | Path | Use |
| --- | --- | --- |
| Photo studio admin demo | `D:\OtherProject\CameraApp\photoshop-master` | Admin UX, album workspace, online selection, schedule board |
| Appointment / miniapp demo | `D:\OtherProject\CameraApp\yuyue-main` | Login, order, booking, negatives flow |
| Local handover maps | `docs\yiyue` | Human-facing maps and runbooks |

Do not migrate demo runtimes into production. Rewrite useful ideas into the existing RuoYi admin and uni-app client.

## Production Boundaries

| Area | Production Owner |
| --- | --- |
| Core API | `https://api.evanshine.me` |
| Backend | `backend` |
| Admin UI | `admin-ui` |
| H5 / WeChat / Douyin client | `mobile-uniapp` |
| Douyin Life service provider flow | `backend/ruoyi-modules/ruoyi-yy` |
| Image storage | Private Aliyun OSS + signed URLs or backend `/stream` |

`DOUYIN_LIFE` is the service-provider/SPI/OpenAPI line. `DOUYIN_MINI_APP` and WeChat miniapp are customer photo pickup clients.

## Current State

| Workstream | State |
| --- | --- |
| Photo upload | Admin upload uses RuoYi OSS and creates `yy_photo_asset` records |
| H5 pickup | Phone + pickup code flow works, with preview/download/selection |
| WeChat miniapp | Build target is `mobile-uniapp/dist/build/mp-weixin` |
| Douyin miniapp | Build target is `mobile-uniapp/dist/build/mp-toutiao` |
| Platform phone auth | Frontend entry is available; backend provider can resolve WeChat phone numbers by static token or AppID/AppSecret token fetch/cache |
| Operations troubleshooting | First album summary is available in admin |
| Douyin Life callbacks | New configuration should use `https://api.evanshine.me/api/douyin/life/*` |

## P0 Plan

| Task | Owner Path | Acceptance |
| --- | --- | --- |
| Re-run admin tests and build | `admin-ui` | `npm run test:yy`, `npm run build:dev` pass |
| Re-run mobile tests and builds | `mobile-uniapp` | `npm test`, `typecheck`, `mp-weixin`, `mp-toutiao` pass |
| Re-run backend pickup tests | `backend` | targeted `ruoyi-yy` tests pass |
| Validate real image pickup | admin upload + client pickup | object keys exist, private OSS is not public, signed/stream access works |
| Import miniapps | WeChat/Douyin devtools | login, album, preview, save are usable |

## P1 Plan

| Task | Reference | Production Target |
| --- | --- | --- |
| Album workspace drawer | `photoshop-master/frontend/src/features/albums/PhotoMgmtView.vue` | `admin-ui/src/views/yy/photo/index.vue` |
| Pickup entry sharing | `photoshop-master/frontend/src/features/selection/OnlineSelectionView.vue` | admin album pickup entry |
| Platform phone authorization | `yuyue-main/client/src/pages/auth/*` | `mobile-uniapp/src/platform/*`, `/client/photo/auth/platform-login` |
| Order to album entry | `yuyue-main/client/src/pages/orders/*` | future `mobile-uniapp` order pages |
| Douyin order album binding | Douyin Life order callbacks | backend `DOUYIN_LIFE` module |

## Platform Phone Auth Config

WeChat backend phone authorization is implemented in:

```text
backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/ClientPhotoMiniAppPhoneAuthProvider.java
```

Config keys:

```yaml
yy:
  client-photo:
    phone-auth:
      enabled: true
      wechat-app-id: ${WECHAT_MINI_APP_ID}
      wechat-app-secret: ${WECHAT_MINI_APP_SECRET}
```

Static token is still supported for short tests:

```yaml
yy.client-photo.phone-auth.wechat-access-token: <temporary-token>
```

When `wechat-access-token` is blank, the provider requests WeChat `access_token` with `appid` and `secret`, caches it in memory, then calls `getuserphonenumber`. Do not print or commit AppSecret/token values.

Douyin remains configurable because the final phone API path/token source can vary:

```yaml
yy.client-photo.phone-auth.douyin-access-token: <temporary-token>
yy.client-photo.phone-auth.douyin-phone-path: /your/confirmed/path
```

## P2 Plan

| Task | Outcome |
| --- | --- |
| Retouch delivery workflow | waiting selection, submitted, retouching, downloadable, expired |
| Add-on photo stats | extra selected photos, add-on amount, conversion |
| Reservation stock board | store/date/time stock operations |
| Platform cloud BFF POC | WeChat/Douyin cloud only proxies login/phone auth |
| Access audit | preview/download/failure/expired/unauthorized logs |

## Verification Commands

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
mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests=false "-Dsurefire.failIfNoSpecifiedTests=false" "-Dtest=YyClientPhotoControllerTest,YyClientPhotoServiceImplTest,YyPhotoAccessLogServiceImplTest,YyPhotoAlbumServiceImplTest,ClientPhotoMiniAppPhoneAuthProviderTest" test
```

## Guardrails

- Do not replace `admin-ui` with the demo Vue/Tailwind app.
- Do not replace `mobile-uniapp` with the Taro/React demo.
- Do not use demo backend services as production owners.
- Do not make OSS public for convenience.
- Do not move Douyin SPI handlers into the miniapp.
- Do not print or commit local secrets.
