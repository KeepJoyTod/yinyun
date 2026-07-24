# 影约云审查 Playbook

## 代码、方案与 PR 审查流程

### Metadata
- classification: internal
- status: verified
- owner_id: @dengzhekun
- evidence: AGENTS.md; CONTRIBUTING.md; .github/CODEOWNERS; .github/workflows/studio-ci.yml
- verification: 以当前 diff、目标文件、CI 配置和实际测试证据复核审查结论
- expires_when: CODEOWNERS、CI、分支模型或审查口径变化时

1. 确认 base、head、任务域、允许文件和数据/平台边界。
2. 先看行为正确性、安全、权限、账本一致性、渠道语义和回归风险。
3. 对照三层架构、接口契约、状态机、错误路径和地图检查遗漏。
4. 检查大文件是否继续越界、历史 facade 是否保持兼容、测试是否覆盖改动责任边界。
5. findings 按严重度列出并引用具体文件和行；无问题时说明测试缺口和剩余风险。
6. GitHub Actions、目标测试和必要 smoke 是合并证据，AI 自述不能替代验证。
