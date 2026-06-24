# 抖音小程序正式地图

更新时间：2026-06-11

## 结论

正式抖音小程序是 `mobile-uniapp` 的 `mp-toutiao` 构建产物，不是桌面 `抖音小程序` 目录，也不是朋友 `yuyue-main` 的 Taro 项目。

```text
源码: D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
构建产物: D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp\dist\build\mp-toutiao
AppID: tta3c8d5753dac3aae01
API: https://api.evanshine.me
```

## 代码地图

| 功能 | 文件 |
| --- | --- |
| AppID 和平台配置 | `mobile-uniapp/src/manifest.json` |
| 页面路由 | `mobile-uniapp/src/pages.json` |
| API base 和 token | `mobile-uniapp/src/api/request.ts` |
| 客户取片接口 | `mobile-uniapp/src/api/clientPhoto.ts` |
| 抖音适配器 | `mobile-uniapp/src/platform/douyin.ts` |
| 登录 | `mobile-uniapp/src/pages/pickup/login/index.vue` |
| 相册列表 | `mobile-uniapp/src/pages/pickup/albums/index.vue` |
| 照片目录/选片 | `mobile-uniapp/src/pages/pickup/detail/index.vue` |
| 图片预览/保存 | `mobile-uniapp/src/pages/pickup/preview/index.vue` |

## 当前取片 UI 状态

| 页面 | 当前状态 |
| --- | --- |
| 登录 | 手机号 + 取片码主链路已可用，平台手机号授权为后续增强 |
| 相册列表 | 已有封面、状态、照片数、有效期、空状态和失败恢复 |
| 照片目录/选片 | 已有照片网格、选择状态、提交选片、状态感知“下一步”面板；2026-06-11 新增选片说明，明确“选择顺序就是精修顺序” |
| 图片预览/保存 | 已有暗色预览、上一张/下一张、原比例查看、下载/保存失败反馈；2026-06-11 新增照片位置进度条和保存安全说明 |
| 安全边界 | 页面不展示后台地址、服务器端口、长期 OSS 直链；保存原图走身份校验和 `/stream` |

## 功能边界

| 线 | 负责 | 不负责 |
| --- | --- | --- |
| 抖音小程序 | 客户取片、选片、预览、保存、后续手机号授权 | 发券、退款、库存、核销、SPI |
| `DOUYIN_LIFE` 后端 | 发券、退款、订单、预约、库存、核销、logid | 小程序页面 |
| `api.evanshine.me` | 统一业务 API | 不是小程序域名本身 |

## 验收命令

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp
npm test
npm run typecheck
npm run build:h5
npm run build:mp-toutiao
```

抖音后台合法域名：

```text
request: https://api.evanshine.me
downloadFile: https://api.evanshine.me
uploadFile: https://api.evanshine.me
```
