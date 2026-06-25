# 朋友项目接手落地总图

更新时间：2026-06-09

## 结果

朋友交给你的内容已经拆成三类：正式项目、参考项目、资料地图。正式开发只改 `yingyue-cloud-repo`；朋友项目只吸收产品体验、交互结构和业务流程。

| 类别 | 路径 | 定位 | 处理 |
| --- | --- | --- | --- |
| 正式主仓库 | `D:\OtherProject\CameraApp\yingyue-cloud-repo` | 生产基线 | 后端、后台、H5、微信小程序、抖音小程序都在这里落地 |
| 朋友后台 Demo | `D:\OtherProject\CameraApp\photoshop-master`、`docs\yiyue\前端优化\photoshop-master` | 摄影后台参考 | 吸收相册工作台、在线选片、订单筛选、日程库存体验 |
| 朋友小程序 Demo | `D:\OtherProject\CameraApp\yuyue-main`、`docs\yiyue\微信小程序\yuyue-main` | Taro 小程序参考 | 吸收登录、预约、订单、底片选片流程 |
| 桌面地图目录 | `docs\yiyue` | 人工接手资料 | 存放 code map、feature map、优化计划、验收经验 |

## 边界

| 模块 | 正式落点 | 不做 |
| --- | --- | --- |
| 后端核心 API | `https://api.evanshine.me`、Spring Boot | 不迁移朋友 Demo 后端 |
| 后台运营 | `admin-ui` + Element Plus / RuoYi | 不用 `photoshop-master` 替换后台 |
| 客户取片 | `mobile-uniapp` | 不用 Taro 替换正式多端端 |
| 微信小程序 | `mobile-uniapp` 构建 `mp-weixin` | 不另起一套微信正式端 |
| 抖音小程序 | `mobile-uniapp` 构建 `mp-toutiao` | 不把抖音生活服务 SPI 放进小程序 |
| 抖音来客 | `DOUYIN_LIFE` 后端模块 | 不和 `DOUYIN_MINI_APP` 混线 |
| 图片存储 | 私有阿里云 OSS + 签名 URL / `/stream` | 不改公共读、不暴露长期 OSS 直链 |

## 朋友后台 `photoshop-master` 地图

技术栈：Vue 3 + TypeScript + Vite + Tailwind v4 + Radix Vue + lucide-vue-next。它的价值在产品和 UI，不在技术栈迁移。

| 功能 | 参考文件 | 可吸收点 | 正式落点 |
| --- | --- | --- | --- |
| 主路由 | `frontend/src/app/router/index.ts` | 页面分组：订单、日程、客片、在线选片、配置 | `admin-ui/src/views/yy/*` |
| 客片管理 | `frontend/src/features/albums/PhotoMgmtView.vue` | 相册侧栏、照片网格、上传底片、排序、重命名、生成选片链接 | `admin-ui/src/views/yy/photo/index.vue` |
| 在线选片 | `frontend/src/features/selection/OnlineSelectionView.vue` | 选片链接、二维码、访问次数、有效期、加片统计 | 相册取片入口、选片配置、访问审计 |
| 订单 | `frontend/src/features/orders/OrdersView.vue` | 订单筛选、客户/服务/状态组合排障 | `admin-ui/src/views/yy/order/index.vue` |
| 日程 | `frontend/src/features/schedule/ScheduleView.vue` | 日期时段、预约容量、异常状态 | 抖音预约库存运营页 |
| 选片配置 | `frontend/src/features/products/components/SelectionConfigModal.vue` | 精修张数、加片单价、选片规则 | 相册/套餐配置 |

不吸收：Demo 后端、MinIO、公图片直链、Tailwind/Radix 运行时、样例数据、硬编码本地代理。

## 朋友小程序 `yuyue-main` 地图

技术栈：Taro 4.1.9 + React 18 + TypeScript + Zustand + SCSS。它只作为多端客户流程参考。

| 功能 | 参考文件 | 可吸收点 | 正式落点 |
| --- | --- | --- | --- |
| 小程序结构 | `client/src/app.config.ts` | 首页、预约、底片、订单、我的五栏结构 | `mobile-uniapp/src/pages.json` 后续扩展 |
| 登录 | `client/src/pages/auth/*` | 协议勾选、手机号、验证码、redirect | `mobile-uniapp/src/pages/pickup/login/index.vue`、`src/platform/*` |
| 请求封装 | `client/src/api/request.ts` | token 注入、401、统一错误 | `mobile-uniapp/src/api/request.ts` |
| 底片选片 | `client/src/pages/negatives/index.tsx` | 待选片/待提交/已完成、选择数量、进度条 | `mobile-uniapp/src/pages/pickup/detail/index.vue` |
| 订单 | `client/src/pages/orders/*` | 客户侧订单状态和入口 | 后续客户订单/相册绑定页 |
| 预约 | `client/src/pages/services/*`、`booking/confirm` | 预约服务浏览和确认 | 后续微信/抖音客户预约入口 |

不吸收：Taro 运行时、Demo server、H2/MySQL demo 数据、旧品牌文案、公共图片链接。

## 正式项目当前状态

| 链路 | 状态 | 下一步 |
| --- | --- | --- |
| 后台上传照片 | 已接入，走 RuoYi OSS 并自动创建 `yy_photo_asset` | 继续复核 `objectKey`、重复上传、失败提示 |
| 相册工作台 | 已接入抽屉，集中展示照片、取片入口、选片结果、访问排障；已补照片缩略排障和底片批量显示/隐藏 | 继续缩略图生成和真机验收 |
| H5 取片 | 手机号 + 取片码、相册、预览、下载、选片已跑通 | 用公网真实图片再验收一轮 |
| 微信小程序 | AppID `wx2a1a34748f56a6c6`，产物 `dist\build\mp-weixin` | 开发者工具和真机验收 |
| 抖音小程序 | AppID `tta3c8d5753dac3aae01`，产物 `dist\build\mp-toutiao` | 开发者工具和真机验收 |
| 平台手机号授权 | 前端入口和微信后端 provider 已有配置位 | 服务器填真实密钥后真机测 |
| 抖音来客 | `api.evanshine.me/api/douyin/life/*` 地址已沉淀 | 继续订单/预约自动绑定相册 |

## 优化计划

### P0：先验收能上线的链路

| 任务 | 文件/入口 | 验收 |
| --- | --- | --- |
| 后台上传复核 | `admin-ui/src/views/yy/photo/index.vue`、`photoUpload.ts` | 上传后底片有 `albumId`、`fileName`、`fileUrl`、`objectKey`、`visible=1` |
| 客户取片回归 | `mobile-uniapp/src/pages/pickup/*` | 登录、列表、详情、预览、下载、选片提交可用 |
| 小程序构建 | `mobile-uniapp` | `typecheck`、`build:mp-weixin`、`build:mp-toutiao` 通过 |
| 后台构建 | `admin-ui` | `npm run test:yy`、`npm run build:dev` 通过 |
| 后端客户取片测试 | `backend/ruoyi-modules/ruoyi-yy` | 客户取片、选片、访问日志测试通过 |

### P1：吸收朋友项目的高价值体验

| 任务 | 参考源 | 正式落点 | 验收 |
| --- | --- | --- | --- |
| 相册照片缩略排障 | `PhotoMgmtView.vue` | 相册工作台抽屉 | DONE：能看到前几张照片、缺 OSS Key、隐藏/已选状态 |
| 底片批量显示/隐藏 | `PhotoMgmtView.vue` | 后台底片列表 | DONE：选中底片后可批量设为客户可见或隐藏 |
| 二维码和分享话术增强 | `OnlineSelectionView.vue` | 后台相册取片入口 | 一键复制 H5/微信/抖音入口，不暴露后台/OSS 地址 |
| 选片规则配置 | `SelectionConfigModal.vue` | 相册/套餐配置 | 可设置精修张数、加片单价、有效期 |
| 微信手机号授权 | `yuyue-main/client/src/pages/auth/*` | `mobile-uniapp/src/platform/wechat.ts` + `/client/photo/auth/platform-login` | 授权成功免取片码，失败回退手输 |
| 抖音手机号授权 | Taro TT 经验 + uni-app 适配 | `mobile-uniapp/src/platform/douyin.ts` | 授权成功绑定平台身份 |
| 订单到相册入口 | `orders/*` | 客户端订单页 + 后台订单详情 | 客户从订单进入相册，后台能从订单排查相册 |

### P2：产品化

| 方向 | 目标 |
| --- | --- |
| 精修交付流 | 待选片、已提交、精修中、可下载、已过期 |
| 加片统计 | 统计多选照片、加片金额、转化 |
| 抖音订单自动相册 | 支付/预约成功后自动创建或绑定相册 |
| 日程库存看板 | 门店、日期、时段、库存异常一屏排查 |
| 平台云 BFF POC | 微信云/抖音云只做登录、手机号授权、轻量代理 |

## 小程序操作入口

| 平台 | 命令 | 导入目录 | 合法域名 |
| --- | --- | --- | --- |
| 微信 | `npm run build:mp-weixin` | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-weixin` | `https://api.evanshine.me` |
| 抖音 | `npm run build:mp-toutiao` | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao` | `https://api.evanshine.me` |

## 验证命令

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

## 继续执行顺序

1. 先跑正式仓库验证，不跑朋友 Demo 当发布依据。
2. 真机导入微信/抖音小程序，验证手机号 + 取片码、预览、保存。
3. 继续缩略图生成和图片域名 `/stream` 真机兼容验证。
4. 接微信/抖音手机号授权。
5. 做抖音订单/预约自动创建相册和库存看板。
