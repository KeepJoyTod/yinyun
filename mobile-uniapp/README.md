# 影约云取片 mobile-uniapp

定位说明：

- `mobile-uniapp` 是客户取片多端源码，一套代码编译 H5、微信小程序、抖音小程序。
- `http://127.0.0.1:5174` 是 H5 调试入口，不是单独维护的网页用户前端。
- 管理后台网页前端在 `admin-ui`，本地地址是 `http://127.0.0.1:5180/`。
- 前端入口分层见：`docs/frontend-entry-map-20260610.md`。

首期范围：
- H5
- 微信小程序
- 抖音小程序

统一登录方式：
- 手机号 + 取片码
- 短信验证码已预留，但当前只是记录申请
- 图片只使用短期签名 URL
- 小程序保存图片优先走后端 `/client/photo/assets/{assetId}/stream`

## 当前状态

| 项 | 状态 |
| --- | --- |
| H5 | 已跑通手机号 + 取片码登录、相册列表、真实相册详情/预览（本地代理模式） |
| 微信小程序 | `wx2a1a34748f56a6c6` 已写入 manifest，可构建和导入开发者工具 |
| 抖音小程序 | `tta3c8d5753dac3aae01` 已写入 manifest，可构建和导入开发者工具 |
| UI | 登录、相册、目录、预览、结果页已统一为客户取片风格 |
| 结果页 | 已改成状态页样式，不再是单一占位提示 |
| 预览页 | 已支持上一张/下一张、序号提示，能按相册内资产连续选片 |
| 相册缓存 | 详情页和预览页复用短期相册详情与签名 URL 缓存，减少重复请求 |
| H5 图标 | 已补 `favicon.svg`，不再依赖默认缺失图标请求 |
| 图片预览 | 真实样例图片链路已验证；真实上传测试图后继续补最终验收 |

已知 warning：

- 仅剩 `vue-router` deprecation warning，来源于 `@dcloudio/uni-h5` 依赖链，不影响当前页面功能

开发预填账号：

`npm run dev:h5` 本地代理模式默认填本地真实图账号：

```text
手机号：13800003333
取片码：PICK-202606-001
```

`npm run dev:h5:api` 公网 API 模式默认填预览账号：

```text
手机号：13900001111
取片码：PREVIEW-20260608
```

## 启动

```bash
npm install
npm run dev:h5
npm run dev:h5:api
npm run dev:mp-weixin
npm run dev:mp-toutiao
```

模式说明：

| 命令 | 说明 |
| --- | --- |
| `npm run dev:h5` | 本地代理模式，H5 访问相对路径并由 Vite 代理到 `127.0.0.1:8080` |
| `npm run dev:h5:api` | 直连公网 API 模式，`VITE_API_BASE_URL=https://api.evanshine.me` |

本地只看页面并直连正式后端时，用：

```bash
npm run dev:h5:api
```

打开：

```text
http://127.0.0.1:5174/#/pages/pickup/login/index
```

## 构建

```bash
npm run build:h5
npm run build:mp-weixin
npm run build:mp-toutiao
```

## 测试

```bash
npm test
npm run test:h5
```

仓库根目录也提供完整本地验收脚本：

```powershell
.\tools\photo-pickup-local-acceptance.ps1
```

`npm run test:h5` 默认要求本地 H5 已启动在 `127.0.0.1:5174`，本地后端已启动在 `127.0.0.1:8080`。默认账号为：

```text
手机号：13800003333
取片码：PICK-202606-001
```

如果当前 H5 是 `npm run dev:h5:api` 启动，脚本会自动读取登录页预填的公网预览账号：

```text
手机号：13900001111
取片码：PREVIEW-20260608
```

该公网预览相册当前允许为空，脚本会验证登录、相册列表、详情空状态，不会误判为空相册失败。

需要覆盖时可传环境变量：

```powershell
$env:H5_URL='http://127.0.0.1:5174/#/pages/pickup/login/index'
$env:PICKUP_PHONE='13800003333'
$env:PICKUP_CODE='PICK-202606-001'
npm run test:h5
```

开发者工具导入目录：

```text
微信开发预览：D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\dev\mp-weixin
抖音开发预览：D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\dev\mp-toutiao
微信构建产物：D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-weixin
抖音构建产物：D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao
```

## 配置

设置环境变量：

```bash
VITE_API_BASE_URL=http://127.0.0.1:8080
```

已内置 `api` mode：

```bash
VITE_API_BASE_URL=https://api.evanshine.me
```

微信小程序正式环境需要：
- 后端 HTTPS 域名
- 图片签名域名或后端图片流式代理域名
- `request/download/upload` 合法域名配置 `https://api.evanshine.me`

本地验收分两种模式：
- `npm run dev:h5`：本地代理模式，验证真实账号和本地后端样例图
- `npm run dev:h5:api`：直连公网 API 模式，验证权限边界和线上域名链路

## 说明

- 客户端不保存 OSS 长期直链
- 客户端不暴露后台管理地址
- 微信/抖音手机号授权后续只补平台适配层，不改当前手机号 + 取片码主链路

## 交接项目边界

桌面目录里存在朋友交接的小程序项目：

```text
C:\Users\Administrator\Desktop\yiyue\微信小程序\yuyue-main
```

该项目是 Taro React 技术栈，可作为预约、订单、手机号授权、底片页面的参考，但不作为影约云正式小程序源码。正式微信/抖音小程序仍以本目录 `mobile-uniapp` 为准。

相关交接地图：

```text
C:\Users\Administrator\Desktop\yiyue\wechatapp\friend-yuyue-main-audit.md
C:\Users\Administrator\Desktop\yiyue\douyinapp\friend-yuyue-main-audit.md
```
