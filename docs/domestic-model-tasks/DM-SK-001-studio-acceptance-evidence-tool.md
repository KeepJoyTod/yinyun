> owner: domestic-model-task-DM-SK-001-studio-acceptance-evidence-tool
> canonical_for: 国产模型扩展门店工作台验收证据脚本的单任务边界
> upstream: tools/new-studio-workbench-acceptance-evidence.ps1, docs/studio-workbench-acceptance-checklist-20260615.md
> downstream: docs/evidence/studio-workbench-acceptance-*.md

# DM-SK-001：工作台验收证据工具扩展

## 目标

在现有脚本骨架 `tools/new-studio-workbench-acceptance-evidence.ps1` 上补充安全的路由探针和证据输出，形成可重复的工作台验收报告。

## 允许修改

```text
tools/new-studio-workbench-acceptance-evidence.ps1
docs/domestic-model-tasks/DM-SK-001-studio-acceptance-evidence-tool.md
docs/studio-workbench-acceptance-checklist-20260615.md
```

## 禁止

- 不读取密钥文件。
- 不登录生产后台。
- 不写数据库。
- 不部署。
- 不把 401/403 当成功。
- 不把浏览器截图里的客户隐私提交到 docs。

## 实施要点

1. 保留脚本当前默认只生成手工验收骨架的能力。
2. 可新增 `-ProbeHttp` 参数，只对公开路由做 `GET` 状态码探针。
3. 可新增 `-Route` 参数，允许指定路由列表。
4. 输出 Markdown + JSON 摘要，状态只能是 `SKELETON`、`READY_FOR_MANUAL_CHECK`、`FAIL`。
5. 不自动标记生产交付 PASS；总交付仍看 `docs/evidence/yingyue-delivery-status.json`。

## 验证

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\new-studio-workbench-acceptance-evidence.ps1 -BaseUrl "https://studio.evanshine.me" -OutputPath "$env:TEMP\studio-workbench-acceptance-smoke.md" -AsJson
git diff --check
```

验收标准：

- 脚本能在无密钥环境运行。
- 输出文件不含 secret/token。
- 探针失败时报告失败，不吞错误。

## 交给国产模型时复制

```text
你只做 DM-SK-001：扩展工作台验收证据工具。
只允许改任务单允许文件，不读取密钥，不登录生产后台，不部署，不写数据库。

先读：
docs/domestic-model-implementation-pack-20260615.md
docs/studio-workbench-acceptance-checklist-20260615.md
docs/domestic-model-tasks/DM-SK-001-studio-acceptance-evidence-tool.md
tools/new-studio-workbench-acceptance-evidence.ps1

完成后运行：
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\new-studio-workbench-acceptance-evidence.ps1 -BaseUrl "https://studio.evanshine.me" -OutputPath "$env:TEMP\studio-workbench-acceptance-smoke.md" -AsJson
git diff --check

按“结果 / 改动 / 验证 / 风险”回报。
```
