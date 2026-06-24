# yuyue-main 预约小程序参考地图

日期：2026-06-09

## 结论

`yuyue-main` 是朋友交接的预约/订单/底片参考项目。它的价值在于小程序客户流程和运营后台信息架构，不作为影约云正式代码基线。

| 项 | 值 |
| --- | --- |
| 项目路径 | `D:\OtherProject\CameraApp\yuyue-main` |
| 桌面副本 | `C:\Users\Administrator\Desktop\yiyue\微信小程序\yuyue-main` |
| 小程序端 | `client`，Taro + React + TypeScript + Zustand |
| 运营后台 | `admin`，Vue 3 + Vite |
| Demo 后端 | `server`，Spring Boot |
| 默认前端端口 | `10086` |
| 默认后端端口 | `8080` |

## 小程序端代码地图

| 功能 | 代码位置 | 可吸收点 |
| --- | --- | --- |
| 路由与 TabBar | `client/src/app.config.ts` | 首页、预约、底片、订单、我的五栏结构 |
| 请求封装 | `client/src/api/request.ts` | token 注入、错误 Toast、401 清 token |
| 手机号登录 | `client/src/api/auth.ts`、`client/src/pages/auth/*` | 手机号验证码、redirect 回跳 |
| 首页 | `client/src/pages/index/index.tsx` | 搜索、Banner、服务入口、作品展示 |
| 服务/门店 | `client/src/pages/services/index.tsx` | 套系列表、门店筛选、附近排序 |
| 预约确认 | `client/src/pages/booking/confirm/index.tsx` | 登录拦截、联系人手机号、提交状态 |
| 订单列表 | `client/src/pages/orders/index.tsx` | 状态筛选、订单卡片、支付/取消/查看 |
| 订单详情 | `client/src/pages/orders/detail/index.tsx` | 预约信息、核销码、订单状态 |
| 底片列表/选片 | `client/src/pages/negatives/index.tsx` | 待选片/待提交/已完成、图片选择顺序 |
| 状态管理 | `client/src/store/useAuthStore.ts`、`useBookingStore.ts` | 登录态和预约态拆分 |

## 后端参考地图

| 模块 | 代码位置 | 对应主项目方向 |
| --- | --- | --- |
| 认证 | `server/src/main/java/com/amberfilm/auth/*` | 微信/抖音手机号授权参考 |
| 套系目录 | `server/src/main/java/com/amberfilm/catalog/*` | 影约云商品/服务配置 |
| 门店档期 | `server/src/main/java/com/amberfilm/store/*` | 抖音预约库存、门店库存 |
| 预约 | `server/src/main/java/com/amberfilm/booking/*` | 订单支付后预约占位 |
| 订单 | `server/src/main/java/com/amberfilm/order/*` | 客户订单与相册关联 |
| 底片 | `server/src/main/java/com/amberfilm/negative/*` | `yy_photo_asset` 在线选片 |
| 文件 | `server/src/main/java/com/amberfilm/file/*` | OSS 签名与下载 URL 思路 |
| 会员资产 | `server/src/main/java/com/amberfilm/member/*` | 客户资产/底片归属模型参考 |

## 管理端参考地图

| 功能 | 代码位置 | 可吸收点 |
| --- | --- | --- |
| 路由 | `admin/src/router.ts` | 主控台、订单、日程、门店、服务、底片、设置 |
| API | `admin/src/api/admin.ts` | 运营接口聚合 |
| 主控台 | `admin/src/pages/DashboardView.vue` | 关键指标卡片 |
| 预约订单 | `admin/src/pages/OrdersView.vue` | 订单状态/操作入口 |
| 运营页 | `admin/src/pages/OperationsView.vue` | 通用资源管理页 |
| 日程板 | `admin/src/components/ScheduleBoard.vue` | 时段可视化 |

## 对影约云的吸收计划

### P0

- 不迁移 Taro，继续用 `mobile-uniapp`。
- 把 `redirect` 登录回跳体验对齐到 H5/小程序取片页。
- 把底片页的“已选序号、最多可选、提交前状态”作为影约云在线选片二期设计参考。
- 微信/抖音开发者工具只导入 `mobile-uniapp/dist/build/*`，不要导入 `yuyue-main/client` 作为正式项目。

### P1

- 参考 `auth` 页面接微信/抖音手机号授权。
- 参考订单卡片，把影约云后台订单页和小程序订单入口做成更清晰的状态流。
- 参考预约确认页，把抖音生活服务预约与相册占位关联起来。
- 参考 `client/src/api/request.ts` 的 token 处理和错误 toast，但实现必须保留 uni-app 请求封装。

### P2

- 参考门店/套系选择，做影约云自有小程序预约入口。
- 参考底片状态，增加客户选片确认、加片确认、精修完成通知。

## 不迁移清单

- 不把 `client` 的 Taro 运行时代码复制到 `mobile-uniapp`。
- 不迁移 `server` 的 demo 后端和数据库。
- 不使用朋友项目的账号体系替代 RuoYi 权限。
- 不把 demo 图片 URL 或长期直链进入正式客户取片。
- 不复用 `project.config.json`、`project.tt.json` 里的旧项目配置作为正式配置。
- 不把微信/Taro 特有 API 直接搬进抖音 uni-app，需要按 `uni.*` 和平台能力重写。

## 深度扫描补充

| 项 | 结论 |
| --- | --- |
| 两份副本 | 桌面副本和工作区副本结构一致，可作为同一参考项目 |
| 小程序核心页面 | 首页、服务、预约确认、订单、底片、我的、登录认证 |
| 后端模块 | 认证、门店、目录、预约、订单、支付、底片、文件、会员资产 |
| 最适合吸收 | TabBar 信息架构、手机号登录节奏、订单卡片、底片选片状态 |
| 正式小程序落点 | `D:\OtherProject\CameraApp\yingyue-cloud-repo\mobile-uniapp` |

## 验证建议

```powershell
cd D:\OtherProject\CameraApp\yuyue-main\client
npm run build:h5
npm run build:weapp
npm run build:tt
```

```powershell
cd D:\OtherProject\CameraApp\yuyue-main\server
mvn test
```

这些命令只用于评估参考项目健康度，不作为影约云正式发布验收。
