> owner: domestic-model-task-DM-DOC-001-feature-map-refresh
> canonical_for: 国产模型维护功能代码地图的单任务边界
> upstream: docs/studio-workbench-feature-code-map-20260615.md, docs/studio-workbench-optimization-map-20260615.md
> downstream: docs/domestic-model-implementation-pack-20260615.md

# DM-DOC-001：更新功能代码地图

## 目标

在每次完成一个 `studio-workbench` 小功能后，把用户自然说法、路由、代码文件、测试和修改指引更新到地图里。

## 允许修改

```text
docs/studio-workbench-feature-code-map-20260615.md
docs/studio-workbench-optimization-map-20260615.md
docs/domestic-model-implementation-pack-20260615.md
docs/domestic-model-tasks/*.md
```

## 禁止

- 不改源码。
- 不改证据结论。
- 不把未实现功能写成已完成。
- 不记录密钥、token、服务器密码。

## 步骤

1. 读本次功能涉及的页面、helper、store/API、测试。
2. 在 `docs/studio-workbench-feature-code-map-20260615.md` 找到对应模块。
3. 补充或修正：用户说法、路由、主要文件、数据/API、测试、修改指引。
4. 如果该功能影响风险或执行顺序，同步更新 `docs/studio-workbench-optimization-map-20260615.md`。
5. 如果任务池状态变化，同步更新 `docs/domestic-model-implementation-pack-20260615.md`。

## 验证

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo
git diff --check
rg -n "APPSecret|AccessKey|password|密码|token=" docs\studio-workbench-feature-code-map-20260615.md docs\studio-workbench-optimization-map-20260615.md docs\domestic-model-implementation-pack-20260615.md
```

验收标准：

- `git diff --check` 通过。
- 文档没有密钥明文。
- 地图能让下一位模型按自然语言找到代码位置。

## 交给国产模型时复制

```text
你只做 DM-DOC-001：更新影约云门店工作台功能代码地图。

工作目录：
D:\OtherProject\CameraApp\yingyue-cloud-repo

先读：
docs/domestic-model-implementation-pack-20260615.md
docs/studio-workbench-feature-code-map-20260615.md
docs/studio-workbench-optimization-map-20260615.md

只允许改 docs 里的地图和任务单，不改源码，不改证据结论，不写任何密钥。
完成后运行：
git diff --check
rg -n "APPSecret|AccessKey|password|密码|token=" docs\studio-workbench-feature-code-map-20260615.md docs\studio-workbench-optimization-map-20260615.md docs\domestic-model-implementation-pack-20260615.md

按“结果 / 改动 / 验证 / 风险”回报。
```
