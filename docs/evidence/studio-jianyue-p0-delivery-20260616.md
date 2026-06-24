# 门店工作台 P0 收尾证据

GeneratedAt: 2026-06-16 21:20 +08:00

## 结果

当前项目已收口到可用状态：

- 首页经营概况、今日预约、预约订单、门店管理、排期页都已落到真实本地账本和真实路由。
- 同步订单后会刷新首页、排期和全量订单视图。
- 首页快捷入口已改为真实入口，不再是空占位。
- 门店页主要死按钮已接到真实工作台路由。
- 订单、首页、排期页的空态/错误态文案已统一进契约测试。

## 验证

### 目标测试集

命令：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- --run src/shared/stores/appStore.contract.test.ts src/features/orders/orderOperations.test.ts src/features/orders/OrdersView.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts src/features/stores/StoreView.contract.test.ts src/features/stores/storeDouyinBindings.test.ts src/shared/api/backend.contract.test.ts
```

结果：

- 8 files passed
- 109 tests passed

### 定向收尾契约

命令：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- --run src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts src/features/orders/OrdersView.contract.test.ts
```

结果：

- 3 files passed
- 52 tests passed

### 生产构建

命令：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm run build
```

结果：

- `vue-tsc -b && vite build` 通过
- 仅有 Vite chunk size warning

### 浏览器冒烟

本地路由可达：

- `http://127.0.0.1:5190/dashboard/today`
- `http://127.0.0.1:5190/order/appointment?quick=all`
- `http://127.0.0.1:5190/merchant/store`
- `http://127.0.0.1:5190/schedule`

可见真实节点：

- 首页存在“经营概况”“今日预约”“处理订单”“预约入口”“调整容量”等真实按钮/卡片。
- 今日预约页存在“今日预约”“待确认时段”“已占用工位”“可接待工位”等真实排期块。

## 当前状态

- 代码已不是骨架，核心交互已接到真实数据和真实路由。
- 仍建议后续再做一次服务器部署核验和线上回归。
