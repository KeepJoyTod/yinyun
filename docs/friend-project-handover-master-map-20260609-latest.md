# 影约云朋友项目接手总图

日期：2026-06-09

## 结果

朋友交给你的内容已经分成三类资产处理：

| 类型 | 路径 | 定位 | 结论 |
| --- | --- | --- | --- |
| 正式影约云主仓库 | `D:\OtherProject\CameraApp\yingyue-cloud-repo` | 生产开发基线 | 只在这里做正式代码、构建、提交 |
| 前端优化参考项目 | `C:\Users\Administrator\Desktop\yiyue\前端优化\photoshop-master`、`D:\OtherProject\CameraApp\photoshop-master` | 朋友做的影楼后台 Demo | 只吸收 UI、在线选片、客片管理、排期体验 |
| 预约/小程序参考项目 | `C:\Users\Administrator\Desktop\yiyue\微信小程序\yuyue-main`、`D:\OtherProject\CameraApp\yuyue-main` | 朋友做的 Taro 小程序 + 后端 Demo | 只吸收预约、订单、底片、登录流程 |
| 抖音小程序交接目录 | `C:\Users\Administrator\Desktop\yiyue\抖音小程序` | 抖音端配置和地图目录 | 不是源码目录 |
| 正式小程序源码 | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp` | H5 / 微信小程序 / 抖音小程序统一源码 | 继续维护这一套 |

一句话：朋友项目是参考素材，不替换正式影约云。正式后台仍是 RuoYi `admin-ui`，正式客户取片仍是 `mobile-uniapp`，正式核心后端仍是 Spring Boot + `api.evanshine.me`。

## 核心边界

| 事项 | 正式选择 | 不做 |
| --- | --- | --- |
| 后端 API | `https://api.evanshine.me` | 不把核心接口迁到朋友 Demo 后端 |
| 后台运营 | `yingyue-cloud-repo\admin-ui` | 不整包替换为 `photoshop-master\frontend` |
| 客户取片 | `yingyue-cloud-repo\mobile-uniapp` | 不把 Taro 项目改成正式取片端 |
| 微信小程序 | uni-app 构建 `mp-weixin` | 不另起一套微信原生或 Taro 正式端 |
| 抖音小程序 | uni-app 构建 `mp-toutiao` | 不把抖音生活服务 SPI 放进小程序 |
| 抖音来客 | `DOUYIN_LIFE` 后端模块 | 不和 `DOUYIN_MINI_APP` 混线 |
| 图片存储 | 私有阿里云 OSS + 签名 URL / `/stream` | 不使用公共读，不暴露长期直链 |
| 平台云 | 微信云/抖音云可选 BFF | 不承载主订单、主相册、OSS 权限 |

## 当前正式链路状态

| 链路 | 状态 | 入口 |
| --- | --- | --- |
| 后台客片上传 | 已接入 | `admin-ui/src/views/yy/photo/index.vue` |
| 后台订单取片排障 | 已接入首版 | `admin-ui/src/views/yy/order/index.vue` |
| 客户 H5 取片 | 已跑通 | `mobile-uniapp/src/pages/pickup/*` |
| 在线选片最小模型 | 已接入首版 | `POST /client/photo/albums/{albumId}/selection`、`mobile-uniapp/src/pages/pickup/detail/index.vue` |
| 后台相册运营排障 | 已接入首版 | `admin-ui/src/views/yy/photo/index.vue`、`admin-ui/src/views/yy/utils/photoOperationsHealth.ts` |
| 微信小程序 | AppID 已填，构建目录明确 | `mobile-uniapp/dist/build/mp-weixin` |
| 抖音小程序 | AppID 已填，构建目录明确 | `mobile-uniapp/dist/build/mp-toutiao` |
| 抖音生活服务 | SPI / OpenAPI / logid 已沉淀 | `backend/ruoyi-modules/ruoyi-yy` |
| OSS 私有访问 | 已按私有 OSS 设计 | 签名 URL 或 `/client/photo/assets/{assetId}/stream` |

## 朋友项目可吸收模块

### `photoshop-master`

| 模块 | 参考文件 | 吸收价值 | 正式落点 |
| --- | --- | --- | --- |
| 影楼后台壳 | `frontend/src/app/router/index.ts`、`frontend/src/shared/components/layout/*` | 后台导航、主控台、运营布局 | `admin-ui/src/views/yy/*` 局部吸收，不换框架 |
| 客片管理 | `frontend/src/features/albums/PhotoMgmtView.vue` | 左侧相册列表、照片网格、拖拽排序、生成选片链接 | `admin-ui/src/views/yy/photo/index.vue` |
| 在线选片链接 | `frontend/src/features/selection/OnlineSelectionView.vue` | 二维码、有效期、访问次数、客户加片统计 | 后台取片入口 + 后续选片模型 |
| 日程排期 | `frontend/src/features/schedule/ScheduleView.vue` | 时段可视化、预约容量 | 抖音预约库存运营页 |
| Dashboard | `frontend/src/features/dashboard/DashboardView.vue` | 运营指标卡、趋势图 | 后台首页、抖音联调页统计卡 |
| Demo 后端选片 | `backend/src/main/java/com/amberstudio/selection/*` | 选片链接、提交、统计模型 | 只参考字段和流程，不迁移后端 |

不吸收：Spring Boot 4 Demo 后端、MinIO 替代方案、Demo 用户体系、Demo 密钥。

### `yuyue-main`

| 模块 | 参考文件 | 吸收价值 | 正式落点 |
| --- | --- | --- | --- |
| Taro 小程序页面 | `client/src/app.config.ts` | 首页、预约、底片、订单、我的五栏结构 | `mobile-uniapp/src/pages.json` 后续扩展 |
| 请求封装 | `client/src/api/request.ts` | token 注入、401 处理、统一错误提示 | `mobile-uniapp/src/api/request.ts` |
| 登录流程 | `client/src/pages/auth/*` | 协议勾选、手机号、验证码、实名页 | 微信/抖音手机号授权二期 |
| 底片选片 | `client/src/pages/negatives/index.tsx` | 选择数量、选片进度、待提交/已完成状态 | `mobile-uniapp/src/pages/pickup/detail/index.vue` |
| 订单详情 | `client/src/pages/orders/*` | 客户侧订单状态和入口 | 后续客户订单/相册绑定页 |
| Demo 后端文件能力 | `server/src/main/java/com/amberfilm/file/*` | 上传/下载 URL 思路 | 继续用 RuoYi OSS，不迁移实现 |

不吸收：Taro 作为正式框架、H2 Demo 数据、Demo 后端认证、旧 AppID。

## 正式小程序信息

| 平台 | AppID | 构建命令 | 导入目录 |
| --- | --- | --- | --- |
| 微信小程序 | `wx2a1a34748f56a6c6` | `npm run build:mp-weixin` | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-weixin` |
| 抖音小程序 | `tta3c8d5753dac3aae01` | `npm run build:mp-toutiao` | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao` |
| H5 | 无 | `npm run dev:h5` / `npm run build:h5` | `http://127.0.0.1:5174/#/pages/pickup/login/index` |

平台后台合法域名统一配置：

```text
request合法域名: https://api.evanshine.me
downloadFile合法域名: https://api.evanshine.me
uploadFile合法域名: https://api.evanshine.me
```

## 优化路线

### P0：上线稳定性

| 任务 | 文件 | 验收 |
| --- | --- | --- |
| 后台上传照片闭环复核 | `admin-ui/src/views/yy/photo/index.vue`、`photoUpload.ts` | 上传后生成 `yy_photo_asset`，`objectKey` 不为空 |
| 订单一屏排障稳定 | `admin-ui/src/views/yy/order/index.vue` | 能看到相册数、可见照片数、失败访问和下一步建议 |
| H5/小程序取片稳定 | `mobile-uniapp/src/pages/pickup/*` | 登录、相册、详情、预览、下载/保存可用 |
| 微信/抖音开发者工具导入 | `mobile-uniapp/dist/build/*` | 两端都能打开取片页 |
| Webhook / SPI 地址收敛 | `YyDouyinLifeSpiController` | 开放平台优先填 `api.evanshine.me` |

### P1：吸收朋友项目体验

| 任务 | 参考源 | 正式落点 | 验收 |
| --- | --- | --- | --- |
| 在线选片最小模型 | `photoshop-master/selection`、`yuyue-main/negatives` | 后端 `isSelected` / `selectionStatus` 首版复用 | 已接入首版：客户选中照片并提交，后台能按相册查看已选 |
| 取片入口二维码增强 | `OnlineSelectionView.vue` | 后台相册页 | 二维码、取片码、分享话术一屏复制 |
| 相册运营 UI 加强 | `PhotoMgmtView.vue` | 后台客片页 | 相册列表、照片状态、访问审计更清楚 |
| 微信手机号授权 | `yuyue-main/client/src/pages/auth/*` | `mobile-uniapp/src/platform/wechat.ts` | 授权成功免取片码，失败回退 |
| 抖音手机号授权 | Taro TT 构建经验 + uni-app 适配器 | `mobile-uniapp/src/platform/douyin.ts` | 授权成功绑定平台身份 |

### P2：产品化

| 任务 | 目标 |
| --- | --- |
| 抖音订单自动相册 | 支付/预约成功后自动创建或绑定客户相册 |
| 精修交付流 | 待选片、已提交、精修中、可下载、已过期 |
| 预约库存可视化 | 借鉴 `photoshop-master` 日程 UI 做抖音预约库存看板 |
| 平台云 BFF POC | 微信云/抖音云只做登录和轻量代理 |
| 访问审计聚合 | 按手机号、相册、失败原因聚合，减少排障成本 |

## 2026-06-09 在线选片落地记录

| 项 | 结果 |
| --- | --- |
| 后端接口 | 新增 `POST /client/photo/albums/{albumId}/selection` |
| 权限规则 | 复用客户 `X-Client-Token`，校验手机号、相册授权、相册有效期和可见底片 |
| 数据写入 | 选中底片写 `yy_photo_asset.is_selected=1`，同相册其他可见底片写 `0`，相册 `selection_status=SUBMITTED` |
| 客户端 | `mobile-uniapp` 相册详情页增加“选择/取消”和底部“提交选片” |
| 后台 | 相册行增加“查看已选”，自动切到底片列表并筛选 `isSelected=1`、`visible=1` |
| 审计 | 写入 `SELECTION_SUBMIT` 访问日志 |

## 地图文件总览

| 文件 | 用途 |
| --- | --- |
| `docs/friend-project-takeover-control-plan-20260609.md` | repo 内接手总控执行图，统一正式/参考项目边界和 P0/P1/P2 |
| `docs/friend-project-handover-master-map-20260609-latest.md` | 本文件，最新总控地图 |
| `docs/friend-project-optimization-implementation-plan-20260609-latest.md` | 可执行优化计划 |
| `docs/friend-photoshop-master-code-map-20260609.md` | `photoshop-master` 代码地图 |
| `docs/friend-yuyue-main-code-map-20260609.md` | `yuyue-main` 代码地图 |
| `docs/douyin-miniapp-takeover-map-20260609.md` | 抖音小程序接手地图 |
| `docs/photo-pickup-ui-optimization-map.md` | 客户取片 UI 优化地图 |

## 2026-06-09 深度扫描补充

### 参考项目副本关系

| 项目 | 桌面副本 | 工作区副本 | 处理方式 |
| --- | --- | --- | --- |
| `photoshop-master` | `C:\Users\Administrator\Desktop\yiyue\前端优化\photoshop-master` | `D:\OtherProject\CameraApp\photoshop-master` | 两份内容高度一致，作为同一摄影后台参考项目 |
| `yuyue-main` | `C:\Users\Administrator\Desktop\yiyue\微信小程序\yuyue-main` | `D:\OtherProject\CameraApp\yuyue-main` | 两份内容高度一致，作为同一预约/小程序参考项目 |
| 抖音小程序资料 | `C:\Users\Administrator\Desktop\yiyue\抖音小程序` | 无源码副本 | 资料目录，不是正式源码 |

### `photoshop-master` 扫描结论

| 项 | 结论 |
| --- | --- |
| 前端技术栈 | Vue 3 + TypeScript + Vite + Tailwind v4 + Radix Vue + lucide-vue-next |
| 后端技术栈 | Spring Boot + MyBatis Plus + Flyway + MinIO Demo |
| 入口 | `frontend/src/main.ts`、`frontend/src/app/App.vue`、`frontend/src/app/router/index.ts` |
| 样式 | `frontend/src/style.css` 存放设计 token |
| API | `frontend/src/shared/api/request.ts`、`frontend/src/shared/api/backend.ts` |
| 重点页面 | `OrdersView.vue`、`ScheduleView.vue`、`PhotoMgmtView.vue`、`OnlineSelectionView.vue`、`SelectionConfigModal.vue` |
| 可借鉴 | 后台信息密度、订单高级筛选、日程时段板、客片网格、选片二维码/链接 |
| 风险 | 不迁移 `.env`、localhost 代理、Demo 后端、MinIO、硬编码尺寸、固定样例人员数据 |

### `yuyue-main` 扫描结论

| 项 | 结论 |
| --- | --- |
| 小程序技术栈 | Taro 4.1.9 + React 18 + TypeScript + Zustand + SCSS |
| 后端技术栈 | Spring Boot 3.3.5 + Java 17 + Flyway + H2/MySQL |
| 小程序入口 | `client/src/app.tsx`、`client/src/app.config.ts` |
| 平台配置 | `client/project.config.json`、`client/project.tt.json` |
| 可借鉴页面 | 首页、预约服务、预约确认、订单、底片、我的、手机号登录 |
| 正式处理 | 不迁移 Taro，交互思路改写进 `mobile-uniapp` |

### 下一阶段执行路线

| 优先级 | 任务 | 正式落点 | 验收 |
| --- | --- | --- | --- |
| P0 | 小程序开发者工具真机验收 | `mobile-uniapp/dist/build/mp-weixin`、`mp-toutiao` | 登录、相册、预览、保存可用 |
| P0 | 真实测试图闭环 | 后台上传 + H5/小程序预览 | OSS 私有、签名/stream 可访问 |
| DONE/P1 | 相册运营排障视图首版 | `admin-ui/src/views/yy/photo/index.vue`、`photoOperationsHealth.ts` | 手机号、取片码、照片数、缺 Key、最近失败原因同屏 |
| DONE/P1 | 相册运营排障批量聚合接口 | 后端相册/底片/审计聚合接口 + 后台调用 | 已接入：不依赖当前页已加载底片和审计日志，避免统计偏低 |
| P1 | 平台手机号授权 | `mobile-uniapp/src/platform/*` + 后端 `platform-login` | 微信/抖音授权成功免取片码 |
| P1 | 抖音订单自动相册 | `DOUYIN_LIFE` 后端模块 | 支付/预约成功后自动创建或绑定相册 |
| P2 | 预约库存看板 | 后台抖音生活服务页 | 门店、日期、时段库存可视化 |
| P2 | 加片/精修交付流 | 相册/底片/报表 | 待选片、精修中、可下载、过期闭环 |

## 2026-06-09 相册运营排障首版

| 项 | 结果 |
| --- | --- |
| 正式文件 | `admin-ui/src/views/yy/photo/index.vue` |
| 工具函数 | `admin-ui/src/views/yy/utils/photoOperationsHealth.ts` |
| 测试 | `photoOperationsHealth.test.ts`、`photoPageContract.test.ts` |
| 展示内容 | `可交付 / 需确认 / 需处理` 状态、下一步建议、手机号、客户取片码、照片数、已选数、缺 OSS Key 数、最近失败访问 |
| 操作入口 | 相册行可直接进入“查看审计” |
| 当前边界 | 已优先使用后端批量聚合接口；接口失败时降级到当前已加载 `assetList` 和 `accessLogList` 汇总 |

## 2026-06-09 相册运营排障批量聚合接口

| 项 | 结果 |
| --- | --- |
| 后端接口 | `GET /yy/photoAlbum/operations-summary?albumIds=1,2,3` |
| 后端 VO | `YyPhotoAlbumOperationsSummaryVo` |
| 后端 Service | `YyPhotoAlbumServiceImpl.queryOperationsSummary(...)` |
| 后台 API | `listYyPhotoAlbumOperationsSummary(albumIds)` |
| 后台页面 | `admin-ui/src/views/yy/photo/index.vue` 中 `albumOperationsSummaryMap`、`loadAlbumOperationsSummaries`、`getFallbackAlbumOperationsStats` |
| 数据口径 | 底片总数、客户可见数、已选数、可见但缺 OSS Key 数、最近失败访问 |
| 降级策略 | 聚合接口失败时仍用当前页已加载底片/访问日志估算，页面可继续使用 |

## 验证命令

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run test:yy
npm run build:dev
```

## 2026-06-09 接手执行总控补充

### 结论

朋友项目已经完成资产归类：`photoshop-master` 是摄影后台体验参考，`yuyue-main` 是小程序/预约体验参考，正式生产代码仍只落在 `D:\OtherProject\CameraApp\yingyue-cloud-repo`。

### 正式落地优先级

| 优先级 | 任务 | 正式落点 | 验收 |
| --- | --- | --- | --- |
| P0 | 微信/抖音开发者工具导入和真机验收 | `mobile-uniapp/dist/build/mp-weixin`、`mp-toutiao` | 手机号 + 取片码、相册、预览、保存可用 |
| P0 | OSS 私有取片复核 | 后台上传 + `/client/photo/*` | `objectKey` 有值，裸 OSS 不公开，`/stream` 可访问 |
| P0 | 后台相册/订单排障复核 | `admin-ui/src/views/yy/photo/index.vue`、`order/index.vue` | 照片数、缺 Key、最近失败访问口径一致 |
| P1 | 相册工作台抽屉 | `admin-ui/src/views/yy/photo/index.vue` | 借鉴 `PhotoMgmtView.vue` 的照片网格和运营动作 |
| P1 | 取片二维码和分享话术增强 | `photoPickupEntry.ts` | H5/微信/抖音三端入口一屏复制 |
| P1 | 微信/抖音手机号授权 | `mobile-uniapp/src/platform/*`、后端 `platform-login` | 授权成功免取片码，失败回退手输 |
| P1 | 抖音订单自动相册 | 后端 `DOUYIN_LIFE` | 支付/预约成功后自动创建或绑定相册 |
| P2 | 日程库存看板 | 后台抖音预约库存页 | 按门店、日期、时段看库存和异常 |
| P2 | 精修交付流 | 相册/底片/报表 | 待选片、已提交、精修中、可下载、过期 |

### 朋友项目吸收规则

| 参考源 | 吸收 | 不吸收 |
| --- | --- | --- |
| `photoshop-master/frontend` | 相册网格、在线选片链接、二维码、日程时段、运营卡片 | Vue/Tailwind/Radix 整套替换、Demo 后端、MinIO、硬编码样例 |
| `photoshop-master/backend` | 选片链接和统计字段思路 | 数据库、鉴权、文件服务实现 |
| `yuyue-main/client` | 登录节奏、订单/底片页面、底部导航结构 | Taro/React 运行时代码、旧 AppID |
| `yuyue-main/server` | 预约/订单/手机号接口模型 | 主订单、主相册、文件权限实现 |

### 小程序边界

| 线 | 职责 |
| --- | --- |
| `DOUYIN_MINI_APP` | 客户取片入口，调用 `https://api.evanshine.me/client/photo/*` |
| `WECHAT_MINI_APP` | 客户取片入口，和抖音共用 uni-app 页面 |
| `DOUYIN_LIFE` | 抖音来客 SPI/OpenAPI，负责发码、退款、预约、库存、核销、logid |
| 平台云 BFF | 后续可选，只做登录、手机号授权、轻量代理，不放主账本 |

### 最新建议

下一步先做两件可验收的事：第一，完成微信/抖音开发者工具真机预览证据；第二，继续开发 `mobile-uniapp/src/platform/*` 的平台手机号授权适配层。相册大改版放在授权和真机链路稳定之后，避免 UI 先动导致验收面扩大。

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
