# 内部协作真实闭环契约（2026-06-24）

## 1. 功能摘要

| 项 | 内容 |
| --- | --- |
| 功能名 | 内部协作真实闭环 |
| 用户角色 | 店长 / 店员 / 管理员 |
| 用户入口 | `/collaboration/*` 工作台协作路由 |
| 成功结果 | 可配置岗位、产品、通用、中央修图、开通设置；可查看和流转真实工单 |
| 失败结果 | 显示错误文案，不写入无效配置或错误状态流转 |

## 2. 三层职责

| 层级 | Owner | 职责 |
| --- | --- | --- |
| 表现层 | `studio-workbench/src/features/collaboration/*.vue` | 展示工单、统计、设置表单、空态/加载态/失败态 |
| 控制逻辑层 - 前端 | `studio-workbench/src/shared/api/backendCollaborationApi.ts`、`studio-workbench/src/shared/stores/collaborationStore.ts` | 请求协作接口、归一化 DTO、维护页面状态 |
| 控制逻辑层 - 后端 | `YyCollaborationController`、`YyCollaborationServiceImpl`、`YyWorkOrderServiceImpl` | 配置读写、许可证绑定、工单状态流转、权限校验 |
| 持久数据层 | `yy_work_order`、`yy_work_order_event`、`yy_collaboration_setting`、`yy_product_collaboration_config`、`yy_collaboration_license`、`yy_collaboration_license_store` | 存储工单事实、事件审计、协作配置和许可证绑定 |

## 3. 请求对象

```ts
export type CollaborationSettingPayload = {
  settingType: 'POSITION' | 'COMMON' | 'RETOUCH_CENTER'
  configJson: string
  status?: string
  remark?: string
}

export type ProductCollaborationConfigPayload = {
  productId: string
  workflowJson: string
  needMakeup: boolean
  needPhotography: boolean
  needRetouch: boolean
  needReview: boolean
  needSelectionReview: boolean
  needPickup: boolean
  makeupCount: number
  deliverWithinHours: number
  status?: string
  remark?: string
}
```

## 4. 响应对象

```ts
export type CollaborationSettingDto = {
  id: string
  settingType: 'POSITION' | 'COMMON' | 'RETOUCH_CENTER'
  configJson: string
  status: string
  remark: string
  createTime: string
  updateTime: string
}
```

## 5. 状态机

| 当前状态 | 动作 | 下一状态 | 允许角色 | 失败条件 |
| --- | --- | --- | --- | --- |
| `PENDING` | 接单 | `IN_PROGRESS` | 店员/店长 | 工单不存在、状态过期、无岗位权限 |
| `IN_PROGRESS` | 阻塞 | `BLOCKED` | 店员/店长 | 缺少阻塞原因 |
| `BLOCKED` | 恢复 | `IN_PROGRESS` | 店员/店长 | 工单不存在、无权限 |
| `IN_PROGRESS` | 完成 | `COMPLETED` | 店员/店长 | 终态工单、状态过期 |

## 6. 错误契约

| 错误码/场景 | UI 文案 | 是否可重试 | 日志要求 |
| --- | --- | --- | --- |
| 无权限 | 无权限操作当前协作模块 | 否 | 记录用户、门店、动作 |
| 状态冲突 | 工单状态已变更，请刷新后重试 | 是 | 记录工单 ID、期望状态、当前状态 |
| 配置非法 | 协作配置格式错误，请检查后重试 | 是 | 记录 settingType 和 configJson 摘要 |
| 门店未绑定 | 当前许可证未绑定门店 | 否 | 记录 licenseId、storeId |

## 7. 数据表读写

| 表 | 操作 | 字段 | 规则 |
| --- | --- | --- | --- |
| `yy_work_order` | READ / UPDATE | `stage_code`、`status`、`handler_id`、`due_time` | 工单主账本 |
| `yy_work_order_event` | INSERT / READ | `work_order_id`、`event_type`、`event_detail` | 审计轨迹 |
| `yy_collaboration_setting` | READ / UPSERT | `setting_type`、`config_json` | 岗位/通用/中央修图配置 |
| `yy_product_collaboration_config` | READ / UPSERT | `product_id`、`workflow_json`、`deliver_within_hours` | 产品协作规则 |
| `yy_collaboration_license` | READ / UPSERT | `license_key`、`valid_from`、`valid_to`、`auth_status` | 协作许可证主表 |
| `yy_collaboration_license_store` | READ / UPSERT | `license_id`、`store_id`、`bind_status` | 许可证绑定门店 |

## 8. 幂等和并发

- 同一 `settingType` 采用“按租户唯一 + 覆盖保存”。
- 同一 `productId` 的协作配置采用幂等更新。
- 工单流转必须带 `expectedStatus`，后端拒绝过期写入。
- 许可证绑定同一门店重复提交返回当前绑定态，不重复创建脏数据。

## 9. 验收命令

```powershell
npm --prefix studio-workbench run check:file-size
npm --prefix studio-workbench run test -- src/app/router/featureRegistry.contract.test.ts src/features/collaboration/*.contract.test.ts
npm --prefix studio-workbench run build
mvn -f backend/pom.xml -pl ruoyi-modules/ruoyi-yy -am -DskipTests=false -Dtest=YyWorkOrderServiceImplTest,YyCollaborationServiceImplTest test
```
