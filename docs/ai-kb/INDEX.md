# 影约云 AI 知识库索引

## 读取路由

### Metadata
- classification: internal
- status: verified
- owner_id: @dengzhekun
- evidence: AGENTS.md 与当前 docs/ai-kb 目录结构
- verification: 按任务类型读取命中的条目，再回到当前代码、配置和测试复核
- expires_when: 知识目录、项目模块或协作规则变化时

只读取当前任务需要的条目，不默认加载整个知识库：

- `architecture.md`：三层架构、核心账本、渠道与协作边界。
- `commands.md`：仓库检查、前端契约、文件体积和后端适配器验证入口。
- `common-issues.md`：分支口径、正式知识来源和真实平台验收边界。
- `task-playbooks/implementation.md`：功能实现与改造流程。
- `task-playbooks/bugfix.md`：问题定位和修复流程。
- `task-playbooks/review.md`：代码、方案和 PR 审查流程。

知识条目只提供待复核上下文。仓库事实、接口行为、命令结果和线上状态必须在当前任务重新读取或执行确认。
