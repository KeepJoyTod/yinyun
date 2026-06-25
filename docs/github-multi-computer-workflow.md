# GitHub 多电脑协作工作流

> owner: github-multi-computer-workflow
> canonical_for: 多电脑、多人、多个 AI 同时开发影约云仓库的 GitHub 分支、提交、验证和交接规则
> upstream: `AGENTS.md`, `docs/github-upload-checklist.md`
> downstream: 本机 Codex、另一台电脑、Joe/Stella/Claude/国产模型任务包、PR 描述

## 结论

当前仓库已经在 GitHub：

```text
https://github.com/dengzhekun/yingyue-cloud.git
```

当前集成分支：

```text
yingyue-closed-loop-optimization-20260603
```

多电脑开发不要共用一个未提交工作区。每台电脑按任务开自己的任务分支，完成后推到 GitHub，通过 PR 合回集成分支。

根目录入口：

```text
AGENTS.md
CONTRIBUTING.md
```

## 另一台电脑接手

首次克隆：

```powershell
git clone https://github.com/dengzhekun/yingyue-cloud.git
cd yingyue-cloud
git switch yingyue-closed-loop-optimization-20260603
git pull --ff-only
```

开始新任务前先确认当前网络边界：

- 普通前端、后端、本地测试：可在任意电脑做。
- 抖音来客 OpenAPI 主动调用：只有当前出口 IP 已加白时才可本机验收。
- `SPI/Webhook/challenge`、生产订单同步、库存平台写入和 logid 证据：统一以香港2 `103.24.216.8` 为准。

开始新任务：

```powershell
git switch -c feat/<owner>-<topic>-<yyyymmdd>
```

示例：

```powershell
git switch -c feat/joe-miniapp-public-api-20260623
git switch -c feat/codex-slot-orders-smoke-20260623
git switch -c feat/stella-workbench-ui-polish-20260623
```

## 分支规则

| 分支 | 用途 | 规则 |
| --- | --- | --- |
| `main` | 稳定主线/可发布基线 | 不直接开发，不直接 force push |
| `yingyue-closed-loop-optimization-20260603` | 当前项目集成分支 | 只合入已验证任务，供多电脑同步 |
| `feat/<owner>-<topic>-<yyyymmdd>` | 新功能任务 | 一次只做一个任务包，完成后推送/PR |
| `fix/<owner>-<topic>-<yyyymmdd>` | 普通缺陷修复 | 范围要小，必须有复现/验证 |
| `refactor/<owner>-<topic>-<yyyymmdd>` | 拆模块、降文件体积、结构整理 | 不顺手改业务行为 |
| `docs/<owner>-<topic>-<yyyymmdd>` | 文档、地图、交接、规则 | 不混入业务代码 |
| `hotfix/<owner>-<topic>-<yyyymmdd>` | 线上紧急修复 | 范围必须小，验证和回滚路径要写清楚 |

禁止：

- `git add .`
- `git reset --hard`
- `git checkout -- <file>`
- 未沟通的 force push
- 把 `docs/evidence/*` 大量 smoke 证据、`.tmp-*`、本机 `.env*`、`.headroom/`、`dist/`、`target/` 推上去
- 在本机未加白时把抖音 OpenAPI 的 `IP不在白名单` 当成代码 bug
- 在一个任务分支里同时做预约、客片、抖音、装修、小程序等多个业务域

允许：

- 显式 `git add <file1> <file2>`
- 每个任务一个 commit 或少量有意义 commit
- 使用 `git worktree` 在同一台电脑并行开发不同任务

## 任务分段

| 任务域 | 典型范围 | 推荐分支前缀 |
| --- | --- | --- |
| 工作台预约 | 首页时段、预约详情、取消、改期、店员录单、库存回滚 | `feat/*-booking-*` / `fix/*-booking-*` |
| 客片交付 | 上传、通知、客户确认、资料发送、取片页 | `feat/*-photo-*` |
| 客户侧/小程序 | 公开预约入口、客户订单详情、取片闭环、支付预留 | `feat/*-client-*` |
| 抖音来客 | 订单同步、POI/SKU 映射、SPI/Webhook、库存、logid | `feat/*-douyin-life-*` |
| 商户运营 | 装修、微页面、卡产品、门店管理 | `feat/*-merchant-*` |
| 架构治理 | 拆大文件、地图、CI、规则、脚手架 | `refactor/*-*` / `docs/*-*` |

一个 PR 只选择一个任务域。跨域需求先拆成多个 PR。

## 角色分工

| 角色 | 默认职责 |
| --- | --- |
| 主电脑 / Codex | 集成、最终审查、HK2 部署、真实登录态 smoke、抖音标准验收 |
| 另一台电脑 / Claude / 国产模型 | 单任务分支开发、本地测试、PR 输出 |
| Joe / Stella | UI 或模块贡献分支，不直接覆盖 featureRegistry 或真实业务链路 |
| 用户 | 产品方向、权限账号、平台配置、最终取舍 |

## 每次开工前

```powershell
git status --short --branch
git fetch origin
git pull --ff-only
```

确认：

- 当前分支正确；
- 没有未提交的别人的改动；
- 任务包写明允许修改哪些文件；
- 涉及预约、排期、订单、抖音来客时先读 `AGENTS.md` 和 `docs\yiyue\*.md` 地图。
- 涉及 GitHub 多电脑协作时先读 `CONTRIBUTING.md` 和本文件。

## 每次提交前

前端工作台常用验证：

```powershell
npm --prefix studio-workbench run check:file-size
npm --prefix studio-workbench run test -- src/features/orders/OrdersView.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts
npm --prefix studio-workbench run build
```

后端 yy 模块目标测试：

```powershell
cd backend
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=DouyinLifeChannelAdapterTest" "-DskipTests=false" "-Dsurefire.failIfNoSpecifiedTests=false" test
```

提交前只加入本任务文件：

```powershell
git status --short
git add <明确文件路径>
git diff --cached --stat
git commit -m "<type>(scope): <summary>"
git push -u origin <branch>
```

## PR/合并规则

PR 描述至少包含：

```text
## Summary
- 改了什么
- 影响哪些页面/API/表

## Verification
- 运行了哪些命令
- 结果摘要

## Boundaries
- 未写库/未部署/未调用抖音，或明确写了哪些 synthetic 数据
- 残留风险
```

PR 必须从任务分支发起，不直接从集成分支改完推送。分支名由 CI 校验：

```text
feat|fix|refactor|docs|hotfix/<owner>-<topic>-<yyyymmdd>
```

合并前必须确认：

- `git diff --cached --stat` 或 PR diff 只包含本任务文件；
- 合同测试覆盖对应行为；
- 文档/地图需要更新时已更新；
- 生产部署类改动有 HK2 release marker 和 smoke 证据。
- CI 的 file-size、contract tests、build、后端目标测试通过。

## CI/CD 口径

GitHub Actions 当前只负责合并前质量门：

- `.github/workflows/studio-ci.yml`：PR/集成分支运行分支命名、密钥扫描、YAML 校验、前端 file-size、contract tests、全量 Vitest、build、后端 compile 和 Douyin adapter 目标测试。
- `.github/workflows/studio-deploy-hk2.yml`：HK2 前端部署。默认只在集成分支相关路径 push 或手动触发时运行。

生产部署仍需人工确认。涉及数据库、真实抖音平台写入、订单/库存变更时，不用纯 CI 自动上线。

## 冲突处理

遇到冲突时：

1. 先 `git fetch origin`。
2. 优先把任务分支 rebase/merge 到最新 `yingyue-closed-loop-optimization-20260603`。
3. 只解决本任务相关文件冲突。
4. 不借冲突机会重排 unrelated 文件。
5. 冲突解决后重跑对应验证命令。

## 交给另一个 AI 的标准提示

```text
你接手的是影约云仓库：
https://github.com/dengzhekun/yingyue-cloud.git

请先读取 AGENTS.md 和 docs/github-multi-computer-workflow.md。
当前集成分支是 yingyue-closed-loop-optimization-20260603。
请先执行：
git status --short --branch
git fetch origin
git pull --ff-only

本次任务只允许修改：
<列文件或目录>

禁止：
- git add .
- reset/checkout 回滚他人改动
- 提交 .env、token、完整手机号、docs/evidence 大量本机证据、dist、target、.headroom
- 在未加白本机直接判定抖音 OpenAPI 真实接口是否通过

完成后运行：
<列验证命令>

最后输出：
改动文件、验证结果、未处理风险、建议 PR 标题。
```
