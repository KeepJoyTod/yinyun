# 朋友项目接手与优化总规划

更新时间：2026-06-09

## 结论

朋友交接内容已经拆成三类：

| 类型 | 路径 | 定位 | 处理 |
| --- | --- | --- | --- |
| 正式影约云主仓库 | `D:\OtherProject\CameraApp\yingyue-cloud-repo` | 生产开发基线 | 所有正式代码只改这里 |
| 前端优化参考项目 | `docs\yiyue\前端优化\photoshop-master`、`D:\OtherProject\CameraApp\photoshop-master` | 摄影后台 Demo | 吸收 UI、在线选片、相册管理、日程体验 |
| 小程序参考项目 | `docs\yiyue\微信小程序\yuyue-main`、`D:\OtherProject\CameraApp\yuyue-main` | Taro 小程序 + Demo 后端 | 吸收登录、预约、订单、底片流程 |
| 小程序资料目录 | `docs\yiyue\wechatapp`、`douyinapp`、`抖音小程序` | 地图和验收资料 | 保持为文档目录 |
| 正式多端小程序 | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp` | H5 / 微信 / 抖音统一源码 | 继续维护 |

核心判断：朋友项目是参考素材，不替换正式影约云。正式后台仍是 RuoYi `admin-ui`，正式客户取片仍是 `mobile-uniapp`，正式核心后端仍是 Spring Boot + `api.evanshine.me`。

## 架构边界

| 事项 | 正式选择 | 不做 |
| --- | --- | --- |
| 核心 API | `https://api.evanshine.me` | 不把核心接口迁到 Demo 后端 |
| 后台运营 | `admin-ui` | 不整包替换为 `photoshop-master/frontend` |
| 客户取片 | `mobile-uniapp` | 不把 Taro 项目改成正式端 |
| 微信小程序 | `mobile-uniapp` 构建 `mp-weixin` | 不另起微信原生/Taro 正式端 |
| 抖音小程序 | `mobile-uniapp` 构建 `mp-toutiao` | 不把 `DOUYIN_LIFE` SPI 放进小程序 |
| 抖音来客 | `DOUYIN_LIFE` 后端模块 | 不和 `DOUYIN_MINI_APP` 混线 |
| 图片存储 | 私有阿里云 OSS + 签名 URL / `/stream` | 不使用公共读和长期直链 |
| 平台云 | 微信云/抖音云可选 BFF | 不承载主订单、主相册、OSS 权限 |

## 当前正式链路状态

| 链路 | 状态 | 入口 |
| --- | --- | --- |
| 后台客片上传 | 已接入首版 | `admin-ui/src/views/yy/photo/index.vue` |
| 上传自动建底片 | 已接入首版 | `yy_photo_asset` |
| 客户 H5 取片 | 已跑通 | `mobile-uniapp/src/pages/pickup/*` |
| 在线选片最小模型 | 已接入首版 | `POST /client/photo/albums/{albumId}/selection` |
| 后台查看已选 | 已接入首版 | 相册行“查看已选” |
| 后台确认选片 | 已接入首版 | 相册行“确认选片”，`SUBMITTED` 确认到 `COMPLETED` |
| 微信小程序 | AppID 已填，构建目录明确 | `dist/build/mp-weixin` |
| 抖音小程序 | AppID 已填，构建目录明确 | `dist/build/mp-toutiao` |
| 抖音生活服务 | SPI / OpenAPI / logid 地图已沉淀 | `backend/ruoyi-modules/ruoyi-yy` |

## 可吸收模块

### `photoshop-master`

| 模块 | 参考文件 | 吸收价值 | 正式落点 |
| --- | --- | --- | --- |
| 后台壳 | `frontend/src/app/router/index.ts`、`shared/components/layout/*` | 导航分组、页面层级、运营布局 | `admin-ui/src/views/yy/*` 局部吸收 |
| 客片管理 | `frontend/src/features/albums/PhotoMgmtView.vue` | 左侧相册列表、照片网格、上传、排序、生成链接 | `admin-ui/src/views/yy/photo/index.vue` |
| 在线选片链接 | `frontend/src/features/selection/OnlineSelectionView.vue` | 二维码、有效期、访问次数、客户加片统计 | 后台取片入口、在线选片模型 |
| 日程排期 | `frontend/src/features/schedule/ScheduleView.vue` | 时段可视化、预约容量 | 抖音预约库存运营页 |
| Dashboard | `frontend/src/features/dashboard/DashboardView.vue` | 运营指标卡、趋势图 | 后台首页、抖音联调页统计卡 |
| Demo 后端选片 | `backend/src/main/java/com/amberstudio/selection/*` | 选片链接、提交、统计模型 | 只参考字段和流程 |

### `yuyue-main`

| 模块 | 参考文件 | 吸收价值 | 正式落点 |
| --- | --- | --- | --- |
| Taro 小程序页面 | `client/src/app.config.ts` | 首页、预约、底片、订单、我的五栏结构 | `mobile-uniapp/src/pages.json` 后续扩展 |
| 请求封装 | `client/src/api/request.ts` | token 注入、401 处理、统一错误提示 | `mobile-uniapp/src/api/request.ts` |
| 登录流程 | `client/src/pages/auth/*` | 协议勾选、手机号、验证码、实名页 | 微信/抖音手机号授权二期 |
| 底片选片 | `client/src/pages/negatives/index.tsx` | 选择数量、选片进度、待提交/已完成状态 | `mobile-uniapp/src/pages/pickup/detail/index.vue` |
| 订单详情 | `client/src/pages/orders/*` | 客户侧订单状态和入口 | 后续客户订单/相册绑定页 |

## 小程序信息

| 平台 | AppID | 构建命令 | 导入目录 |
| --- | --- | --- | --- |
| 微信小程序 | `wx2a1a34748f56a6c6` | `npm run build:mp-weixin` | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-weixin` |
| 抖音小程序 | `tta3c8d5753dac3aae01` | `npm run build:mp-toutiao` | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao` |
| H5 | 无 | `npm run dev:h5:api` | `http://127.0.0.1:5174/#/pages/pickup/login/index` |

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
| 后台确认选片 | `admin-ui/src/views/yy/photo/index.vue`、现有相册编辑接口 | 已接入，`SUBMITTED` 可确认到 `COMPLETED` |
| 后台上传照片闭环复核 | `admin-ui/src/views/yy/photo/index.vue`、`photoUpload.ts` | 上传后生成 `yy_photo_asset`，`objectKey` 不为空 |
| H5/小程序取片稳定 | `mobile-uniapp/src/pages/pickup/*` | 登录、相册、详情、预览、下载/保存可用 |
| 微信/抖音开发者工具导入 | `mobile-uniapp/dist/build/*` | 两端都能打开取片页 |
| Webhook / SPI 地址收敛 | `YyDouyinLifeSpiController` | 开放平台优先填 `api.evanshine.me` |

### P1：吸收朋友项目体验

| 任务 | 参考源 | 正式落点 | 验收 |
| --- | --- | --- | --- |
| 取片入口二维码增强 | `OnlineSelectionView.vue` | 后台相册页 | 二维码、取片码、分享话术一屏复制 |
| 相册运营 UI 加强 | `PhotoMgmtView.vue` | 后台客片页 | 相册列表、照片状态、访问审计更清楚 |
| 微信手机号授权 | `yuyue-main/client/src/pages/auth/*` | `mobile-uniapp/src/platform/wechat.ts` | 授权成功免取片码，失败回退 |
| 抖音手机号授权 | Taro TT 构建经验 + uni-app 适配器 | `mobile-uniapp/src/platform/douyin.ts` | 授权成功绑定平台身份 |
| 日程/库存可视化 | `ScheduleView.vue` | 抖音预约库存运营页 | 按日期时段查看库存 |

### P2：产品化

| 任务 | 目标 |
| --- | --- |
| 抖音订单自动相册 | 支付/预约成功后自动创建或绑定客户相册 |
| 精修交付流 | 待选片、已提交、精修中、可下载、已过期 |
| 预约库存可视化 | 借鉴 `photoshop-master` 日程 UI 做抖音预约库存看板 |
| 平台云 BFF POC | 微信云/抖音云只做登录和轻量代理 |
| 访问审计聚合 | 按手机号、相册、失败原因聚合，减少排障成本 |

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
