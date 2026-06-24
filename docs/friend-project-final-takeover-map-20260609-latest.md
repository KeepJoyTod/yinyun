# 朋友项目最终接手地图与优化计划

更新时间：2026-06-09

## 结论

朋友项目已解压到工作区，但正式影约云只维护本仓库：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo
```

`D:\OtherProject\CameraApp\photoshop-master` 和 `D:\OtherProject\CameraApp\yuyue-main` 都是参考资产。吸收它们的页面结构、运营流程、选片体验，不迁移 Demo 后端、不替换正式 `admin-ui`、不替换正式 `mobile-uniapp`。

## 接手边界

| 项目 | 路径 | 定位 |
| --- | --- | --- |
| 正式后端 | `backend` | Spring Boot / RuoYi 主账本，订单、相册、OSS、抖音来客 |
| 正式后台 | `admin-ui` | Vue3 + Element Plus 运营后台 |
| 正式客户取片端 | `mobile-uniapp` | H5 / 微信小程序 / 抖音小程序统一端 |
| 朋友后台参考 | `D:\OtherProject\CameraApp\photoshop-master` | 摄影后台 UI 和工作台参考 |
| 朋友小程序参考 | `D:\OtherProject\CameraApp\yuyue-main` | Taro 登录、预约、订单、底片流程参考 |

## 高价值吸收点

| 来源 | 吸收点 | 正式落点 |
| --- | --- | --- |
| `photoshop-master\frontend\src\features\albums\PhotoMgmtView.vue` | 左相册右图库、上传底片、选片进度、底片排序/重命名 | `admin-ui\src\views\yy\photo\index.vue` |
| `photoshop-master\frontend\src\features\selection\OnlineSelectionView.vue` | 选片链接、二维码、有效期、访问统计、加片指标 | `photoPickupEntry.ts`、相册工作台 |
| `photoshop-master\frontend\src\features\schedule\ScheduleView.vue` | 日期/门店/日周切换、工位时段 | 后续预约库存看板 |
| `yuyue-main\client\src\pages\negatives\index.tsx` | 待选/待提交/已完成、选片序号、数量限制 | `mobile-uniapp\src\pages\pickup\detail\index.vue` |
| `yuyue-main\client\src\pages\orders\index.tsx` | 订单状态筛选、订单卡片、支付/取消入口 | 后续 `mobile-uniapp\src\pages\orders` |
| `yuyue-main\client\src\pages\auth\login\index.tsx` | 协议勾选、平台登录、手机号兜底 | `pickup\login` 二期 |
| `yuyue-main\server\src\main\java\com\amberfilm\file\FileController.java` | 上传签名/下载签名思路 | 正式私有 OSS 签名 URL 与 `/stream` |

## 当前正式能力

| 能力 | 状态 |
| --- | --- |
| 后台上传照片到 OSS | 已有闭环，上传后生成 `yy_photo_asset` |
| 客户手机号 + 取片码登录 | 已接入 |
| H5 取片 | 已可用，含相册列表、目录、预览、下载 |
| 微信小程序 | AppID 已填，构建目录明确，待真机验收 |
| 抖音小程序 | AppID 已填，构建目录明确，待真机验收 |
| 在线选片 | 已有选择/提交基础链路 |
| 私有 OSS | 继续保持私有，客户端不使用长期直链 |
| 抖音来客 | 统一走 `api.evanshine.me` 的 Spring Boot 后端 |

## P0 执行顺序

1. 跑 `mobile-uniapp` 测试和微信/抖音构建。
2. 把微信、抖音开发者工具导入对应 `dist\build` 目录。
3. 配置小程序合法域名：`https://api.evanshine.me`。
4. 用真实 OSS 图做验收：裸链接 403、签名 URL 可开、`/stream` 可用。
5. 后台上传 1-2 张真实图，确认客户 H5/小程序能看到。

## P1 执行顺序

1. 升级后台相册工作台 UI，吸收 `PhotoMgmtView.vue` 的信息架构。
2. 增强取片入口弹窗，吸收 `OnlineSelectionView.vue` 的二维码/分享/统计。
3. 增强客户选片页，吸收 Taro 底片页的状态 tab 和选片序号。
4. 接微信/抖音手机号授权，失败回退手机号 + 取片码。
5. 后台订单页展示取片摘要，便于门店运营排障。

## P2 执行顺序

1. 抖音订单/预约成功后自动创建相册占位。
2. 预约库存看板对接抖音来客库存查询。
3. 精修交付状态、批量下载、加片统计。
4. 平台云 BFF POC 只做登录/手机号授权代理，不保存主业务数据。

## 验证命令

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm test
npm run typecheck
npm run build:mp-weixin
npm run build:mp-toutiao
```

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run test:yy
npm run build:dev
```

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
.\tools\yingyue-platform-readiness.ps1 -SkipNetwork -SkipGithub
```
