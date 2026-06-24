# 影约云朋友项目接手总控地图

日期：2026-06-09

## 结论

`C:\Users\Administrator\Desktop\yiyue\前端优化` 和 `C:\Users\Administrator\Desktop\yiyue\抖音小程序` 属于朋友交接资料目录；工作区里也已经解压出对应参考项目。正式生产开发仍以 `D:\OtherProject\CameraApp\yingyue-cloud-repo` 为唯一主仓库。

朋友项目不直接替换正式项目，只吸收三类东西：

1. 页面信息架构和 UI 质感。
2. 在线选片、预约、订单、底片等业务流程设计。
3. 小程序登录、订单、底片、手机号授权等交互经验。

不吸收四类东西：

1. 不把朋友项目后端替换 RuoYi / Spring Boot 主后端。
2. 不把 Taro 替换正式 `mobile-uniapp`。
3. 不把 MinIO / demo 文件服务替换正式私有 OSS。
4. 不把朋友项目里的测试账号、密钥、长期图片直链写入正式代码或地图。

## 资产分层

| 层级 | 路径 | 来源 | 定位 | 处理方式 |
| --- | --- | --- | --- | --- |
| 正式主仓库 | `D:\OtherProject\CameraApp\yingyue-cloud-repo` | 当前影约云 | 生产基线 | 所有正式开发、测试、构建、提交都在这里 |
| 桌面交接总目录 | `C:\Users\Administrator\Desktop\yiyue` | 本机沉淀 | 平台配置、地图、验收材料 | 保留并同步地图 |
| 前端优化桌面目录 | `C:\Users\Administrator\Desktop\yiyue\前端优化` | 朋友交接 | 后台 UI / 在线选片参考 | 只读参考 + 地图沉淀 |
| 前端优化解压目录 | `D:\OtherProject\CameraApp\photoshop-master` | 朋友交接 | Vue 3 影楼后台 demo | 吸收 UI 和流程，不迁移架构 |
| 抖音小程序桌面目录 | `C:\Users\Administrator\Desktop\yiyue\抖音小程序` | 朋友交接 + 本机配置 | 抖音端配置和地图目录 | 不作为源码目录 |
| 预约小程序解压目录 | `D:\OtherProject\CameraApp\yuyue-main` | 朋友交接 | Taro 小程序 + demo 后端 | 吸收小程序流程，不迁移 Taro |
| 正式小程序源码 | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp` | 当前影约云 | H5 / 微信 / 抖音统一源码 | 继续作为唯一小程序代码基线 |

## 技术边界

| 事项 | 正式选择 | 原因 |
| --- | --- | --- |
| 核心后端 | `api.evanshine.me` + `yingyue-cloud-repo/backend` | 订单、相册、OSS 权限、SPI 日志必须统一 |
| 后台管理 | `yingyue-cloud-repo/admin-ui` | 复用 RuoYi 权限、菜单、OSS 上传、审计 |
| 客户取片端 | `yingyue-cloud-repo/mobile-uniapp` | 一套代码构建 H5、微信小程序、抖音小程序 |
| 抖音生活服务 | `DOUYIN_LIFE` 后端模块 | SPI、发码、退款、预约、库存、核销不能放小程序端 |
| 抖音小程序 | `DOUYIN_MINI_APP` 客户入口 | 只负责登录、取片、预览、保存 |
| 微信小程序 | 微信客户入口 | 同样只调用 `/client/photo/*` |
| OSS | 私有阿里云 OSS | 客户端只拿短期签名 URL 或 `/stream` |
| 平台云 | 可选 BFF | 只做登录/手机号授权/轻量代理，不放主账本 |

## 朋友项目代码地图

### `photoshop-master`

| 模块 | 路径 | 价值 | 正式落点 |
| --- | --- | --- | --- |
| 路由 | `photoshop-master/frontend/src/app/router/index.ts` | 后台页面结构：主控台、订单、日程、门店、在线选片配置、客片管理、在线选片 | `admin-ui/src/views/yy/*` |
| 客片管理 | `photoshop-master/frontend/src/features/albums/PhotoMgmtView.vue` | 相册管理、照片运营 UI | `admin-ui/src/views/yy/photo/index.vue` |
| 在线选片 | `photoshop-master/frontend/src/features/selection/OnlineSelectionView.vue` | 选片链接、选片状态、客户选择体验 | `mobile-uniapp/src/pages/pickup/*` 和后续选片表 |
| 在线选片配置 | `photoshop-master/frontend/src/features/products/ProductConfigView.vue`、`components/SelectionConfigModal.vue` | 选片规则、数量、有效期配置 | 后台相册/套系配置 |
| 日程 | `photoshop-master/frontend/src/features/schedule/ScheduleView.vue` | 预约日历和时段视觉 | 抖音预约库存页 |
| Dashboard | `photoshop-master/frontend/src/features/dashboard/DashboardView.vue` | 运营数据卡片和趋势图 | 后台首页 / 渠道页 |
| 后端选片 | `photoshop-master/backend/src/main/java/com/amberstudio/selection/*` | 选片链接、提交选择、统计模型 | 只参考模型，不迁移 demo 后端 |
| 后端相册 | `photoshop-master/backend/src/main/java/com/amberstudio/album/*` | 相册、照片排序、照片命名 | 对齐 `yy_photo_album` / `yy_photo_asset` |

### `yuyue-main`

| 模块 | 路径 | 价值 | 正式落点 |
| --- | --- | --- | --- |
| 小程序路由 | `yuyue-main/client/src/app.config.ts` | 首页、预约、底片、订单、我的五栏结构 | `mobile-uniapp/src/pages.json` 后续扩展 |
| 请求封装 | `yuyue-main/client/src/api/request.ts` | token 注入、错误提示、401 处理 | `mobile-uniapp/src/api/request.ts` |
| 手机号登录 | `yuyue-main/client/src/pages/auth/*` | 登录、手机号、验证码、实名流程 | `mobile-uniapp/src/platform/*` |
| 预约服务 | `yuyue-main/client/src/pages/services/*` | 套系/服务选择 | 后续自有预约入口 |
| 订单 | `yuyue-main/client/src/pages/orders/*` | 订单卡片、详情、状态 | 客户订单/相册关联 |
| 底片 | `yuyue-main/client/src/pages/negatives/index.tsx` | 客户选片状态和提交体验 | 影约云在线选片二期 |
| 后端文件签名 | `yuyue-main/server/src/main/java/com/amberfilm/file/*` | 上传 token、下载 URL 思路 | 继续使用 RuoYi OSS + 签名 URL |
| 后端会员资产 | `yuyue-main/server/src/main/java/com/amberfilm/member/*` | 客户资产/底片归属模型 | `yy_photo_album` / `yy_photo_asset` |

## 优化总路线

### P0：先把当前正式链路稳定上线

| 任务 | 正式文件 | 验收 |
| --- | --- | --- |
| 后台上传照片闭环稳定 | `admin-ui/src/views/yy/photo/index.vue`、`photoUpload.ts` | 上传后自动创建 `yy_photo_asset`，`objectKey` 可排查 |
| 客户取片 H5 稳定 | `mobile-uniapp/src/pages/pickup/*` | 手机号 + 取片码登录、相册、详情、预览、下载可用 |
| 微信小程序构建与导入 | `mobile-uniapp/dist/build/mp-weixin` | 微信开发者工具能打开，合法域名为 `https://api.evanshine.me` |
| 抖音小程序构建与导入 | `mobile-uniapp/dist/build/mp-toutiao` | 抖音开发者工具能打开，AppID `tta3c8d5753dac3aae01` |
| 抖音 Webhook / SPI 地址统一 | `backend/.../YyDouyinLifeSpiController.java` | 新配置优先 `https://api.evanshine.me/api/douyin/life/*` |

### P1：吸收朋友项目最有价值的交互

| 任务 | 参考源 | 正式落点 | 验收 |
| --- | --- | --- | --- |
| 后台相册“取片入口”完善 | `photoshop-master` online selection | `admin-ui/src/views/yy/photo/index.vue` | 可复制取片链接、取片码、客户话术 |
| 二维码入口 | `qrcode.vue` 经验或轻量 QR 实现 | 后台相册取片弹窗 | 运营能扫码验证 H5/小程序入口 |
| 在线选片模式 | `photoshop-master/selection`、`yuyue-main/negatives` | 新选片记录 + `mobile-uniapp` | 客户可选照片并提交 |
| 订单详情排障 | `yuyue-main` 订单卡片 | `admin-ui/src/views/yy/order/index.vue` | 一屏看到订单、相册、照片、访问失败 |
| 手机号授权 | `yuyue-main/client/src/pages/auth/*` | `mobile-uniapp/src/platform/wechat.ts`、`douyin.ts` | 授权成功跳过取片码，失败回退 |

### P2：运营体验和平台联动

| 任务 | 目标 |
| --- | --- |
| 预约档期/库存可视化 | 借鉴 `photoshop-master` 日程 UI，把抖音预约库存做成可运营看板 |
| 抖音订单自动生成相册 | 支付/预约成功后自动生成相册占位，客户上传完成后直接取片 |
| 精修交付状态 | 底片、已选、精修中、可下载、已过期状态流 |
| 访问审计聚合 | 后台按手机号、相册、失败原因聚合最近访问 |
| 平台云 BFF POC | 微信云/抖音云只验证登录、手机号授权、代理核心 API |

## 小程序创建和导入规划

| 平台 | AppID | 正式源码 | 构建命令 | 导入目录 |
| --- | --- | --- | --- | --- |
| 微信小程序 | `wx2a1a34748f56a6c6` | `mobile-uniapp` | `npm run build:mp-weixin` | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-weixin` |
| 抖音小程序 | `tta3c8d5753dac3aae01` | `mobile-uniapp` | `npm run build:mp-toutiao` | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao` |
| H5 | 无 | `mobile-uniapp` | `npm run dev:h5` / `npm run build:h5` | 浏览器访问本地 H5 |

合法域名统一：

```text
https://api.evanshine.me
```

需要配置到 request、uploadFile、downloadFile。若平台不接受 OSS 签名域名，图片统一走：

```text
GET https://api.evanshine.me/client/photo/assets/{assetId}/stream
```

## 执行清单

### 本轮文档沉淀

- [x] 明确朋友项目和正式项目边界。
- [x] 明确 `photoshop-master` 可吸收模块。
- [x] 明确 `yuyue-main` 可吸收模块。
- [x] 明确抖音小程序目录不是正式源码。
- [x] 明确正式小程序仍是 `mobile-uniapp`。

### 下一轮代码优化

- [x] 给后台取片入口补二维码展示：已接 `qrcode` 生成真实 H5 二维码，未配置 H5 时显示微信/抖音小程序兜底引导。
- [x] 给订单详情抽屉补相册数量、照片数量、最近访问失败摘要：已在订单详情中展示关联相册、可见照片、失败访问、下一步建议，并默认脱敏手机号。
- [x] 给 `mobile-uniapp` 补小程序保存图片权限提示：微信/抖音保存图片失败时会提示开启相册权限，H5 下载继续使用 stream + header token。
- [x] 给客户取片端做一轮 UI 质感升级：登录、相册、详情、预览统一灰白底 + 深绿主操作色，保留异常状态的暖色提示。
- [ ] 给在线选片增加最小模型：选中/取消/提交/后台查看。
- [ ] 把 P1 的每步补测试后再提交。

## 2026-06-09 本轮落地记录

| 项 | 结果 |
| --- | --- |
| 后台订单排障 | `admin-ui/src/views/yy/order/index.vue` 已补“取片排障”入口，详情抽屉展示相册数、可见照片数、失败访问数、最近失败原因和下一步建议 |
| 隐私处理 | 订单列表和订单详情中的客户手机号默认脱敏显示 |
| 跳转排障 | 详情抽屉可按订单跳转客片相册，也可按客户手机号跳转访问审计 |
| 客户端 UI | `mobile-uniapp/src/styles/app.scss`、`src/pages.json`、`src/App.vue` 已统一更清爽的灰白视觉底色和小程序导航栏颜色 |
| 自动化约束 | `orderPageContract.test.ts` 已约束“取片排障、手机号脱敏、下一步建议”不能被误删 |

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
mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests=false "-Dsurefire.failIfNoSpecifiedTests=false" "-Dtest=YyClientPhotoControllerTest,YyClientPhotoServiceImplTest,YyPhotoAccessLogServiceImplTest" test
```

## 风险控制

| 风险 | 控制 |
| --- | --- |
| 多套项目混乱 | 正式生产只认 `yingyue-cloud-repo` |
| 朋友 Taro 项目误合入 | 只吸收交互，不迁移运行时代码 |
| 抖音小程序和生活服务混淆 | 小程序只取片；`DOUYIN_LIFE` 只在后端 |
| OSS 为了预览改公共读 | 禁止，继续私有 + 签名/stream |
| 密钥泄露 | 地图只写路径和用途，不写值 |
| 地图漂移 | 每次代码优化后同步主仓库 `docs` 和桌面 `yiyue` |
