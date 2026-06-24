# 影约云协作入口

> owner: contributing-entry
> canonical_for: 新电脑、新 AI、协作者进入影约云仓库前必须读取的协作入口
> upstream: `AGENTS.md`, `docs/github-multi-computer-workflow.md`
> downstream: GitHub PR、多人开发、任务分支、CI/CD、HK2 验收

## 快速结论

仓库：

```text
https://github.com/dengzhekun/yingyue-cloud.git
```

当前集成分支：

```text
yingyue-closed-loop-optimization-20260603
```

新电脑接手：

```powershell
git clone https://github.com/dengzhekun/yingyue-cloud.git
cd yingyue-cloud
git switch yingyue-closed-loop-optimization-20260603
git pull --ff-only
```

## 开发分支

不要直接在集成分支开发。每个任务开独立分支：

```powershell
git switch -c feat/<owner>-<topic>-<yyyymmdd>
git switch -c fix/<owner>-<topic>-<yyyymmdd>
git switch -c refactor/<owner>-<topic>-<yyyymmdd>
git switch -c docs/<owner>-<topic>-<yyyymmdd>
git switch -c hotfix/<owner>-<topic>-<yyyymmdd>
```

示例：

```powershell
git switch -c feat/claude-client-order-detail-20260623
git switch -c fix/codex-booking-cancel-inventory-20260623
git switch -c refactor/joe-orders-view-split-20260623
```

## 任务分段

一次只做一个任务域：

- 工作台预约：时段详情、预约详情、取消、改期、店员录单、库存回滚。
- 客片交付：上传、通知、客户确认、资料发送、取片页。
- 客户侧/小程序：公开预约入口、客户订单详情、取片闭环、支付预留。
- 抖音来客：订单同步、POI/SKU 映射、SPI/Webhook、库存、logid。
- 商户运营：装修、微页面、卡产品、门店管理。
- 架构治理：拆大文件、代码地图、接口地图、CI、规则。

跨域需求先拆 PR，不要一个分支混做。

## 提交规则

开工前：

```powershell
git status --short --branch
git fetch origin
git pull --ff-only
```

提交前：

```powershell
git status --short
git add <明确文件路径>
git diff --cached --stat
git commit -m "<type>(scope): <summary>"
git push -u origin <branch>
```

禁止：

- `git add .`
- `git reset --hard`
- `git checkout -- <file>`
- force push 未沟通分支
- 提交 `.env*`、token、secret、完整手机号、openid、`docs/evidence/*` 大量本机证据、`dist/`、`target/`、`.headroom/`

## 验证

前端工作台相关改动优先跑：

```powershell
node tools/check-file-size-all.mjs
npm --prefix studio-workbench run check:file-size
npm --prefix mobile-uniapp run check:file-size
npm --prefix studio-workbench run test -- src/features/orders/OrdersView.contract.test.ts src/features/dashboard/DashboardView.contract.test.ts src/features/schedule/ScheduleView.contract.test.ts
npm --prefix studio-workbench run build
```

后端抖音来客、订单、库存相关改动至少跑：

```powershell
cd backend
mvn -pl ruoyi-modules/ruoyi-yy -am "-Dtest=DouyinLifeChannelAdapterTest" "-DskipTests=false" "-Dsurefire.failIfNoSpecifiedTests=false" test
```

## 抖音和香港2边界

本机网络没有加入抖音开放平台 IP 白名单时：

- 不要在本机直接判断抖音 OpenAPI 真实验收结果。
- 不要把 `IP不在白名单` 当代码 bug。
- 代码和本地测试可以继续做。

统一以香港2作为真实平台验收出口：

```text
103.24.216.8
```

这些必须以香港2证据为准：

- `SPI/Webhook/challenge`
- 生产订单同步
- 库存平台写入
- 抖音来客 logid
- 线上 smoke

## PR 要求

PR 从任务分支发起，base 指向：

```text
yingyue-closed-loop-optimization-20260603
```

PR 必须说明：

- 改了什么；
- 影响哪些页面、API、表；
- 跑了哪些验证命令；
- 是否写库、调用抖音、部署 HK2；
- 剩余风险。

更多细则见：

```text
docs/github-multi-computer-workflow.md
```
