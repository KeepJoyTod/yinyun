# 影约云命令入口

## 仓库与知识来源检查

### Metadata
- classification: internal
- status: verified
- owner_id: @dengzhekun
- evidence: 本轮已在 main 和隔离工作树执行 Git 只读检查
- verification: 执行下列命令并观察 root、branch、remote、status 和 commit tree
- expires_when: Git 仓库位置、remote、默认分支或知识目录变化时

```powershell
git status --short --branch
git rev-parse --show-toplevel
git remote get-url origin
git rev-parse HEAD
git ls-tree -r --name-only HEAD -- docs/ai-kb
```

禁止用工作区中可见的未提交文件替代 `git ls-tree` 的正式来源结果。

## 前端文件体积与契约检查

### Metadata
- classification: internal
- status: unverified
- owner_id: @dengzhekun
- evidence: AGENTS.md; CONTRIBUTING.md; studio-workbench/package.json
- verification: 在当前分支实际执行命令并记录成功、失败和错误摘要
- expires_when: package.json scripts、前端目录或契约测试入口变化时

```powershell
node tools/check-file-size-all.mjs
npm --prefix studio-workbench run check:file-size
npm --prefix mobile-uniapp run check:file-size
npm --prefix studio-workbench run test -- src/features/orders/OrdersView.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts
npm --prefix studio-workbench run build
```

这些是项目声明的入口，本条目没有把它们标记为当前任务已通过。执行前先确认 Node 版本、依赖状态和目标改动范围。

## 抖音来客适配器单元检查

### Metadata
- classification: internal
- status: unverified
- owner_id: @dengzhekun
- evidence: AGENTS.md; CONTRIBUTING.md; backend/pom.xml
- verification: 从 backend 目录执行指定 Maven 测试，并确认未调用真实平台
- expires_when: Maven 模块、测试类名或渠道 adapter 变化时

```powershell
cd backend
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=DouyinLifeChannelAdapterTest" "-DskipTests=false" "-Dsurefire.failIfNoSpecifiedTests=false" test
```

本地单元测试不替代真实 SPI、Webhook、OpenAPI 或生产同步验收。
