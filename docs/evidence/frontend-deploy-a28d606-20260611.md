# 前端统一交付包验证记录

日期：2026-06-11

## 结论

统一前端交付包已在本地构建并通过结构校验，可用于前端交付/预览。

| 项 | 值 |
| --- | --- |
| 本地提交 | `a28d60688c58a674d66df674f92112dac09ff87e` |
| 本地 tree | `eca8de1cf76e94418fded01584a0ea23d173a9a7` |
| 远端镜像提交 | `131e27498a4dfbed2b3936f98184d4d98aac02df` |
| 远端 tree | `eca8de1cf76e94418fded01584a0ea23d173a9a7` |
| 交付目录 | `dist\yingyue-frontend-deploy` |
| 交付压缩包 | `dist\yingyue-frontend-deploy-a28d606.zip` |
| zip 大小 | `3,356,173 bytes` |

## 覆盖产物

| 目录 | 用途 |
| --- | --- |
| `web/admin-ui` | RuoYi 系统管理后台 |
| `web/client-web` | 客户电脑网页端 |
| `web/studio-workbench` | 门店工作台 PC 端 |
| `web/mobile-uniapp-h5` | 客户取片 H5 兜底/调试入口 |
| `miniapps/mp-weixin` | 微信小程序导入目录 |
| `miniapps/mp-toutiao` | 抖音小程序导入目录 |

## 执行命令

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
pwsh -NoProfile -ExecutionPolicy Bypass -File tools\yingyue-build-frontend-package.ps1 -Build -Clean -Zip
pwsh -NoProfile -ExecutionPolicy Bypass -File tools\verify-yingyue-frontend-package.ps1 -PackageDir dist\yingyue-frontend-deploy
```

## 验证结果

- `client-web npm run build`：通过。
- `studio-workbench npm run build`：通过。
- `admin-ui pnpm run build:prod`：通过。
- `mobile-uniapp npm run typecheck`：通过。
- `mobile-uniapp npm test`：通过，`103` 个用例通过。
- `mobile-uniapp npm run build:h5`：通过。
- `mobile-uniapp npm run build:mp-weixin`：通过。
- `mobile-uniapp npm run build:mp-toutiao`：通过。
- `tools\verify-yingyue-frontend-package.ps1`：`PASS`。

## 注意

- `studio-workbench` 构建仍有 Dashboard chunk 超过 500KB 的 Vite 提示，属于体积提醒，不阻塞构建。
- `mobile-uniapp` 构建提示 uni-app 有新版本，属于工具版本提醒，不阻塞 H5/微信/抖音产物生成。
- 交付包校验包含关键目录、关键文件和 secret-like 文件名 denylist 检查。
