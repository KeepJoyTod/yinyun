# 影约云交接项目优化执行计划

日期：2026-06-09

## 结果

本计划用于把朋友交接的 `前端优化`、`抖音小程序`、工作区解压项目逐步吸收到正式影约云。正式开发只改：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo
```

朋友项目只作为参考：

```text
D:\OtherProject\CameraApp\photoshop-master
D:\OtherProject\CameraApp\yuyue-main
docs\yiyue\前端优化
docs\yiyue\抖音小程序
```

## 总目标

把影约云做成三条稳定产品线：

1. 后台运营：订单、相册、上传、访问审计、取片入口、选片状态一屏可排障。
2. 客户取片：H5、微信小程序、抖音小程序统一体验，手机号 + 取片码先上线，平台手机号授权后补。
3. 抖音来客：生活服务 SPI / OpenAPI / logid / 订单相册联动稳定，不和抖音小程序混线。

## P0：稳定当前闭环

### 任务 1：确认主项目构建健康

文件：

- `admin-ui`
- `mobile-uniapp`
- `backend/ruoyi-modules/ruoyi-yy`

执行：

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
mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests=false "-Dsurefire.failIfNoSpecifiedTests=false" "-Dtest=YyClientPhotoControllerTest,YyClientPhotoServiceImplTest,YyPhotoAccessLogServiceImplTest" test
```

验收：

- 后台测试通过。
- 后台构建通过。
- H5/微信/抖音小程序构建通过。
- 后端取片相关测试通过。

### 任务 2：小程序开发者工具导入

微信：

```text
AppID: wx2a1a34748f56a6c6
导入目录: D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-weixin
```

抖音：

```text
AppID: tta3c8d5753dac3aae01
导入目录: D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao
```

合法域名：

```text
https://api.evanshine.me
```

验收：

- 手机号 `13900001111` + 取片码 `PREVIEW-20260608` 可登录。
- 相册列表可打开。
- 空相册状态清楚。
- 有图账号 `13800003333` + `PICK-202606-001` 在本地能预览。

### 任务 3：后台上传和取片入口复核

正式文件：

- `admin-ui/src/views/yy/photo/index.vue`
- `admin-ui/src/views/yy/utils/photoUpload.ts`
- `admin-ui/src/views/yy/utils/photoPickupEntry.ts`

验收：

- 后台相册页可上传多图。
- 上传成功后自动创建 `yy_photo_asset`。
- `objectKey` 不为空。
- 客户取片入口可复制取片码和分享话术。
- 访问审计可按手机号/相册排查。

## P1：吸收朋友项目高价值功能

### 任务 4：取片入口二维码

参考：

- `photoshop-master/frontend/package.json` 中 `qrcode.vue`
- `photoshop-master/frontend/src/features/selection/OnlineSelectionView.vue`

正式落点：

- `admin-ui/src/views/yy/photo/index.vue`
- `admin-ui/src/views/yy/utils/photoPickupEntry.ts`
- 新测试：`admin-ui/src/views/yy/utils/photoPickupEntry.test.ts`

实现要求：

- 不优先引入大依赖。
- 能根据 H5 入口生成二维码。
- 没配置 `VITE_APP_PHOTO_PICKUP_H5_URL` 时显示“仅复制取片码”。
- 二维码和分享话术不包含后台地址、不包含 OSS 地址。

验收：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run test:yy
npm run build:dev
```

### 任务 5：订单一屏排障

参考：

- `yuyue-main/admin/src/pages/OrdersView.vue`
- `yuyue-main/client/src/pages/orders/detail/index.tsx`

正式落点：

- `admin-ui/src/views/yy/order/index.vue`
- 后端如需补接口，优先在 `YyOrderServiceImpl` 或照片服务里做聚合，不新增重复账本。

要展示：

- 订单渠道。
- 客户手机号脱敏。
- 是否有关联相册。
- 相册照片数。
- 最近一次客户访问时间。
- 最近失败原因。
- 跳转“相册管理”和“访问审计”。

验收：

- 从订单列表可以一键定位客户为什么看不到照片。
- 不展示完整手机号。
- 无相册、无照片、相册过期、OSS 缺失各有不同提示。

状态：已完成首版。

落点：

- `admin-ui/src/views/yy/order/index.vue`
- `admin-ui/src/views/yy/utils/orderPageContract.test.ts`

已实现：

- 订单行增加“取片排障”入口。
- 详情抽屉展示关联相册、可见照片、失败访问摘要。
- 根据摘要给出下一步建议。
- 最近失败记录和建议可同时显示。
- 客户手机号脱敏展示。
- 可跳转到客片选片工作台的相册列表和访问审计。

### 任务 6：移动端保存图片体验

参考：

- `yuyue-main/client/src/api/request.ts`
- `yuyue-main/client/src/pages/negatives/index.tsx`

正式落点：

- `mobile-uniapp/src/pages/pickup/preview/index.vue`
- `mobile-uniapp/src/api/clientPhoto.ts`

要求：

- H5 使用 Blob 下载。
- 微信/抖音小程序使用 `uni.downloadFile` + `uni.saveImageToPhotosAlbum`。
- 权限失败时提示去设置开启相册权限。
- token 不放 URL query，优先 header；小程序受限时可用短期 stream 兜底。

验收：

- H5 下载不暴露 `client_token`。
- 小程序保存失败能看到原因。
- 过期 token 会引导重新登录。

状态：已完成首版，并补一轮 UI 质感升级。

落点：

- `mobile-uniapp/src/pages/pickup/preview/index.vue`
- `mobile-uniapp/src/styles/app.scss`
- `mobile-uniapp/src/pages.json`
- `mobile-uniapp/src/App.vue`

已实现：

- H5 下载优先走 `/stream`，通过 `X-Client-Token` 传身份。
- 微信/抖音小程序走 `uni.downloadFile` + `uni.saveImageToPhotosAlbum`。
- 保存权限失败时引导打开设置。
- 登录、相册、详情、预览统一为更正式的灰白底 + 深绿主操作色。

## P2：在线选片产品化

### 任务 7：选片模型

参考：

- `photoshop-master/backend/src/main/java/com/amberstudio/selection/*`
- `yuyue-main/client/src/pages/negatives/index.tsx`

正式落点建议：

- 后端新增或扩展：`yy_photo_selection` / `yy_photo_selection_item`
- 前端后台：`admin-ui/src/views/yy/photo/index.vue`
- 移动端：`mobile-uniapp/src/pages/pickup/detail/index.vue`

最小状态：

```text
DRAFT
OPEN
SUBMITTED
CONFIRMED
EXPIRED
```

最小动作：

- 后台开启选片。
- 客户选中/取消照片。
- 客户提交。
- 后台查看提交结果。
- 后台确认。

验收：

- 客户只能选自己相册可见照片。
- 过期相册不能提交。
- 重复提交幂等。
- 后台能导出或复制选中照片清单。

### 任务 8：选片数量和加片

参考：

- `photoshop-master/frontend/src/features/products/components/SelectionConfigModal.vue`

正式能力：

- 相册设置基础可选张数。
- 超选提示加片。
- 后续可接支付，当前先做人工确认。

验收：

- 客户看到已选数量/可选数量。
- 超出后 UI 明确提示。
- 后台能看到超选张数。

## P3：平台云和生活服务联动

### 任务 9：微信/抖音手机号授权

正式落点：

- `mobile-uniapp/src/platform/wechat.ts`
- `mobile-uniapp/src/platform/douyin.ts`
- 后端 `/client/photo/auth/platform-login`

原则：

- 授权成功可跳过取片码。
- 授权失败保留手机号 + 取片码。
- 平台 openid/unionid 只做身份绑定，不做主账本。

### 任务 10：抖音订单自动相册

正式落点：

- `DouyinLifeChannelAdapter`
- `YyClientPhotoServiceImpl`
- `yy_photo_album`

要求：

- 支付/预约成功后有手机号则自动创建相册占位。
- 发码、退款、核销保持 `DOUYIN_LIFE` 后端链路。
- 抖音小程序只查询 `/client/photo/*`。

## 文档同步规则

每完成一批优化，同步这些文件：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\friend-project-current-handover-master-map-20260609.md
D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\friend-project-optimization-execution-plan-20260609.md
docs\yiyue\friend-project-current-handover-master-map-20260609.md
docs\yiyue\friend-project-optimization-execution-plan-20260609.md
docs\yiyue\前端优化\前端优化-交接地图-20260609.md
docs\yiyue\抖音小程序\抖音小程序-交接地图-20260609.md
```

## 近期推荐执行顺序

1. 先跑 P0 验证，确认当前主项目没有退化。
2. 做取片入口二维码。已完成。
3. 做订单一屏排障。已完成首版。
4. 做小程序保存图片体验。已完成首版。
5. 下一步进入在线选片模型。

这样最稳：先把“能交付照片”打牢，再做“客户选片”。
