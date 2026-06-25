# 会员模块数据流 2026-06-24

```mermaid
flowchart TD
  A["店员打开会员账户/消费记录"] --> B["表现层\nMemberAssetsView / MemberTransactionsView"]
  B --> C["前端控制逻辑\nuseMemberAssetOverview / useMemberTransactions"]
  C --> D["前端 Store\nmemberStore"]
  D --> E["前端 API\nbackendMemberApi"]
  E --> F["后端 Controller\nYyMemberAssetController"]
  F --> G["后端 Service\nYyMemberAssetServiceImpl"]
  G --> H["数据层\nyy_customer + member ledgers"]
  H --> G
  G --> F
  F --> E
  E --> D
  D --> B
```

```mermaid
sequenceDiagram
  actor Staff as 店员
  participant View as 表现层 MemberAssetsView
  participant Logic as useMemberAssetOverview
  participant Store as memberStore
  participant Api as backendMemberApi
  participant Controller as YyMemberAssetController
  participant Service as YyMemberAssetServiceImpl
  participant DB as 会员账本表

  Staff->>View: 打开会员页
  View->>Logic: onMounted()
  Logic->>Store: refreshOverview(customerId)
  Store->>Api: getMemberOverview(customerId)
  Api->>Controller: GET /yy/member/customer/{customerId}/overview
  Controller->>Service: getMemberOverview(customerId)
  Service->>DB: 读取 yy_customer / yy_member_account / 资产账本
  DB-->>Service: 聚合结果
  Service-->>Controller: overview vo
  Controller-->>Api: R.ok(data)
  Api-->>Store: MemberOverviewDto
  Store-->>Logic: MemberOverviewInfo
  Logic-->>View: 摘要卡片 / 空态 / 失败态
```

## 2026-06-24 手工充值闭环补充

```mermaid
sequenceDiagram
  actor Staff as 店员
  participant View as 表现层 MemberAssetsView
  participant Logic as useMemberRecharge
  participant WriteStore as memberRechargeStore
  participant ReadStore as memberStore
  participant Api as backendMemberApi
  participant Controller as YyMemberRechargeController
  participant Service as YyMemberRechargeServiceImpl
  participant DB as yy_member_recharge_order / yy_member_account / yy_member_balance_ledger

  Staff->>View: 点击会员充值并填写金额
  View->>Logic: submitRecharge(form)
  Logic->>WriteStore: submitManualRecharge(customerId, payload)
  WriteStore->>Api: createMemberRechargeOrder()
  Api->>Controller: POST /yy/member/customer/{customerId}/recharge-orders
  Controller->>Service: createRechargeOrder(customerId, bo)
  Service->>DB: 写充值单 + pending_recharge_count + 1
  DB-->>Service: pending order
  Service-->>Controller: recharge order vo
  Controller-->>Api: R.ok(data)
  Api-->>WriteStore: pending recharge order
  WriteStore->>Api: confirmMemberRechargeOrder(rechargeOrderId)
  Api->>Controller: POST /yy/member/recharge-orders/{id}/confirm
  Controller->>Service: confirmRechargeOrder(id)
  Service->>DB: 更新充值单 / 会员汇总 / 余额流水
  DB-->>Service: confirmed order + balance after
  Service-->>Controller: recharge order vo
  Controller-->>Api: R.ok(data)
  Api-->>WriteStore: confirmed recharge order
  WriteStore-->>Logic: success
  Logic->>ReadStore: refreshOverview(customerId)
  Logic->>ReadStore: refreshBalanceLedger(customerId)
  Logic-->>View: 成功提示 / 最新余额
```

### 失败路径

- 建单失败：弹窗内提示错误，不写任何余额变更。
- 确认失败：保留 `PENDING` 充值单，`pending_recharge_count` 不回滚，留待后续人工补确认。
- 刷新失败：充值成功但页面提示刷新失败，用户可手动重进会员页。

## 验证

- `npm --prefix studio-workbench run test -- src/features/member/modules/assets/MemberAssetsView.contract.test.ts src/features/member/modules/transactions/MemberTransactionsView.contract.test.ts src/shared/api/backend.contract.test.ts src/app/router/featureRegistry.contract.test.ts src/app/router/featureRegistry.access.test.ts`
- `npm --prefix studio-workbench run check:file-size`
- `mvn -f backend/pom.xml -pl ruoyi-modules/ruoyi-yy -am -DskipTests compile`

## 2026-06-24 储值 P1 只读链路

```mermaid
sequenceDiagram
  actor Staff as 店员
  participant View as 表现层 stored-value-p1 页面/未来入口
  participant Logic as useMemberStoredValueP1
  participant Api as backendApi
  participant Controller as YyMemberStoredValueController
  participant Service as YyMemberStoredValueServiceImpl
  participant DB as yy_member_balance_ledger / yy_member_recharge_order

  Staff->>View: 打开会员储值正式版入口
  View->>Logic: load(query)
  Logic->>Api: getMemberRechargeCapability()
  Logic->>Api: getMemberRechargeSetting()
  Logic->>Api: listMemberStoredValueTransactions(query)
  Api->>Controller: GET /yy/member/recharge-capability
  Api->>Controller: GET /yy/member/recharge-setting
  Api->>Controller: GET /yy/member/stored-value-transactions
  Controller->>Service: 读取设置/能力/流水
  Service->>DB: 按 customerId/storeId/type/status/limit 查询余额流水
  Service->>DB: sourceType=RECHARGE_ORDER 时补充值单展示字段
  DB-->>Service: 账本事实
  Service-->>Controller: P1 VO
  Controller-->>Api: R.ok(data)
  Api-->>Logic: MemberRechargeSettingDto / MemberRechargeCapabilityDto / transactions
  Logic-->>View: 展示后端真实只读数据
```

### 失败路径

- 三个读取接口任一失败时，前端 `useMemberStoredValueP1` 保留本地 scaffold fallback。
- 普通员工指定越权 `storeId` 时，后端拒绝读取，不返回跨门店流水。
- 当前不生成消费、提现、退款回滚等未落地写链路的数据，只展示余额流水已有事实。
