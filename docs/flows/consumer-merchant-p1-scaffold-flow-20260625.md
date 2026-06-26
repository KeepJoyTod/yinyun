# P1 消费者体验与商户运营闭环脚手架数据流

生成时间：2026-06-25

```mermaid
sequenceDiagram
  actor Customer as 消费者
  participant Mobile as 第一层: mobile-uniapp 页面
  participant MobileState as 第二层: useCustomerExperienceP1
  participant CustomerApi as 第二层: customerExperienceP1 API
  participant ClientSvc as 第二层: YyClientExperienceP1Service
  participant ExistingData as 第三层: 既有订单/会员/券/通知账本

  Customer->>Mobile: 打开商品详情/卡券/我的/评价页
  Mobile->>MobileState: loadBookingOptions/loadAssetSummary/submitReviewDraft
  MobileState->>CustomerApi: 请求 P1 脚手架接口
  CustomerApi->>ClientSvc: /api/customer/experience-p1/*
  ClientSvc-->>ExistingData: 本包不新增表、不写真实资金权益账本
  ClientSvc-->>CustomerApi: scaffold/building/not_connected 状态
  CustomerApi-->>MobileState: 归一化结果或本地 fallback
  MobileState-->>Mobile: 渲染候选、缺口、不可用原因
  Mobile-->>Customer: 展示脚手架状态和后续接入边界
```

```mermaid
sequenceDiagram
  actor Customer as 消费者
  participant ProductPage as 第一层: 商品详情预约页
  participant CustomerApi as 第二层: createCustomerOrder
  participant PublicSvc as 第二层: YyClientPublicApiService
  participant Order as 第三层: yy_order

  Customer->>ProductPage: 选择服务组/填写资料项/选择权益候选
  ProductPage->>CustomerApi: POST /api/customer/orders(serviceGroupId, customFields, entitlement*)
  CustomerApi->>PublicSvc: ClientCustomerOrderCreateBo
  PublicSvc->>Order: 写 service_group_id; remark 追加 P1 scaffold 信息
  PublicSvc-->>CustomerApi: 返回订单摘要
  CustomerApi-->>ProductPage: 继续原支付流程
  Note over PublicSvc,Order: 不新增表; 不写真实权益预占/核销/扣减
```

```mermaid
sequenceDiagram
  actor Staff as 店员/运营
  participant View as 第一层: MerchantConsumerOpsP1View
  participant State as 第二层: useMerchantConsumerOpsP1State
  participant Api as 第二层: backendConsumerOpsP1Api
  participant Service as 第二层: YyMerchantConsumerOpsP1Service
  participant ExistingOwners as 第三层: 订单/装修/营销/会员/通知/资源既有 owner

  Staff->>View: 进入消费者运营 P1
  View->>State: reload()
  State->>Api: getConsumerOpsP1Overview()
  Api->>Service: GET /yy/merchant/consumer-ops-p1/overview
  Service-->>ExistingOwners: 只声明数据边界和 owner，不写表
  Service-->>Api: 缺口项、现有 owner、下一步、交付标准
  Api-->>State: normalized overview
  State-->>View: 加载/失败/空态/状态面板
  View-->>Staff: 决策后续拆包顺序
```

## 失败路径

- 客户端接口失败：开发环境走 `VITE_CUSTOMER_API_FALLBACK` 本地 fallback，生产环境透出错误 toast。
- 商户端接口失败：聚合页展示错误块，允许手动刷新。
- 未接入真实账本：返回 `scaffold` 或 `not_connected`，不返回“已完成”。
