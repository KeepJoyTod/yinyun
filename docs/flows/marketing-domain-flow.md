# 营销域脚手架数据流

```mermaid
flowchart TD
  Staff["店员/店长\n打开营销模块"] --> View["表现层\nMarketing*View / PromotionTrialPanel"]
  View --> Logic["前端控制逻辑\nuseCouponTemplates/useCampaignEditor/usePromotionTrial"]
  Logic --> Api["前端 API Module\nmarketing*Api + promotionPricingFacade"]
  Api --> Controller["后端 Controller\n能力/券模板/活动/参与/试算"]
  Controller --> Service["后端 Service\n脚手架聚合 + 固定优先级试算"]
  Service --> Policy["Policy/Resolver\n优先级/互斥/恢复/能力开关"]
  Service --> Data["持久层\n营销表 + yy_order"]
  Data --> Service
  Policy --> Service
  Service --> Controller
  Controller --> Api
  Api --> Logic
  Logic --> View
  View --> Feedback["成功/空态/未开通/失败/试算结果"]
```

```mermaid
sequenceDiagram
  actor Staff as 店员
  participant Trial as PromotionTrialPanel
  participant Hook as usePromotionTrial
  participant Facade as promotionPricingFacade
  participant Controller as YyPromotionTrialController
  participant Service as YyPromotionTrialService
  participant Policy as PromotionPriorityPolicy
  participant DB as yy_order / yy_promotion_trial_snapshot

  Staff->>Trial: 选中活动订单并点击优惠试算
  Trial->>Hook: runTrial(order)
  Hook->>Facade: runPromotionTrial(payload)
  Facade->>Controller: POST /yy/promotionTrial/run
  Controller->>Service: runTrial(command)
  Service->>Policy: evaluate(candidates)
  Policy-->>Service: appliedRule / blockedReasons
  Service->>DB: write trial snapshot
  DB-->>Service: persisted
  Service-->>Controller: result
  Controller-->>Facade: PromotionTrialResultDto
  Facade-->>Hook: normalized result
  Hook-->>Trial: candidates / 命中规则 / 恢复策略
  Trial-->>Staff: 显示可用优惠与不可用原因
```

```mermaid
flowchart TD
  Start["进入营销模块"] --> LoadCapability["读取能力开关"]
  LoadCapability -->|未开通| Gate["MarketingCapabilityGateCard\n展示未开通/到期提示"]
  LoadCapability -->|已开通| LoadScaffold["加载券模板/活动/参与脚手架"]
  LoadScaffold -->|接口失败| Fallback["前端降级到本地 scaffold\n仍保留三层边界提示"]
  LoadScaffold -->|成功| Ready["渲染表格/卡片/试算面板"]
  Fallback --> Retry["允许重试"]
  Ready --> Trial["订单试算"]
  Trial -->|无候选| NoMatch["提示无可用优惠"]
  Trial -->|有候选| Result["展示命中规则、互斥来源、恢复策略"]
```

| 项 | 内容 |
| --- | --- |
| 写库表 | `yy_coupon_template`、`yy_coupon_instance`、`yy_coupon_grant_record`、`yy_coupon_writeoff_record`、`yy_campaign`、`yy_campaign_product`、`yy_campaign_participation`、`yy_promotion_capability`、`yy_promotion_trial_snapshot` |
| 读接口 | `GET /yy/marketingCapability/list`、`GET /yy/marketing/dashboard`、`GET /yy/couponTemplate/scaffold`、`GET /yy/campaign/scaffold`、`GET /yy/campaignParticipation/scaffold` |
| 写接口 | `POST /yy/promotionTrial/run` |
| 空态 | 显示“脚手架就绪，等待真实账本或运营数据接入” |
| 加载态 | 卡片骨架屏 + 表格 loading 文案 |
| 失败态 | 能力开关失败显示统一错误条；试算失败保留原价并提示重试 |
| 验证 | `npm --prefix studio-workbench run test -- src/features/marketing/*.test.ts src/features/orders/*promotion*.test.ts`、`mvn -pl backend/ruoyi-modules/ruoyi-yy -Dtest=*Promotion* test` |
