# 影约云常见问题

## 知识 PR base 与常规集成分支口径不同

### Metadata
- classification: internal
- status: verified
- owner_id: @dengzhekun
- evidence: CONTRIBUTING.md; AGENTS.md; 团队知识库试点决策
- verification: 创建 PR 前同时读取当前任务决策、CONTRIBUTING.md 和 GitHub base
- expires_when: 项目统一默认分支和集成分支口径时

症状：文档同时出现 `main` 和 `yingyue-closed-loop-optimization-20260603`，容易把知识 PR 发到错误 base。

处理：

1. 常规业务协作继续按仓库现行集成分支规则执行。
2. 团队知识库 bootstrap 试点使用已确认的 `main` 作为 PR base。
3. 不自动改写 `CONTRIBUTING.md`；分支模型统一应单独评审。

## 工作区存在知识文件但 commit tree 为空

### Metadata
- classification: internal
- status: verified
- owner_id: @dengzhekun
- evidence: main@4ce66776786e73a8429af01ddc9ad0ef23e4ef68 的 git ls-tree 与工作区文件盘点
- verification: git ls-tree -r --name-only <sha> -- docs/ai-kb; 固定 revision 只读导入
- expires_when: 审核后的知识文件合入 main 时

症状：文件系统中能看到 `docs/ai-kb/`，但固定 commit 导入返回 0 个已提交知识文件。

原因：这些文件尚未进入目标 commit。正式知识以 Git commit tree 为准，不以当前工作区为准。

处理：在隔离任务分支只提交审核后的 `docs/ai-kb/`，通过审批和 CI 合入目标 base，再使用新的完整 commit SHA 重跑导入。验证成功前保持中央索引关闭。

## 本机平台调用失败不能直接判定代码错误

### Metadata
- classification: internal
- status: verified
- owner_id: @dengzhekun
- evidence: AGENTS.md 网络和抖音验收边界
- verification: 区分本地单元结果、白名单错误和受控环境真实响应
- expires_when: 本机获得正式白名单，或验收出口和平台接入方式变化时

涉及抖音 OpenAPI、SPI、Webhook、生产订单同步或库存写入时，先确认请求出口和白名单。`IP 不在白名单` 属于环境证据，不能直接归因于 adapter 或业务代码。
