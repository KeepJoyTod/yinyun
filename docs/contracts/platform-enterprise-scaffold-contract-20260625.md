# 平台与企业级能力脚手架契约

更新时间：2026-06-25

## 范围

- 本契约只覆盖 `docs/product-function-inventory(产品功能清单).md` 第 6 节中本轮落地的 5 个平台 owner：`P-007`、`P-008`、`P-010`、`P-013`、`P-016`。
- 本次只新增前后端脚手架、只读 facade、契约测试和地图更新，不新增数据库表，不执行迁移，不调用美团/ERP/CRM/短信/对象存储真实写接口。
- 已有平台设置、账号中心、费用中心、渠道授权和通知日志继续保持兼容外观。

## 三层 owner

### 表现层

- `studio-workbench/src/features/platform-settings/PlatformLoginRiskView.vue`
- `studio-workbench/src/features/platform-settings/PlatformOpenApiView.vue`
- `studio-workbench/src/features/platform-settings/PlatformTaskCenterView.vue`
- `studio-workbench/src/features/platform-settings/PlatformBackupRecoveryView.vue`
- `studio-workbench/src/features/platform-settings/PlatformMeituanReviewTraceView.vue`
- `studio-workbench/src/features/platform-settings/components/PlatformPhase1StatusPanel.vue`
- `studio-workbench/src/features/platform-settings/platformSettingsScaffolds.ts`
- `studio-workbench/src/app/router/featureRegistry.ts`
- `studio-workbench/src/app/router/index.ts`

### 控制逻辑层

- `studio-workbench/src/features/platform-settings/composables/usePlatformSettingsList.ts`
- `studio-workbench/src/shared/api/backendPlatformApi.ts`
- `studio-workbench/src/shared/api/backendTypesPlatform.ts`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/controller/YyPlatformSettingsController.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/IYyPlatformSettingsService.java`
- `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/service/impl/YyPlatformSettingsServiceImpl.java`

### 持久数据层

- 本次不新增表、不写表。
- 只读证据优先复用现有账本：`yy_channel_account`、`yy_channel_sync_log`、`yy_notification_template`、`yy_notification_log`、`yy_service_license_binding`。
- 当缺少真实账本时，后端返回 `scaffold` 状态和明确 `nextActions`，不伪造“已完成”。

## 接口

- `GET /yy/platform-settings/login-risk-policies`
- `GET /yy/platform-settings/open-api-apps`
- `GET /yy/platform-settings/async-tasks`
- `GET /yy/platform-settings/backup-recovery-plans`
- `GET /yy/platform-settings/meituan-review-traces`

## 权限

- `login-risk-policies`：`yy:dashboard:list`
- `open-api-apps`：`yy:channel:list`
- `async-tasks`：`yy:dashboard:list`
- `backup-recovery-plans`：`yy:dashboard:list`
- `meituan-review-traces`：`yy:channel:list`

## 模块映射

| 条目 | 路由 | owner | 本轮返回 |
| --- | --- | --- | --- |
| `P-007` 登录与设备风控 | `/platform/login-risk` | `platform-login-risk` | 风控策略、证据、下一步动作 |
| `P-008` 开放 API | `/platform/open-api` | `platform-open-api` | 开放应用、签名模式、限流口径 |
| `P-010` 异步任务中心 | `/platform/task-center` | `platform-task-center` | 任务队列、保留策略、失败重试缺口 |
| `P-013` 数据备份与恢复 | `/platform/backup-recovery` | `platform-backup-recovery` | PITR/对象版本化/恢复演练证据 |
| `P-016` 美团差评溯源插件 | `/platform/meituan-review-trace` | `platform-meituan-review-trace` | 插件授权、差评同步缺口、下一步动作 |

## 边界

- 页面可以展示状态、证据、阻塞原因和下一步动作。
- 页面不发起 API key 创建、备份执行、恢复演练、设备指纹写入、真实差评拉取或渠道写操作。
- 后续真实闭环必须另开任务包，补真实账本、权限、审计、回滚和 smoke 证据。
