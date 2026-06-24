> owner: domestic-model-task-DM-RF-001-store-api-facade-split
> canonical_for: 国产模型执行小步 Store/API facade 拆分的任务边界
> upstream: docs/studio-workbench-optimization-map-20260615.md, studio-workbench/src/shared/stores/appStore.ts, studio-workbench/src/shared/api/backend.ts
> downstream: future shared store/api slices

# DM-RF-001：Store/API facade 小步拆分

## 目标

降低 `appStore.ts` 和 `backend.ts` 的复杂度，但保持外部导入兼容。国产模型只能一次拆一个只读 slice，不能做大范围重构。

## 允许修改

第一轮只允许选择其中一组：

```text
studio-workbench/src/shared/api/backend.ts
studio-workbench/src/shared/api/backend.contract.test.ts
studio-workbench/src/shared/api/<new-slice>.ts
```

或：

```text
studio-workbench/src/shared/stores/appStore.ts
studio-workbench/src/shared/stores/appStore.contract.test.ts
studio-workbench/src/shared/stores/<new-slice>.ts
```

文档可同步修改：

```text
docs/studio-workbench-optimization-map-20260615.md
docs/studio-workbench-feature-code-map-20260615.md
```

## 禁止

- 不改页面导入路径，除非任务单另行批准。
- 不改 API 请求语义。
- 不改返回 DTO 字段名。
- 不跨多个业务域一起拆。
- 不删除旧 facade。

## 推荐第一刀

优先拆“只读、无写库、测试已覆盖”的 helper，例如渠道验收、日志归一化或 dashboard 只读统计。拆分后 `backend.ts` 或 `appStore.ts` 继续 re-export 原方法。

## 实施步骤

1. 选一个只读 slice，列出将移动的函数名。
2. 新建 slice 文件，只移动函数和局部类型。
3. 原 facade 从新文件 import 后 re-export，保持调用方不变。
4. 运行原测试，确认页面不用改。
5. 更新优化地图记录已拆范围和下一刀建议。

## 验证

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- backend
npm test -- appStore
npm test
npm run build
```

验收标准：

- 外部 import 不变。
- 所有现有测试通过。
- diff 只覆盖一个业务 slice。

## 交给国产模型时复制

```text
你只做 DM-RF-001：Store/API facade 小步拆分。
一次只拆一个只读 slice，保持外部导入兼容，不改 API 语义，不跨域重构。

先读：
docs/domestic-model-implementation-pack-20260615.md
docs/studio-workbench-optimization-map-20260615.md
docs/domestic-model-tasks/DM-RF-001-store-api-facade-split.md

完成后运行：
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- backend
npm test -- appStore
npm test
npm run build

按“结果 / 改动 / 验证 / 风险”回报。
```
