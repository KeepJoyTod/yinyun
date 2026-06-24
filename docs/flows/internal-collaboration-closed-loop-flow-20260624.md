# 内部协作真实闭环数据流（2026-06-24）

```mermaid
flowchart TD
  A["店员/店长\n点击协作页面"] --> B["表现层\nCollaboration Views"]
  B --> C["前端控制逻辑\ncollaborationStore"]
  C --> D["前端 API\nbackendCollaborationApi"]
  D --> E["后端 Controller\nYyCollaborationController / YyWorkOrderController"]
  E --> F["后端 Service\nYyCollaborationServiceImpl / YyWorkOrderServiceImpl"]
  F --> G["持久层\nyy_work_order\nyy_work_order_event\nyy_collaboration_*"]
  G --> F --> E --> D --> C --> B
  B --> H["成功/失败/空态/加载态"]
```

```mermaid
sequenceDiagram
  actor Staff as 店员
  participant View as 表现层
  participant Store as 前端控制逻辑
  participant Api as API Module
  participant Controller as Backend Controller
  participant Service as Backend Service
  participant DB as 持久层

  Staff->>View: 进入协作页面 / 保存设置 / 流转工单
  View->>Store: submit(payload)
  Store->>Api: request(dto)
  Api->>Controller: HTTP request
  Controller->>Service: validate + command
  Service->>DB: read/write yy_collaboration_* / yy_work_order*
  DB-->>Service: rows
  Service-->>Controller: normalized result
  Controller-->>Api: response
  Api-->>Store: dto
  Store-->>View: state update
  View-->>Staff: render success or error
```

## 关键字段标注

| 项 | 内容 |
| --- | --- |
| `storeId` | 使用真实 `yy_store.id` |
| 订单 ID | 使用真实 `yy_order.id` |
| 工单 ID | 使用真实 `yy_work_order.id` |
| 写库表 | `yy_work_order`、`yy_work_order_event`、`yy_collaboration_setting`、`yy_product_collaboration_config`、`yy_collaboration_license`、`yy_collaboration_license_store` |
| 外部平台 | 本轮不触发 `DOUYIN_LIFE` |
| 证据 | 流转失败和接口错误保留 `requestId/logid` |
| 生产写入 | 是，协作配置和工单真实写库 |

## UI 状态要求

| 项 | 内容 |
| --- | --- |
| 空态 | 无工单时显示“暂无协作工单”；无许可证时显示“当前未配置协作许可证” |
| 加载态 | 页面骨架屏或按钮 loading |
| 失败态 | 顶部提示 + 区域内错误卡片，不吞后端消息 |
| 验证 | `npm --prefix studio-workbench run build`；`mvn -f backend/pom.xml -pl ruoyi-modules/ruoyi-yy -am -DskipTests=false test` |
