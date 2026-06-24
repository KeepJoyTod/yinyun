# 门店工作台订单渠道排障证据

日期：2026-06-15

## 结果

已完成 T01 的一个收口切片：订单详情抽屉可按订单号/本地订单 ID 匹配渠道同步日志，显示 `requestId/logid`、接口、状态、错误信息、备注，并可复制订单渠道排障文本。

同时修复了通用复制组件在 Clipboard API 不可用时的假成功问题：现在会优先使用 `navigator.clipboard.writeText`，失败或不可用时退回隐藏 textarea + `document.execCommand('copy')`，所有路径失败才返回复制失败。

## 改动范围

| 文件 | 说明 |
| --- | --- |
| `studio-workbench/src/features/orders/orderOperations.ts` | 新增订单渠道日志匹配、截取和排障文本生成 helper |
| `studio-workbench/src/features/orders/orderOperations.test.ts` | 覆盖订单号、`yy_order id`、`localOrderId` 等匹配规则与排障文本 |
| `studio-workbench/src/features/orders/OrdersView.vue` | 订单详情抽屉新增渠道同步摘要和“复制排障”动作 |
| `studio-workbench/src/features/orders/OrdersView.contract.test.ts` | 契约测试固化抽屉中的排障字段 |
| `studio-workbench/src/shared/composables/useCopyWithState.ts` | 通用复制逻辑增加 fallback，避免不可用时误报成功 |
| `studio-workbench/src/shared/composables/useCopyWithState.test.ts` | 覆盖 Clipboard API 不可用和全部失败两种路径 |
| `studio-workbench/src/shared/stores/appStore.ts` | demo 渠道日志补订单上下文，便于本地工作台真实展示排障区块 |
| `studio-workbench/package.json`, `studio-workbench/package-lock.json` | 移除工作台对 `@vueuse/core` 的直接依赖；`radix-vue` 的传递依赖保留 |

## 验证

TDD 红灯：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- useCopyWithState.test.ts
```

结果：

```text
Test Files  1 failed (1)
Tests       2 failed (2)
原因：旧复制逻辑没有写入 fallback textarea，且 fallback 失败时仍返回成功
```

目标测试绿灯：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- useCopyWithState.test.ts orderOperations.test.ts OrdersView.contract.test.ts appStore.contract.test.ts
```

结果：

```text
Test Files  6 passed (6)
Tests       49 passed (49)
```

全量测试：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test
```

结果：

```text
Test Files  66 passed (66)
Tests       349 passed (349)
```

生产构建：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm run build
```

结果：

```text
vue-tsc -b && vite build
2828 modules transformed
built in 3.62s
```

说明：移除 `@vueuse/core` 直接依赖后，本次构建未再出现此前 `@vueuse/core` 的 Rolldown pure annotation warning。

浏览器 smoke：

```text
URL: http://localhost:5190/order/appointment?q=YY202606100001&quick=all
订单: YY202606100001 / 本地订单 ID 9001
验收:
- 登录页为右侧 staff-login-side-panel，demo 账号 store-admin / demo123456 可进入订单页
- 订单详情抽屉显示“渠道同步”
- “复制排障”按钮唯一
- 抽屉显示 requestId/logid、错误信息、备注
- 点击复制后按钮显示“已复制排障”
- 浏览器剪贴板包含 [订单渠道排障]、订单号、本地订单 ID、DOUYIN_LIFE logid 和备注
```

## 边界

- 本次没有新增第二订单账本，仍以 `yy_order` 为唯一订单/预约主账本。
- 本次没有混用 `DOUYIN_LIFE` 和 `DOUYIN_MINI_APP`。
- 本次没有伪造真实支付、核销、优惠券、评价或收入；demo 日志仅用于本地演示排障 UI。
