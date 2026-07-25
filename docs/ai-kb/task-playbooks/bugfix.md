# 影约云缺陷修复 Playbook

## 缺陷定位与修复流程

### Metadata
- classification: internal
- status: verified
- owner_id: @dengzhekun
- evidence: AGENTS.md 数据边界、地图要求和验证规则
- verification: 保留复现证据、最小修复 diff、目标回归结果和未验证边界
- expires_when: 项目调试、测试或发布流程变化时

1. 复现问题或收集直接证据，区分代码、数据、权限、网络和第三方平台环境。
2. 读取对应 code、API、流程、回调和开放平台地图，定位最小责任边界。
3. 涉及订单、库存和排期时先确认真实账本与时段字段，禁止用推测数据补写。
4. 实施最小修复，不清理无关工作区改动，不扩大到相邻重构。
5. 运行最近的契约或单元回归；真实平台问题保留受控环境验收项。
6. 更新受影响地图和可复现问题记录，明确 `verified`、`inference` 和 `unverified`。
