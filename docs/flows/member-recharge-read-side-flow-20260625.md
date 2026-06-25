# Member Recharge Read Side Flow 2026-06-25

```mermaid
sequenceDiagram
  actor Staff as 店员
  participant View as 表现层 MemberAssetsView
  participant Logic as useMemberAssetOverview
  participant Store as memberStore
  participant Api as backendMemberApi
  participant Controller as YyMemberRechargeController
  participant Service as YyMemberRechargeServiceImpl
  participant DB as yy_member_recharge_order / yy_member_balance_ledger / yy_member_account

  Staff->>View: 打开会员资产页
  View->>Logic: loadSelectedCustomer(customerId)
  Logic->>Store: refreshRechargeOrders(customerId, 10)
  Store->>Api: listMemberRechargeOrders(customerId, 10)
  Api->>Controller: GET /yy/member/customer/{customerId}/recharge-orders
  Controller->>Service: listRechargeOrders(customerId, 10)
  Service->>DB: 查询充值单 + 关联到账余额
  DB-->>Service: latest recharge orders
  Service-->>Controller: recharge order rows
  Controller-->>Api: R.ok(data)
  Api-->>Store: MemberRechargeOrderDto[]
  Store-->>Logic: MemberRechargeOrderInfo[]
  Logic-->>View: recent recharge orders panel
```

## Failure Path

- 客户不存在：后端拒绝读取，前端显示错误态，不缓存旧客户的充值单。
- 门店范围越权：后端返回无权限错误，前端保留当前页面结构和失败提示。
- 充值成功但刷新失败：写链路结果仍保留在 `memberRechargeStore.lastRechargeByCustomer`，店员可重新进入页面触发读侧刷新。
