# 影约云客户电脑网页端代码地图

更新时间：2026-06-11

## 结论

`client-web` 是客户电脑网页端，定位是门店官网、客户取片入口和小程序预约引导。它不是 `admin-ui`，也不是 `studio-workbench`，也不再承载电脑网页预约表单。

正式目录：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\client-web
```

本地预览：

```text
http://127.0.0.1:5200/
```

## 页面地图

| 页面 | 路由 | 文件 | 用途 |
| --- | --- | --- | --- |
| 官网首页 | `/` | `src/views/HomeView.vue` | 展示小程序预约、客户取片、门店入口、服务承诺、交付流程、套餐选择、样片交付和入口边界 |
| 小程序预约引导 | `/booking` | `src/views/BookingView.vue` | 引导客户进入微信/抖音小程序下单预约；说明管理员后台、店员工作台和统一订单账本边界 |
| 旧预约成功兼容 | `/booking/success` | `src/router/index.ts` | 旧链接兼容重定向到 `/booking`，不再保留网页预约成功页 |
| 客户取片登录 | `/customer/login` | `src/views/CustomerLoginView.vue` | 调 `/client/photo/auth/verify` 校验手机号 + 取片码，并展示取片前确认、私密授权说明和恢复入口 |
| 客户相册列表 | `/customer/albums` | `src/views/CustomerAlbumsView.vue` | 调 `/client/photo/albums` 展示当前手机号可访问相册、交付概览、交付提醒、门店协助、空状态恢复动作、相册状态和下一步动作 |
| 客户相册详情 | `/customer/albums/:albumId` | `src/views/CustomerAlbumDetailView.vue` | 调相册详情、预览签名 URL、下载签名 URL，展示交付说明、照片目录状态、照片未上传恢复动作和预览翻页 |
| 客户取片结果 | `/customer/result` | `src/views/CustomerResultView.vue` | 展示错误取片码、无权限、相册过期、系统异常等失败状态、处理建议、门店协助和恢复动作 |
| 取片短入口 | `/pickup` | `src/router/index.ts` | 重定向到 `/customer/login` |
| 门店入口 | `/staff` | `src/views/StaffEntryView.vue` | 跳转 `studio-workbench`，不在官网内管理订单 |

## 关键文件

| 文件 | 作用 |
| --- | --- |
| `package.json` | 包名、启动脚本、构建脚本 |
| `vite.config.ts` | 5200 端口、`/client` 默认代理到 `https://api.evanshine.me` |
| `src/main.ts` | Vue 入口 |
| `src/router/index.ts` | 客户官网路由 |
| `src/shared/clientPhotoApi.ts` | 客户取片登录、token 存储、相册列表/详情/预览/下载 API |
| `src/shared/clientPhotoApi.test.ts` | 客户取片 API 契约测试 |
| `src/shared/customerSupport.ts` | 客户网页端统一门店联系配置，集中维护门店名、电话展示、`tel:` 链接和取片协助说明 |
| `src/shared/customerSupportContract.test.ts` | 客户联系入口契约测试，防止取片页和小程序预约引导页重新写死门店电话 |
| `src/shared/miniappBookingGuideContract.test.ts` | 小程序预约引导契约测试，锁定 `/booking` 不再提交网页预约 |
| `src/shared/noWebBookingIntentContract.test.ts` | 反向契约测试，防止 `client-web` 重新出现 `/client/booking/intent` 或 `clientBookingApi` |
| `src/shared/customerLoginPageContract.test.ts` | 客户取片登录页契约测试，锁定取片前确认、私密授权说明和恢复入口 |
| `src/shared/customerAlbumsPageContract.test.ts` | 客户相册列表页面契约测试，锁定概览、隐私提示、状态标签、交付提醒、门店协助和空状态恢复动作 |
| `src/shared/customerAlbumDetailPageContract.test.ts` | 客户相册详情页契约测试，锁定交付说明、照片目录工具条、照片未上传恢复动作和预览翻页 |
| `src/shared/customerResultPageContract.test.ts` | 客户取片结果页契约测试，锁定失败跳转、原因展示、处理建议、门店协助和恢复动作 |
| `src/shared/homePageContract.test.ts` | 官网首页契约测试，锁定服务承诺、交付流程、套餐选择、样片交付和客户/员工/系统入口分层 |
| `src/shared/entryContracts.ts` | 客户入口和员工入口的契约定义 |
| `src/shared/entryContracts.test.ts` | 入口分离测试 |
| `src/styles.css` | 官网视觉、响应式和表单样式 |

## 后端接口地图

| 接口 | 说明 |
| --- | --- |
| `/client/photo/*` | 客户取片主接口：手机号/取片码校验、相册列表、照片目录、短期预览/下载 |
| 微信/抖音小程序预约支付接口 | 客户预约下单主入口，进入统一 `yy_order` 账本；电脑网页不再直接创建预约 |
| `POST /client/booking/intent` | 后端历史接口保留兼容/观察，`client-web` 已不再调用，后续确认无依赖后可下线 |

## 当前状态

- 已创建客户官网 PC 端首版。
- 已创建小程序预约引导、客户取片、门店入口三类页面。
- 官网首页已补小程序预约、门店确认、私密取片服务承诺，以及小程序预约、到店拍摄、相册交付流程说明。
- 官网首页已补证件照精修、形象照拍摄、家庭纪念照三类套餐选择，用于引导客户进入小程序下单。
- 官网首页已补样片交付展示和照片私有存储说明，强调手机号/取片码校验、短期预览链接和原图下载授权。
- 官网首页已把客户取片、门店工作台、系统后台三类入口做视觉分层，并补客户私密访问说明。
- 客户取片登录页已补预留手机号、门店发送的取片码、相册有效期内三项取片前确认。
- 客户取片登录页已补私密相册和短期授权说明，并提供小程序预约、联系门店、返回首页恢复入口。
- 客户取片登录页、结果页、相册列表页、相册详情页和小程序预约引导页的门店电话已统一改为 `CUSTOMER_SUPPORT` 配置，页面不再直接写死 `tel:` 或展示电话。
- `/booking` 已改为微信/抖音小程序预约引导页，说明客户预约支付只走小程序，订单统一进入 `yy_order`。
- `/booking/success` 已改为兼容重定向到 `/booking`，不再展示网页预约成功页。
- `client-web` 已删除 `clientBookingApi.ts` 和旧预约 API 测试，契约测试禁止重新出现 `/client/booking/intent`。
- 已验证桌面和移动端无当前控制台错误。
- 已验证官网首页桌面 `1280` 宽、移动 `390` 宽无横向溢出。
- 客户取片登录已接 `/client/photo/auth/verify`。
- 客户取片登录失败会跳 `/customer/result`，展示可读失败原因和重新取片入口。
- 客户取片结果页已补处理建议和门店协助卡片，客户能看到拨打门店电话、来源位置和下一步核对事项。
- 登录成功后进入 `/customer/albums`，并调用 `/client/photo/albums` 展示可访问相册。
- 相册列表已补可访问相册数、照片总数、即将过期数、私密取片提示、交付三步提醒、联系门店卡、空状态恢复动作、渠道标签和下一步动作。
- 相册列表/详情读取失败会跳 `/customer/result`，覆盖无权限、过期、接口异常等客户可见失败状态。
- 相册列表可进入 `/customer/albums/:albumId`。
- 相册详情已接 `/client/photo/albums/{albumId}`，照片网格通过 `/preview-url` 展示。
- 相册详情已补交付说明、照片目录状态工具条、照片未上传恢复动作、刷新预览、联系门店、预览上一张/下一张切换。
- 门店电话展示为 `0755-8888-2026`，电话链接统一从 `customerSupport.ts` 生成，预约和取片相关页面后续换真实电话只改一个文件。
- 点击照片可打开大图弹窗，下载原图通过 `/download-url` 获取短期签名 URL。
## 预约入口边界

- 客户预约下单只通过微信小程序或抖音小程序进入。
- 抖音来客真实支付订单由 `DOUYIN_LIFE` 同步到 `yy_order`。
- 微信小程序/抖音小程序内自建支付订单后续写入 `yy_order + yy_payment_record`。
- `client-web` 不维护网页预约表单，不调用 `/client/booking/intent`，避免产生第二套预约入口。
- 管理员后台 `admin-ui` 看全渠道订单和主数据；店员工作台 `studio-workbench` 只处理确认、排期、客片上传、选片、核销和异常。

## 边界

| 入口 | 是否客户可见 | 说明 |
| --- | --- | --- |
| `client-web` | 是 | 官网、取片、小程序预约引导 |
| `mobile-uniapp` | 是 | H5/微信/抖音小程序取片 |
| `studio-workbench` | 否 | 门店员工工作台 |
| `admin-ui` | 否 | 系统总后台 |
