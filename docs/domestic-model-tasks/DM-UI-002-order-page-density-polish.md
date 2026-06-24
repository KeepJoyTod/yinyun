> owner: domestic-model-task-DM-UI-002-order-page-density-polish
> canonical_for: 国产模型精修订单页视觉密度、状态和失败反馈的单任务边界
> upstream: docs/studio-workbench-feature-code-map-20260615.md, docs/studio-workbench-optimization-map-20260615.md
> downstream: studio-workbench/src/features/orders/OrdersView.vue

# DM-UI-002：订单页密度和状态精修

## 目标

优化 `/order/appointment` 的筛选区、表格/列表、详情抽屉和失败态，让店员更快识别今日待处理、渠道同步状态、改期冲突和导出边界。

## 允许修改

```text
studio-workbench/src/features/orders/OrdersView.vue
studio-workbench/src/features/orders/OrdersView.contract.test.ts
studio-workbench/src/features/orders/orderOperations.ts
studio-workbench/src/features/orders/orderOperations.test.ts
docs/studio-workbench-feature-code-map-20260615.md
```

## 禁止

- 不改订单状态机语义。
- 不改 `/yy/order/*` 接口路径。
- 不扩大导出筛选范围。
- 不把无法等价表达的前端筛选强行传给后端。
- 不创建客户预约入口。

## 实施要点

1. 先读 `OrdersView.vue` 和 `orderOperations.ts`，确认哪些是纯展示规则。
2. 筛选区做密度优化：按钮、输入框、状态标签高度一致。
3. 详情抽屉突出：最近同步状态、失败原因、logid/requestId、改期库存提示。
4. 失败态文案要能指导店员复制排障包或重试。
5. 只把可测试的文案生成、状态标签、按钮禁用规则放进 `orderOperations.ts`。

## 验证

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- OrdersView
npm test -- orderOperations
npm test
npm run build
```

验收标准：

- 今日订单、渠道订单、导出提示、改期冲突都能被看懂。
- API 模式失败不 fallback demo。
- 未接后端能力保持真实失败或明确提示。

## 交给国产模型时复制

```text
你只做 DM-UI-002：订单页密度和状态精修。
不改订单状态机、不改接口、不新增预约入口、不碰部署。

先读：
docs/domestic-model-implementation-pack-20260615.md
docs/studio-workbench-feature-code-map-20260615.md
docs/domestic-model-tasks/DM-UI-002-order-page-density-polish.md

完成后运行：
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- OrdersView
npm test -- orderOperations
npm test
npm run build

按“结果 / 改动 / 验证 / 风险”回报。
```
