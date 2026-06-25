# 前端优化参考项目接手地图

更新时间：2026-06-09

## 结论

`photoshop-master` 是摄影工作室后台参考项目，不是正式源码。正式吸收策略是：保留影约云 RuoYi 后台基底，只吸收相册管理、在线选片、日程、订单看板的信息架构和交互。

| 项 | 值 |
| --- | --- |
| 参考项目 | `D:\OtherProject\CameraApp\photoshop-master` |
| 桌面副本 | `docs\yiyue\前端优化\photoshop-master` |
| 正式后台 | `D:\OtherProject\CameraApp\yingyue-cloud-repo\admin-ui` |
| 正式小程序 | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp` |

## 代码地图

| 功能 | 参考文件 | 正式落点 |
| --- | --- | --- |
| 路由和页面分组 | `frontend/src/app/router/index.ts` | `admin-ui/src/router`、`admin-ui/src/views/yy/*` |
| 全局布局 | `frontend/src/shared/components/layout/*` | RuoYi 布局内局部页面优化 |
| 主控台 | `frontend/src/features/dashboard/DashboardView.vue` | 后台首页 / 渠道联调统计卡 |
| 预约订单 | `frontend/src/features/orders/OrdersView.vue` | `admin-ui/src/views/yy/order/index.vue` |
| 日程管理 | `frontend/src/features/schedule/ScheduleView.vue` | 抖音预约库存运营页 |
| 客片管理 | `frontend/src/features/albums/PhotoMgmtView.vue` | `admin-ui/src/views/yy/photo/index.vue` |
| 在线选片 | `frontend/src/features/selection/OnlineSelectionView.vue` | 后台相册取片入口 / 在线选片结果 |
| 选片规则 | `frontend/src/features/products/components/SelectionConfigModal.vue` | 相册规则 / 套系规则 |
| Demo 选片后端 | `backend/src/main/java/com/amberstudio/selection/*` | `YyClientPhotoServiceImpl`、`yy_photo_asset.is_selected` |

## 吸收优先级

| 优先级 | 吸收点 | 原因 |
| --- | --- | --- |
| P0 | 在线选片确认闭环 | 已接入首版，后台可把 `SUBMITTED` 确认到 `COMPLETED` |
| P0 | 相册运营排障 | 线上最容易出问题的是手机号、取片码、OSS、过期、权限 |
| P1 | 二维码和分享话术 | 方便门店运营发给客户 |
| P1 | 选片规则 | 支持最多可选、精修张数、有效期 |
| P2 | 日程库存看板 | 抖音预约库存运营化 |

## 不吸收

- 不引入 Tailwind/Radix 作为正式后台技术栈。
- 不迁移 Demo 后端和 MinIO。
- 不迁移 Demo 账号、JWT、权限。
- 不复制 Demo 图片直链。
