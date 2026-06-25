# 朋友项目接手与优化总规划

日期：2026-06-09

## 结论

正式生产线继续以 `D:\OtherProject\CameraApp\yingyue-cloud-repo` 为准。朋友交接项目只作为体验、页面结构、业务字段和流程设计参考，不迁移主账本、不替换正式技术栈。

| 资产 | 路径 | 定位 | 处理策略 |
| --- | --- | --- | --- |
| 正式主项目 | `D:\OtherProject\CameraApp\yingyue-cloud-repo` | RuoYi / Spring Boot / admin-ui / mobile-uniapp | 唯一生产基线 |
| 预约小程序参考 | `D:\OtherProject\CameraApp\yuyue-main` | Taro React 小程序 + Vue admin + Spring Boot demo server | 吸收预约、订单、底片选片体验 |
| 前端优化参考 | `D:\OtherProject\CameraApp\photoshop-master` | Vue 3 / Vite / Tailwind / Spring Boot demo | 吸收后台 UI、在线选片、相册运营体验 |
| 桌面交接目录 | `docs\yiyue` | 地图、验收、账号、平台配置沉淀 | 同步地图，不放明文密钥 |

## 核心边界

- `api.evanshine.me` 是统一核心后端入口。
- 微信小程序、抖音小程序继续共用 `mobile-uniapp`，不切到 Taro。
- 抖音来客 `DOUYIN_LIFE` 的 SPI、订单、预约、发码、退款、库存、核销都留在 Spring Boot。
- OSS 保持私有，客户端不保存长期 OSS 直链。
- 微信云、抖音云只做可选 BFF，不承载主订单、主相册、客户主数据、OSS 权限。

## 三条执行线

### 1. 客户取片线

目标：把 H5 / 微信小程序 / 抖音小程序客户取片做成可上线产品。

| 优先级 | 任务 | 来源参考 | 落地位置 |
| --- | --- | --- | --- |
| P0 | 真机验证登录、相册、预览、保存图片 | 主项目已有 | `mobile-uniapp` |
| P0 | 继续修复图片错误、空相册、下载失败提示 | 主项目已有 | `mobile-uniapp/src/pages/pickup/*` |
| P1 | 接微信/抖音手机号授权，失败回退取片码 | `yuyue-main/client/src/pages/auth/*` | `mobile-uniapp/src/platform/*` |
| P1 | 订单支付或预约完成后自动创建相册占位 | 抖音生活服务现有订单 | `YyClientPhotoServiceImpl` / Douyin service |
| P2 | 客户在线选片确认、加片状态、提交结果 | `photoshop-master`、`yuyue-main` | `yy_photo_asset` / 新选片表 |

### 2. 后台运营线

目标：让运营能从订单、相册、照片、访问日志一路排障。

| 优先级 | 任务 | 来源参考 | 落地位置 |
| --- | --- | --- | --- |
| P0 | 后台相册上传闭环继续打磨 | 主项目已有 | `admin-ui/src/views/yy/photo/index.vue` |
| P0 | 订单页增加“取片排障”入口，跳转到相册/审计过滤 | 主项目正在做 | `admin-ui/src/views/yy/order/index.vue` |
| P1 | 在线选片链接/二维码/有效期体验 | `photoshop-master/frontend/src/features/selection` | `admin-ui/src/views/yy/photo` |
| P1 | 预约档期与库存面板运营化 | `photoshop-master` schedule / `yuyue-main` booking | `admin-ui/src/views/yy/channel/life` |
| P2 | 门店、套系、财务看板质感参考吸收 | 两个朋友项目 | `admin-ui/src/views/yy/*` |

### 3. 抖音来客线

目标：生活服务验收和正式订单联动稳定。

| 优先级 | 任务 | 说明 |
| --- | --- | --- |
| P0 | SPI 地址统一收敛到 `https://api.evanshine.me/api/douyin/life/*` | `yingyueyun` 只作为历史兼容入口 |
| P0 | Webhook challenge 返回 JSON | `{"challenge": 原值}` |
| P0 | 每个 SPI/OpenAPI 记录 logid | SPI 取 `X-Bytedance-Logid`，OpenAPI 取 `extra.logid` |
| P1 | 抖音订单手机号与客户相册自动关联 | 连接 `DOUYIN_LIFE` 和 `DOUYIN_MINI_APP` |
| P2 | 抖音云 BFF POC | 只做登录、手机号授权、轻量代理 |

## 朋友项目吸收清单

| 来源 | 可吸收 | 不吸收 |
| --- | --- | --- |
| `yuyue-main/client` | 首页、服务预约、订单列表、底片选片、登录授权体验 | Taro 作为正式小程序框架 |
| `yuyue-main/admin` | 简洁运营台布局、预约订单状态展示 | 独立后台替换 RuoYi admin |
| `yuyue-main/server` | 预约、订单、底片接口命名参考 | 独立 Java server、H2/demo 账本 |
| `photoshop-master/frontend` | 相册管理、在线选片链接、二维码、运营数据卡片 | 整套 Tailwind/Radix UI 直接搬迁 |
| `photoshop-master/backend` | 选片链接、相册、操作日志、排期模型 | MinIO/demo 文件系统替换 OSS |

## 文件地图

| 地图 | 路径 |
| --- | --- |
| 接手总规划 | `docs/friend-project-handover-optimization-plan-20260609.md` |
| 接手总控计划 | `docs/friend-project-takeover-master-plan-20260609.md` |
| 前端优化吸收路线图 | `docs/frontend-optimization-roadmap-20260609.md` |
| 抖音小程序接手地图 | `docs/douyin-miniapp-takeover-map-20260609.md` |
| 小程序预览清单 | `docs/miniapp-preview-checklist-20260609.md` |
| 预约小程序参考地图 | `docs/friend-yuyue-main-code-map-20260609.md` |
| 前端优化参考地图 | `docs/friend-photoshop-master-code-map-20260609.md` |
| 差距审计 | `docs/friend-project-gap-audit-20260609.md` |
| 客户取片 UI 优化地图 | `docs/photo-pickup-ui-optimization-map.md` |

## P0 落地顺序

1. 完成主项目订单页“取片排障”真实跳转：订单查相册、客户手机号查访问审计。
2. 微信开发者工具导入 `mobile-uniapp/dist/build/mp-weixin`，用 `api.evanshine.me` 真机验证。
3. 抖音开发者工具导入 `mobile-uniapp/dist/build/mp-toutiao`，用同一取片码链路验证。
4. 后台上传真实照片后，用公网预览账号确认 `/stream` 在小程序端可显示和保存。
5. 从 `photoshop-master` 吸收在线选片二维码/有效期/状态 UI，先做后台入口，不先做新账本。

## 2026-06-09 执行进度

| 项 | 状态 | 说明 |
| --- | --- | --- |
| 接手总规划 | 已完成 | 主仓库和桌面 `yiyue` 均已同步 |
| `yuyue-main` 地图 | 已完成 | 已同步到 `wechatapp` 和 `douyinapp` |
| `photoshop-master` 地图 | 已完成 | 已同步到 `前端优化` |
| 订单取片排障跳转 | 已完成 | 订单页可跳 `/yy/photo?tab=album&orderId=...` 或 `tab=accessLog&customerPhone=...` |
| 相册页 query 过滤 | 已完成 | 进入页面自动应用 `tab/storeId/orderId/customerPhone` |
| H5 空相册 UI | 已完成 | 详情页升级为交付状态卡，补“刷新状态/返回相册” |
| H5 主链路实测 | 已完成 | `13900001111 / PREVIEW-20260608` 登录、相册、详情通过 |
| 接手总控计划 | 已完成 | 明确桌面目录、工作区解压目录、正式源码目录和吸收边界 |
| 抖音小程序接手地图 | 已完成 | 明确 `抖音小程序` 目录只是 AppID/配置沉淀，正式代码在 `mobile-uniapp` |
| 前端优化路线图 | 已完成 | 将 `photoshop-master` 可吸收模块拆为 P0/P1/P2 |
| 小程序预览清单 | 已完成 | 明确微信/抖音导入目录、AppID、合法域名、测试账号和 P0 验收项 |

## 下一轮优化队列

| 优先级 | 任务 | 验收 |
| --- | --- | --- |
| P0 | 微信开发者工具导入 `dist/build/mp-weixin` 真机验证 | 手机号 + 取片码登录、空相册/有图相册、保存图片 |
| P0 | 抖音开发者工具导入 `dist/build/mp-toutiao` 真机验证 | 同微信，确认合法域名和保存图片 |
| P1 | 后台相册页补“在线选片链接/二维码/有效期”入口 | 后台能生成链接，客户能进入选择模式 |
| P1 | 订单详情抽屉展示相册数量、照片数量、最近访问失败 | 一屏判断客户为什么看不到照片 |
| P1 | 平台手机号授权 | 微信/抖音授权成功跳过取片码，失败保留取片码 |

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

## 风险

- 朋友项目依赖版本偏新，不能直接合并到 RuoYi 工程。
- Taro 与 uni-app 的平台 API 适配不同，不能复制运行时代码，只能迁移交互思路。
- 示例项目可能存在明文配置或 demo 账号，地图只记录结构，不记录密钥。
- 抖音生活服务和抖音小程序是两条线，不能把 SPI 放到小程序或平台云里。
