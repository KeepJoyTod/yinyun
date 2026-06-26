# order-card-batch-scaffold-flow-20260625

## 用户路径

- 店员从 `订单 / 批量开卡` 进入 owner 页。
- 输入门店、卡项、数量、金额和审批原因。
- 系统创建审批申请并回显最近申请列表。
- 审批通过前不生成真实订单，不发放权益。

## Mermaid 数据流

```mermaid
sequenceDiagram
  actor Staff as 店员
  participant View as 表现层 OrderCardBatchView
  participant State as 控制逻辑层 useOrderCardBatch
  participant Api as 控制逻辑层 backendCardBatchOrderApi
  participant Service as 控制逻辑层 YyCardBatchOrderServiceImpl
  participant Approval as 持久数据层 yy_risk_approval

  Staff->>View: 填写批量开卡申请
  View->>State: createCardBatchOrder(draft)
  State->>Api: POST /yy/card-batch-orders
  Api->>Service: YyCardBatchOrderCreateBo
  Service->>Approval: insert pending approval\nbusinessType=CARD_BATCH_ORDER_APPLY
  Approval-->>Service: approval row
  Service-->>Api: YyCardBatchOrderVo
  Api-->>State: CardBatchOrderDto
  State-->>View: 成功提示 + 刷新列表
  View-->>Staff: 看到申请号/状态/金额

  Staff->>View: 刷新列表
  View->>State: load()
  State->>Api: GET /yy/card-batch-orders
  Api->>Service: YyCardBatchOrderQueryBo
  Service->>Approval: select recent approvals
  Approval-->>Service: rows
  Service-->>Api: list<YyCardBatchOrderVo>
  Api-->>State: list<CardBatchOrderDto>
  State-->>View: 最近申请列表
```

## 失败路径

- 参数校验失败：页面显示错误，不创建审批单。
- 后端异常：页面保留草稿并展示失败信息。
- 审批未通过：列表保留申请记录和驳回结果摘要。

## 数据边界

- 订单账本仍是 `yy_order`，本包不写入。
- 权益、储值、支付、卡实例均不在本包内创建。
- 批量开卡只是审批脚手架，不代表生产闭环完成。
