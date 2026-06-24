# 朋友项目接手总控计划

日期：2026-06-09

## 结果

朋友交接项目已经按“参考资产”纳入影约云，但不改变正式生产基线。正式开发继续围绕：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo
```

朋友项目只吸收页面体验、业务字段、流程设计和 UI 质感，不迁移主账本、不替换 `admin-ui`、不把 Taro 作为正式小程序框架。

## 资产定位

| 资产 | 实际路径 | 定位 | 处理 |
| --- | --- | --- | --- |
| 正式主项目 | `D:\OtherProject\CameraApp\yingyue-cloud-repo` | Spring Boot / RuoYi / admin-ui / mobile-uniapp | 唯一生产基线 |
| 前端优化参考 | `D:\OtherProject\CameraApp\photoshop-master` | 影楼后台 Demo，Vue 3 + Vite + Tailwind + Spring Boot | 吸收相册、在线选片、档期、订单 UI |
| 桌面前端优化副本 | `C:\Users\Administrator\Desktop\yiyue\前端优化\photoshop-master` | 朋友交付原始目录副本 | 只读参考，地图沉淀 |
| 预约小程序参考 | `D:\OtherProject\CameraApp\yuyue-main` | Taro 小程序 + Vue admin + Spring Boot demo | 吸收预约、订单、底片、手机号授权流程 |
| 桌面微信小程序副本 | `C:\Users\Administrator\Desktop\yiyue\微信小程序\yuyue-main` | 朋友交付小程序副本 | 只读参考，地图沉淀 |
| 桌面抖音小程序目录 | `C:\Users\Administrator\Desktop\yiyue\抖音小程序` | 当前只有抖音 AppID 记录 | 作为抖音端配置/地图目录 |
| 正式小程序代码 | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp` | H5 / 微信小程序 / 抖音小程序统一源码 | 继续维护，一套代码多端构建 |

## 核心边界

- `api.evanshine.me` 是正式后端 API 域名。
- `mobile-uniapp` 是正式 H5、微信小程序、抖音小程序源码。
- `DOUYIN_LIFE` 是抖音来客生活服务线，负责 SPI、发码、退款、订单、预约、库存、核销。
- `DOUYIN_MINI_APP` 是客户取片入口，只调用 `/client/photo/*`。
- OSS 继续私有，客户端只拿短期签名 URL 或 `/stream`。
- 微信云、抖音云后续最多做 BFF，不承载主订单、主相册、客户主数据、OSS 权限。

## 地图文件总览

| 类型 | 主仓库 | 桌面同步位置 |
| --- | --- | --- |
| 接手总规划 | `docs/friend-project-handover-optimization-plan-20260609.md` | `C:\Users\Administrator\Desktop\yiyue\friend-project-handover-optimization-plan-20260609.md` |
| 接手总控计划 | `docs/friend-project-takeover-master-plan-20260609.md` | `C:\Users\Administrator\Desktop\yiyue\friend-project-takeover-master-plan-20260609.md` |
| 差距审计 | `docs/friend-project-gap-audit-20260609.md` | `C:\Users\Administrator\Desktop\yiyue\friend-project-gap-audit-20260609.md` |
| `photoshop-master` 代码地图 | `docs/friend-photoshop-master-code-map-20260609.md` | `C:\Users\Administrator\Desktop\yiyue\前端优化\friend-photoshop-master-code-map-20260609.md` |
| `yuyue-main` 代码地图 | `docs/friend-yuyue-main-code-map-20260609.md` | `C:\Users\Administrator\Desktop\yiyue\wechatapp\friend-yuyue-main-code-map-20260609.md`、`douyinapp\friend-yuyue-main-code-map-20260609.md` |
| 客户取片 UI 优化地图 | `docs/photo-pickup-ui-optimization-map.md` | 主仓库维护 |

## 前端优化吸收路线

| 阶段 | 目标 | 参考源 | 正式落点 | 验收 |
| --- | --- | --- | --- | --- |
| P0 | 保持客户取片闭环稳定 | 主项目已有 | `mobile-uniapp/src/pages/pickup/*` | H5 登录、相册、详情、预览、失败态通过 |
| P0 | 后台上传与排障强化 | `photoshop-master` 相册管理 | `admin-ui/src/views/yy/photo/index.vue` | 上传后可见底片、objectKey、访问审计 |
| P1 | 订单详情一屏排障 | `yuyue-main` 订单状态 | `admin-ui/src/views/yy/order/index.vue` | 从订单看到相册数、照片数、最近访问失败 |
| P1 | 在线选片链接/二维码/有效期 | `photoshop-master` online selection | `admin-ui/src/views/yy/photo` + 后端选片模型 | 后台生成链接，客户可进入选片模式 |
| P2 | 客户选片确认与加片 | `photoshop-master`、`yuyue-main` negatives | `mobile-uniapp` + 新选片记录 | 客户提交结果，后台可查看 |
| P2 | 预约档期运营面板 | `photoshop-master` schedule | 抖音预约库存页 | 日历/时段/容量/失败原因可视化 |

## 抖音小程序吸收路线

| 阶段 | 目标 | 说明 |
| --- | --- | --- |
| P0 | 使用正式 uni-app 抖音包 | 导入 `mobile-uniapp\dist\build\mp-toutiao`，AppID `tta3c8d5753dac3aae01` |
| P0 | 合法域名配置 | `request/download/upload` 均配置 `https://api.evanshine.me` |
| P0 | 取片码链路验收 | 手机号 + 取片码登录，能看相册、空状态、有图相册、预览、保存 |
| P1 | 抖音手机号授权 | `uni.login` + 抖音手机号授权，失败回退取片码 |
| P1 | 生活服务订单联动 | `DOUYIN_LIFE` 订单手机号、券码、预约单自动关联相册 |
| P2 | 抖音云 BFF POC | 只做 `/healthz`、`/cloud-ping`、代理核心 API，不放主账本 |

## 微信小程序吸收路线

| 阶段 | 目标 | 说明 |
| --- | --- | --- |
| P0 | 使用正式 uni-app 微信包 | 导入 `mobile-uniapp\dist\build\mp-weixin`，AppID `wx2a1a34748f56a6c6` |
| P0 | 合法域名配置 | `request/download/upload` 均配置 `https://api.evanshine.me` |
| P0 | 取片码链路验收 | 先不等手机号授权，保证 MVP 可用 |
| P1 | 微信手机号授权 | 授权成功直接换 `client_token`，失败回退取片码 |
| P1 | 保存图片真机兼容 | 验证 `downloadFile`、`saveImageToPhotosAlbum` 和权限引导 |
| P2 | 微信云 BFF POC | 只做登录/手机号授权适配，不放核心业务数据 |

## 当前执行状态

| 项 | 状态 | 说明 |
| --- | --- | --- |
| 主项目取片闭环 | 基本可用 | H5 登录、相册、详情、预览失败态、空相册 UI 已验证 |
| 后台相册上传 | 已接入 | 走 RuoYi OSS 上传后自动创建 `yy_photo_asset` |
| 后台访问审计 | 已接入 | 客片选片页有访问审计 Tab |
| 订单取片排障 | 已推进 | 订单页可跳相册/访问审计，详情抽屉已补排障摘要 |
| 微信小程序 | 待真机复核 | 构建目录已明确，需开发者工具导入 |
| 抖音小程序 | 待真机复核 | 构建目录和 AppID 已明确，需开发者工具导入 |
| 朋友项地图 | 已生成一版 | 后续每轮吸收后继续更新 |

## 下一轮最短执行队列

1. 跑 `admin-ui npm run test:yy` 和 `npm run build:dev`，确认后台排障改动稳定。
2. 跑 `mobile-uniapp npm test`、`npm run typecheck`、`npm run build:mp-weixin`、`npm run build:mp-toutiao`。
3. 微信开发者工具导入 `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-weixin`。
4. 抖音开发者工具导入 `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao`。
5. 后台给公网预览相册上传 1 张测试图，再验小程序预览和保存。
6. 从 `photoshop-master` 吸收“在线选片链接/二维码/有效期”到后台相册页。

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

## 风险和控制

| 风险 | 控制 |
| --- | --- |
| 把朋友 Taro 项目误当正式小程序 | 地图明确正式端为 `mobile-uniapp` |
| 把抖音生活服务 SPI 放到小程序端 | `DOUYIN_LIFE` 永远留在 Spring Boot |
| 把 OSS 改成公共读方便预览 | 禁止，继续私有 + 短期签名 |
| 朋友项目 demo 账号/密钥泄露 | 文档只记录结构，不记录秘密值 |
| 多套地图漂移 | 每轮代码优化后同步主仓库 docs 和桌面 `yiyue` |
