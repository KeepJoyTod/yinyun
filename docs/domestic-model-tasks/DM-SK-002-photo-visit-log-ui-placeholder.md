> owner: domestic-model-task-DM-SK-002-photo-visit-log-ui-placeholder
> canonical_for: 国产模型预留客片访问日志 UI 的单任务边界
> upstream: docs/studio-workbench-preimplementation-solutions-20260615.md, docs/studio-workbench-feature-code-map-20260615.md
> downstream: future yy_photo_access_log API

# DM-SK-002：客片访问日志 UI 预留

## 目标

为未来 `yy_photo_access_log` 或等价 API 预留 UI 和类型边界。当前没有正式访问日志表/API 时，只能显示真实空态和接入说明，不能伪造访问量。

## 允许修改

```text
studio-workbench/src/features/albums/PhotoMgmtView.vue
studio-workbench/src/features/albums/PhotoMgmtView.contract.test.ts
studio-workbench/src/features/albums/photoMgmtOperations.ts
studio-workbench/src/features/albums/photoMgmtOperations.test.ts
docs/studio-workbench-preimplementation-solutions-20260615.md
docs/studio-workbench-feature-code-map-20260615.md
```

## 禁止

- 不新增假访问记录。
- 不把相册浏览次数从前端随机数或本地数组推导出来。
- 不写数据库迁移。
- 不改客户鉴权逻辑。
- 不暴露客户完整手机号或访问 IP。

## 实施要点

1. 在客片详情区域增加“访问日志”或“客户访问”只读区块。
2. 当前没有 API 时展示明确空态：`访问日志接口未接入，接入 yy_photo_access_log 后展示`。
3. 纯函数里准备未来 DTO 转展示行的函数，输入空数组返回空态。
4. 测试锁定：无 API/空数组时不显示假次数和假时间。

## 验证

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- PhotoMgmtView
npm test -- photoMgmtOperations
npm test
npm run build
```

验收标准：

- 页面能看见未来接入位置。
- 当前没有接口时是诚实空态。
- 不出现假访问量、假下载量、假 IP。

## 交给国产模型时复制

```text
你只做 DM-SK-002：客片访问日志 UI 预留。
当前没有正式访问日志 API，必须展示真实空态，不能伪造访问量或下载量。

先读：
docs/domestic-model-implementation-pack-20260615.md
docs/studio-workbench-preimplementation-solutions-20260615.md
docs/domestic-model-tasks/DM-SK-002-photo-visit-log-ui-placeholder.md

完成后运行：
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- PhotoMgmtView
npm test -- photoMgmtOperations
npm test
npm run build

按“结果 / 改动 / 验证 / 风险”回报。
```
