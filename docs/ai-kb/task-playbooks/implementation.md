# 影约云功能实现 Playbook

## 非平凡功能实现流程

### Metadata
- classification: internal
- status: verified
- owner_id: @dengzhekun
- evidence: AGENTS.md 三层架构、任务包和工作树规则
- verification: 检查任务产物是否包含路径、数据流、契约、文件范围和实际验证结果
- expires_when: 项目实施流程、架构标准或任务包格式变化时

1. 读取 `AGENTS.md`、相关 `docs/yiyue/*.md` 地图、三层架构标准和最近的契约。
2. 明确用户路径、成功/失败表现和三层 Mermaid 数据流。
3. 定义请求、响应、状态机、错误、权限、幂等和读写表契约。
4. 写清允许与禁止修改范围、数据/平台边界和验证命令。
5. 在现有 owner 内实现最小完整变更；超大文件使用新 owner 文件，不继续堆积。
6. 运行最近的契约测试、文件体积检查、构建或后端单元测试。
7. 更新受影响的功能、代码、API、流程或优化地图，只沉淀本轮可复核经验。
