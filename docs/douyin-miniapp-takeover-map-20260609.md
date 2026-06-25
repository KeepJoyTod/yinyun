# 抖音小程序接手地图

日期：2026-06-09

## 结果

桌面目录 `docs\yiyue\抖音小程序` 当前只保存抖音小程序 AppID，不是正式源码目录。正式抖音小程序源码在：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
```

构建产物导入抖音开发者工具：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao
```

## 基本配置

| 项 | 值 |
| --- | --- |
| 抖音小程序 AppID | `tta3c8d5753dac3aae01` |
| 正式 API 域名 | `https://api.evanshine.me` |
| 合法域名 | request / uploadFile / downloadFile 均配置 `https://api.evanshine.me` |
| MVP 登录 | 手机号 + 取片码 |
| 后续登录 | 抖音手机号授权，失败回退取片码 |
| 图片访问 | 优先 `/client/photo/assets/{assetId}/stream`，必要时短期签名 URL |

## 代码地图

| 功能 | 正式代码位置 | 说明 |
| --- | --- | --- |
| 小程序清单 | `mobile-uniapp/src/manifest.json` | AppID、平台配置 |
| 页面路由 | `mobile-uniapp/src/pages.json` | 取片登录、相册、详情、预览、结果页 |
| 登录页 | `mobile-uniapp/src/pages/pickup/login/index.vue` | 手机号 + 取片码 |
| 相册列表 | `mobile-uniapp/src/pages/pickup/albums/index.vue` | 当前手机号可访问相册 |
| 相册详情 | `mobile-uniapp/src/pages/pickup/detail/index.vue` | 照片目录、空相册、加载失败 |
| 图片预览 | `mobile-uniapp/src/pages/pickup/preview/index.vue` | 大图预览、下载/保存、失败态 |
| 客户 API | `mobile-uniapp/src/api/clientPhoto.ts` | `/client/photo/*` 请求封装 |
| 请求封装 | `mobile-uniapp/src/api/request.ts` | token、错误、API base |
| 平台适配 | `mobile-uniapp/src/platform/douyin.ts` | 抖音登录/手机号授权后续入口 |
| 类型 | `mobile-uniapp/src/types/clientPhoto.ts` | 相册、底片、签名 URL、token |

## 功能地图

| 用户说法 | 功能 | 当前状态 |
| --- | --- | --- |
| 输入手机号和取片码 | 客户登录 | 已实现 |
| 看我的相册 | 相册列表 | 已实现 |
| 打开照片目录 | 相册详情 | 已实现 |
| 看大图 | 图片预览 | 已实现 |
| 保存图片 | 小程序保存/下载 | 待真机验证 |
| 抖音手机号一键登录 | 平台手机号授权 | P1 |
| 从抖音订单自动看到相册 | 生活服务订单联动 | P1 |
| 分享相册 | 小程序分享入口 | P2 |

## 不要混淆

| 名称 | 含义 |
| --- | --- |
| `DOUYIN_MINI_APP` | 抖音小程序客户取片入口 |
| `DOUYIN_LIFE` | 抖音来客生活服务，负责 SPI、发码、退款、预约、库存、核销 |
| `api.evanshine.me` | 核心后端 API 域名，不是小程序域名 |
| `yingyueyun.evanshine.me` | 历史兼容入口，不作为新配置首选 |

## 优化计划

| 优先级 | 任务 | 验收 |
| --- | --- | --- |
| P0 | 构建 `mp-toutiao` 并导入开发者工具 | 能打开登录页 |
| P0 | 配置合法域名 | 请求、下载、上传不被平台拦截 |
| P0 | 取片码链路真机验证 | 登录、相册、详情、预览、保存图片 |
| P1 | 接抖音手机号授权 | 授权成功免输入手机号，失败走取片码 |
| P1 | 抖音生活服务订单关联相册 | 支付/预约完成后自动创建或绑定相册 |
| P2 | 抖音云 BFF POC | 只做平台登录代理，不放主账本 |

## 验证命令

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm run typecheck
npm run build:mp-toutiao
```

导入目录：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao
```
