# 影约云接口和对象契约模板

> owner: yingyue-contract-template
> canonical_for: 功能开工前的接口、对象、错误、状态机契约模板
> upstream: `docs/architecture/three-layer-standard.md`
> downstream: feature-specific contract docs, tests, API modules

## 使用规则

每个非平凡功能在写代码前复制本模板到 `docs/contracts/<feature>-contract.md`，并填完整。合同先定，代码按合同实现。

## 1. 功能摘要

| 项 | 内容 |
| --- | --- |
| 功能名 | 例如：预约订单改期 |
| 用户角色 | 店员 / 店长 / 客户 / 系统 / 抖音平台 |
| 用户入口 | 页面路径、按钮、弹窗 |
| 成功结果 | 用户看到什么、数据写到哪里 |
| 失败结果 | 用户看到什么、是否可重试 |

## 2. 三层职责

| 层级 | Owner | 职责 |
| --- | --- | --- |
| 表现层 | `path/to/View.vue` | 展示、输入、反馈 |
| 控制逻辑层 - 前端 | `path/to/useFeature.ts`, `path/to/xxxApi.ts` | 校验、状态、请求、归一化 |
| 控制逻辑层 - 后端 | `Controller`, `Service`, `Adapter` | 权限、事务、状态机、外部平台适配 |
| 持久数据层 | 表名/字段/Mapper | 读写事实 |

## 3. 请求对象

```ts
export type FeatureRequest = {
  id: string
  storeId: string
  reason?: string
}
```

字段说明：

| 字段 | 类型 | 必填 | 来源 | 规则 |
| --- | --- | --- | --- | --- |
| `id` | `string` | 是 | route/query/row | 后端真实 ID，不使用展示名。 |
| `storeId` | `string` | 是 | 当前门店范围 | 必须是 `yy_store.id`。 |
| `reason` | `string` | 否 | 用户输入 | 最大长度按后端规则。 |

## 4. 响应对象

```ts
export type FeatureResponse = {
  success: boolean
  data?: unknown
  message?: string
  requestId?: string
}
```

字段说明：

| 字段 | 类型 | 规则 |
| --- | --- | --- |
| `success` | `boolean` | 业务是否成功。 |
| `data` | `unknown` | 归一化后的业务数据，不直接暴露 raw 私密 payload。 |
| `message` | `string` | 可展示错误/成功信息。 |
| `requestId` | `string` | 后端 trace/logid，方便排查。 |

## 5. 状态机

| 当前状态 | 动作 | 下一状态 | 允许角色 | 失败条件 |
| --- | --- | --- | --- | --- |
| `待确认` | 确认 | `已确认` | 店员/店长 | 订单不存在、无权限、终态订单 |

## 6. 错误契约

| 错误码/场景 | UI 文案 | 是否可重试 | 日志要求 |
| --- | --- | --- | --- |
| 无权限 | 无权限操作该门店 | 否 | 记录用户、门店、动作 |
| 容量冲突 | 当前时段已满，请选择其他时段 | 是 | 记录订单、原时段、新时段 |

## 7. 数据表读写

| 表 | 操作 | 字段 | 规则 |
| --- | --- | --- | --- |
| `yy_order` | READ/UPDATE | `status`, `store_id` | 订单主账本。 |
| `yy_booking_slot_inventory` | READ/UPDATE | `booked_count`, `capacity` | 只有真实时段可写。 |
| `sys_oper_log` | READ | `operator_type`, `oper_name` | 展示操作证据。 |

## 8. 幂等和并发

- 重复提交同一动作必须返回当前最终状态或明确错误。
- 涉及库存扣减必须校验容量和当前订单时段。
- 跨表写入必须由后端事务保证。

## 9. 验收命令

```powershell
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run test -- <target-test>
npm --prefix D:\OtherProject\CameraApp\yingyue-cloud-repo\studio-workbench run build
```

后端变更追加 Maven 目标测试。生产变更追加 HK2 deploy 和真实登录态 smoke。
