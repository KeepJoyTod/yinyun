> owner: domestic-model-task-DM-UI-001-dashboard-polish
> canonical_for: 国产模型精修门店工作台 Dashboard 首屏 UI 的单任务边界
> upstream: docs/domestic-model-studio-ui-polish-dashboard.md, docs/studio-workbench-feature-code-map-20260615.md
> downstream: studio-workbench/src/features/dashboard/DashboardView.vue

# DM-UI-001：Dashboard 首屏 UI 精修

## 目标

让 `/` 首页看起来像成熟门店工作台：信息层级清楚、图标语义明确、卡片和提示条稳定，不改业务逻辑。

## 允许修改

```text
studio-workbench/src/features/dashboard/DashboardView.vue
studio-workbench/src/features/dashboard/DashboardView.contract.test.ts
studio-workbench/src/style.css
docs/studio-workbench-feature-code-map-20260615.md
```

## 禁止

- 不改 API、store、router、权限、登录、token、生产域名。
- 不新增客户预约入口。
- 不新增 npm 依赖。
- 不伪造指标、收入、评价、核销。

## 实施要点

1. 先读 `docs/domestic-model-studio-ui-polish-dashboard.md`。
2. 首页标题和区块标题使用稳定 sans 层级，减少厚重 serif。
3. 运营卡片加已有图标库图标；英文 `ORDER/ALBUM/PICK/DELIVER` 改成弱化中文标签。
4. 卡片圆角控制在 6px - 8px；按钮、日期输入、提示条高度统一。
5. 补契约测试锁定关键中文标签和主动作仍存在。

## 验证

```powershell
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- DashboardView
npm test
npm run build
```

验收标准：

- `/` 首屏无横向溢出。
- 卡片标题、数字、说明文字不挤压。
- “处理订单”仍跳统一订单处理，不出现“新建预约”。

## 交给国产模型时复制

```text
你只做 DM-UI-001：Dashboard 首页 UI 精修。
只改任务单允许文件，不改业务逻辑、不改接口、不新增依赖、不部署。

先读：
docs/domestic-model-implementation-pack-20260615.md
docs/domestic-model-studio-ui-polish-dashboard.md
docs/domestic-model-tasks/DM-UI-001-dashboard-polish.md

完成后运行：
cd D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench
npm test -- DashboardView
npm test
npm run build

按“结果 / 改动 / 验证 / 风险”回报。
```
