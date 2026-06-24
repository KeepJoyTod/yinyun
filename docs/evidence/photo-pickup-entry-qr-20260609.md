# 客户取片入口二维码验证记录

日期：2026-06-09

## 结果

后台相册“客户取片入口”已从“复制入口 + 二维码下一步接入”升级为“真实 H5 二维码 + 小程序兜底引导”。

## 改动

| 文件 | 说明 |
| --- | --- |
| `admin-ui/src/views/yy/utils/photoPickupEntry.ts` | 新增二维码状态判断和真实 PNG 二维码 data URL 生成 |
| `admin-ui/src/views/yy/utils/photoPickupEntry.test.ts` | 增加二维码状态、安全 URL 过滤、真实 data URL 测试 |
| `admin-ui/src/views/yy/photo/index.vue` | 取片入口弹窗展示二维码卡；未配置 H5 时显示微信/抖音小程序引导 |
| `admin-ui/package.json` | 增加 `qrcode`、`@types/qrcode` |
| `admin-ui/pnpm-lock.yaml` | 锁定二维码依赖 |

## 行为

- 配置 `VITE_APP_PHOTO_PICKUP_H5_URL` 后，后台生成可扫码的 H5 取片二维码。
- 未配置 H5 入口时，不生成假二维码，显示“小程序取片”引导。
- 二维码目标只允许安全的 `https://` 客户入口。
- `/dev-api`、阿里云 OSS 直链、相对后台接口地址不会作为二维码目标。
- 客户分享话术仍不暴露后台地址和 OSS 地址。

## 验证

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run test:yy
```

结果：

```text
Test Files 5 passed
Slice result: 23 tests passed. Current consolidated baseline: `admin-ui npm run test:yy` -> 37 passed.
```

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui
npm run build:dev
```

结果：

```text
vite v7.3.2 building client environment for development...
3260 modules transformed.
built in 53.95s
```

## 依赖安装记录

`npm install qrcode @types/qrcode` 在当前 Node 24 / npm 11 / pnpm 风格 `node_modules` 下触发 npm arborist 错误：

```text
Cannot read properties of null (reading 'matches')
```

随后使用项目实际包管理器 pnpm，并指定官方 npm registry 安装成功：

```powershell
pnpm add qrcode --registry=https://registry.npmjs.org/
pnpm add -D @types/qrcode --registry=https://registry.npmjs.org/
```

## 后续

- 正式 H5 域名上线后，把 `VITE_APP_PHOTO_PICKUP_H5_URL` 配成真实客户入口。
- 弹窗已支持下载二维码 PNG；正式 H5 域名上线后，运营可下载二维码发给客户或现场扫码验证。
