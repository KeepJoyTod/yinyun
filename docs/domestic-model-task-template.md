> owner: domestic-model-task-template
> canonical_for: 交给国产模型/小模型执行单个门店工作台小功能时的可复制任务模板
> upstream: docs/domestic-model-handoff-small-features.md
> downstream: future small feature tasks

# 小功能任务模板

更新时间：2026-06-14

复制本模板给执行模型，只替换尖括号内容。

## 任务目标

在 `D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench` 中完成：

```text
<一句话说明要做的小功能>
```

用户入口：

```text
<路由，例如 /settings/logs>
```

成功标准：

```text
<用户能看到什么、点击什么、得到什么结果>
```

## 必读文件

先读这些文件，不要跳过：

```text
D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\studio-workbench-architecture-framework.md
D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\studio-workbench-api-route-map.md
D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\studio-workbench-route-implementation-status.md
D:\OtherProject\CameraApp\yingyue-cloud-repo\docs\domestic-model-handoff-small-features.md
<本任务相关页面文件>
<本任务相关 helper/store/API/test 文件>
```

## 禁止事项

- 不改生产配置、域名、密钥、token。
- 不新增第二套业务账本。
- 不把 OSS 改成公共读。
- 不把业务 ID 转成 `number`。
- 不在员工工作台创建客户预约。
- 不让 API 模式失败后静默回退 demo。
- 不做无关 UI 大改或无关重构。

## 相关文件

预期主要修改：

```text
<文件 1>
<文件 2>
<测试文件>
```

只读参考：

```text
<参考文件 1>
<参考文件 2>
```

## 实施步骤

1. 确认路由、页面、store、backendApi 的调用链。
2. 补或修改纯规则 helper。
3. 补类型和测试。
4. 让页面调用 helper，并补加载、空态、失败态。
5. 跑验证命令。
6. 汇报改动和残余风险。

## 验收标准

- 页面不白屏，不出现 404。
- 新状态和错误提示对店员可理解。
- 无权限、空数据、接口失败都有明确展示。
- 雪花 ID 仍为字符串。
- 不影响旧路由兼容。
- 测试和构建通过。

## 验证命令

必须执行：

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test
npm run build
```

如果只改了某个 helper，优先额外执行相关测试：

```powershell
npm test -- <相关测试文件名或关键词>
```

## 提交信息建议

```text
feat(studio): <小功能英文简述>
```

或：

```text
fix(studio): <修复点英文简述>
```

## 回报格式

按这个格式回复：

```text
结果：<一句话结论>
改动：<文件和要点>
验证：<命令 + 通过/失败摘要>
风险：<未接接口、需权限、需人工配置，没有就写“暂无”>
```

