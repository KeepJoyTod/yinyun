# 朋友项目接手执行蓝图

日期：2026-06-09

## 结果

朋友交给你的两个项目已经完成归类：

| 项目 | 路径 | 定位 |
| --- | --- | --- |
| `photoshop-master` | `D:\OtherProject\CameraApp\photoshop-master`、`docs\yiyue\前端优化\photoshop-master` | 摄影后台 UI/流程参考 |
| `yuyue-main` | `D:\OtherProject\CameraApp\yuyue-main`、`docs\yiyue\微信小程序\yuyue-main` | 小程序登录、预约、订单、底片流程参考 |
| 正式项目 | `D:\OtherProject\CameraApp\yingyue-cloud-repo` | 唯一生产开发基线 |

正式代码只改 `yingyue-cloud-repo`。朋友项目只做参考，不直接替换正式后台、小程序或后端。

## 架构边界

| 模块 | 正式选择 |
| --- | --- |
| 后端核心 API | `https://api.evanshine.me` |
| 后端源码 | `backend` |
| 后台运营 | `admin-ui` |
| H5 / 微信 / 抖音客户取片 | `mobile-uniapp` |
| 抖音来客 | 后端 `DOUYIN_LIFE` 模块 |
| 微信/抖音小程序 | `mobile-uniapp` 编译 `mp-weixin` / `mp-toutiao` |
| 图片存储 | 私有阿里云 OSS + 签名 URL 或后端 `/stream` |

## P0：正式链路验收

| 任务 | 命令/入口 | 验收 |
| --- | --- | --- |
| 后台测试 | `cd admin-ui; npm run test:yy` | YY 相关测试通过 |
| 后台构建 | `cd admin-ui; npm run build:dev` | 构建通过 |
| 小程序类型检查 | `cd mobile-uniapp; npm run typecheck` | 无类型错误 |
| 微信构建 | `cd mobile-uniapp; npm run build:mp-weixin` | 生成 `dist/build/mp-weixin` |
| 抖音构建 | `cd mobile-uniapp; npm run build:mp-toutiao` | 生成 `dist/build/mp-toutiao` |
| 后端客户取片测试 | `cd backend; mvn -pl ruoyi-modules/ruoyi-yy -am -DskipTests=false "-Dsurefire.failIfNoSpecifiedTests=false" "-Dtest=YyClientPhotoControllerTest,YyClientPhotoServiceImplTest,YyPhotoAccessLogServiceImplTest,YyPhotoAlbumServiceImplTest" test` | 指定测试通过 |

## P1：吸收朋友后台体验

| 模块 | 参考源 | 正式落点 | 做法 |
| --- | --- | --- | --- |
| 相册工作台 | `photoshop-master/frontend/src/features/albums/PhotoMgmtView.vue` | `admin-ui/src/views/yy/photo/index.vue` | 增加抽屉/分屏，不替换原表格 |
| 取片入口 | `photoshop-master/frontend/src/features/selection/OnlineSelectionView.vue` | `photoPickupEntry.ts`、相册页 | 二维码、有效期、复制话术、访问统计 |
| 日程库存 | `photoshop-master/frontend/src/features/schedule/ScheduleView.vue` | 后台抖音预约库存页 | 门店、日期、时段、库存异常 |
| 运营指标 | `photoshop-master/frontend/src/features/dashboard/DashboardView.vue` | 后台首页/抖音联调页 | 订单、相册、访问失败、退款状态 |

## P1：吸收朋友小程序体验

| 模块 | 参考源 | 正式落点 | 做法 |
| --- | --- | --- | --- |
| 登录节奏 | `yuyue-main/client/src/pages/auth/*` | `mobile-uniapp/src/pages/pickup/login/index.vue`、`src/platform/*` | 平台手机号授权 + 手输取片码兜底 |
| 底片选片 | `yuyue-main/client/src/pages/negatives/index.tsx` | `mobile-uniapp/src/pages/pickup/detail/index.vue` | 选片数量、提交状态、已选提示 |
| 客户订单 | `yuyue-main/client/src/pages/orders/*` | 后续 `mobile-uniapp/src/pages/orders/*` | 客户订单到相册入口 |
| 首页结构 | `yuyue-main/client/src/app.config.ts` | 后续 `mobile-uniapp/src/pages.json` | P2 再扩底部导航 |

## P1：平台手机号授权计划

| 步骤 | 文件 | 验收 |
| --- | --- | --- |
| 平台能力抽象 | `mobile-uniapp/src/platform/types.ts` | 微信/抖音/H5 统一返回能力状态 |
| 微信适配 | `mobile-uniapp/src/platform/wechat.ts` | 已有 `uni.login`；登录页可展示手机号授权按钮 |
| 抖音适配 | `mobile-uniapp/src/platform/douyin.ts`、`phone-auth.mjs` | 已允许抖音端展示手机号授权入口 |
| 登录页接入 | `mobile-uniapp/src/pages/pickup/login/index.vue` | 已接入：平台端显示授权按钮，失败回退手输取片码 |
| 后端换 token | `/client/photo/auth/platform-login` | 微信 provider 已接入：支持静态 `wechat-access-token` 或 `wechat-app-id` + `wechat-app-secret` 自动获取/缓存 access_token；抖音 provider 仍保留 token/path 可配置 |

## P1：抖音来客订单相册联动

| 任务 | 后端落点 | 验收 |
| --- | --- | --- |
| 支付/预约成功建相册占位 | `DOUYIN_LIFE` 订单/预约回调服务 | 有手机号时自动创建或复用相册 |
| 券码关联相册 | 相册字段或关联表 | 后台可按券码、订单号查相册 |
| 小程序订单入口 | `mobile-uniapp` 后续订单页 | 授权手机号后看到关联相册 |
| logid 聚合 | 后台抖音联调页 | SPI/OpenAPI 最近 logid 可复制 |

## 禁止事项

| 禁止项 | 原因 |
| --- | --- |
| 不把 `photoshop-master` 整包迁入 `admin-ui` | 技术栈和权限体系不同 |
| 不把 `yuyue-main` Taro 项目当正式小程序 | 正式策略是一套 uni-app 多端 |
| 不迁移 Demo 后端 | 主订单、主相册、OSS 权限都在正式 Spring Boot |
| 不把 OSS 改公共读 | 客户照片必须私有 |
| 不把抖音 SPI 放进小程序 | 生活服务回调必须服务端接收并记录 logid |

## 当前下一步

1. 用开发者工具真机验证微信/抖音授权按钮和取片码回退。
2. 在部署环境配置微信 `wechat-app-id` / `wechat-app-secret`，用真机微信手机号授权验证 `/client/photo/auth/platform-login` 真正换 `client_token`。
3. 在后台相册页加“相册工作台”抽屉，吸收朋友项目的客片网格体验。
4. 抖音来客订单/预约稳定后，再做自动相册占位。

## 2026-06-09 平台手机号授权阶段进展

| 项 | 结果 |
| --- | --- |
| 前端 helper | 新增 `mobile-uniapp/src/platform/phone-auth.mjs`，统一判断微信/抖音授权入口、提取 `phoneCode`、构造安全 payload、生成回退提示 |
| 登录页 | `pages/pickup/login/index.vue` 已展示平台手机号授权按钮；后端未接通或用户取消时，提示继续使用手机号 + 取片码 |
| 抖音端 | `DOUYIN_MINI_APP` 已允许展示授权入口，但真正免取片码仍依赖后端解密手机号 |
| 后端 | `platformLogin` 已支持 provider 链；未配置 provider 时继续安全拒绝，微信 provider 已支持 access_token 获取/缓存 |
| 验证 | `mobile-uniapp npm test`、`typecheck`、`build:mp-weixin`、`build:mp-toutiao` 通过；后端 `YyClientPhotoServiceImplTest` 通过 |

## 2026-06-09 微信手机号授权后端进展

| 项 | 结果 |
| --- | --- |
| Provider | `ClientPhotoMiniAppPhoneAuthProvider` |
| 微信 token | 支持 `wechat-access-token` 静态 token；未配置时用 `wechat-app-id` + `wechat-app-secret` 获取并缓存 `access_token` |
| 微信手机号 | 调 `/wxa/business/getuserphonenumber?access_token=...`，只发送 `phoneCode` |
| 安全 | 失败提示不泄露 `phoneCode`、AppSecret、token |
| 构建稳定性 | `ruoyi-yy` 已显式声明 `lombok` 依赖，避免模块重编译时 Lombok getter/setter 缺失 |
| 验证 | `YyClientPhotoServiceImplTest,ClientPhotoMiniAppPhoneAuthProviderTest` 共 18 条通过 |
