# 产品功能清单 84 - 21 项脚手架验收合同

> owner: product-function-inventory-84-scaffold-acceptance
> upstream: `docs/product-function-inventory-84-landing-classification-20260626.md`
> downstream: `studio-workbench/src/features/system/scaffoldAcceptanceMappings.ts`, `docs/yiyue/*.md`

## 1. 目标

本合同只覆盖 `docs/product-function-inventory-84-landing-classification-20260626.md:69` 至 `:93` 的 21 个“脚手架”条目。

本轮完成定义固定为：

- 有可访问入口或兼容入口。
- 有明确三层 owner、路由/页面壳、前端 facade、后端或本地 scaffold DTO。
- 页面明确展示 `scaffold/building/not_connected` 边界，不伪装为生产闭环。
- 契约、流程图、地图、注册表和文案口径一致。

本轮不是生产闭环 `ready`，不新增真实支付、库存、权益、退款或渠道授权写链路。

## 2. Canonical Owner 映射

| 编号 | 功能 | canonical owner | 入口 |
| --- | --- | --- | --- |
| `C-023` | 会员资料 | 客户端 `my` + 商家侧 `member-accounts` 读 owner | `/pages/my/index`、`/member/accounts` |
| `C-025` | 优惠券/兑换券 | 客户端卡券权益 owner | `/pages/coupons/index` |
| `B-018` | 服务产品 | 商品目录 owner | `/product/catalog` |
| `B-019` | 产品规格价格 | SKU owner | `/product/sku` |
| `B-020` | 产品二维码 | 商品目录内 display/qrcode section | `/product/catalog` |
| `B-021` | 关联产品/加购 | 商品关联 owner | `/product/relation` |
| `B-022` | 在线选片配置 | 商品目录/预约规则 owner | `/product/catalog`、`/product/booking-rules` |
| `B-023` | 附加产品 | 派生兼容 scaffold owner | `/product/addon` |
| `B-024` | 团单产品 | 派生兼容 scaffold owner | `/product/group` |
| `B-025` | 冲印产品 | 派生兼容 scaffold owner | `/product/print` |
| `B-028` | 卡项产品配置 | 卡项产品 owner | `/product/cards` |
| `B-110` | 积分规则 | 会员账户内规则 section | `/member/accounts` |
| `B-111` | 会员等级 | 会员账户内规则 section | `/member/accounts` |
| `B-073` | 优惠码 | 营销券 owner 内 code section | `/marketing/coupons` |
| `B-074` | 兑换券 | 营销券 owner 内 exchange section | `/marketing/coupons` |
| `B-077` | 退单后券恢复策略 | 营销券 owner 内 recovery section | `/marketing/coupons` |
| `B-085` | 场景触发 | 平台通知中心 owner | `/platform/notification-center` |
| `B-115` | 预约设置 | 平台预约设置 owner | `/platform/booking-policy` |
| `B-116` | 打印设置 | 平台打印设置 owner | `/platform/print-settings` |
| `B-117` | 评分配置 | 平台评分配置 owner | `/platform/score-settings` |
| `B-118` | 邮箱设置 | 平台邮箱设置 owner | `/platform/email-settings` |

## 3. 分层约束

### 表现层

- 工作台共享脚手架必须通过 `ModuleScaffoldView` 或统一的 owner section 展示：
  - `inventoryCodes`
  - `acceptanceLabel`
  - `boundaryNotes`
  - `nextActions`
- `B-023/B-024/B-025` 必须升级为“标准 scaffold 兼容页”，不能只停留在派生说明。

### 控制逻辑层

- 商品继续复用现有 product scaffold facade：
  - `productCatalog`
  - `productSku`
  - `productRelation`
  - `productBookingRule`
  - `productChannelConfig`
  - `benefitBinding`
- 客户端继续复用 `/api/customer/experience-p1/*`
- 会员/营销/平台继续复用现有只读或 scaffold facade，不新开高风险写链路。

### 持久数据层

- 不新增第二套商品、会员、营销或平台主账本。
- 不改订单、支付、库存、权益真实写链路。
- 缺真实账本时只能返回 scaffold/read-only 说明。

## 4. 统一返回/展示口径

### 共享前端 scaffold 元数据

```ts
type ScaffoldAcceptanceMeta = {
  inventoryCodes: string[]
  acceptanceLabel: string
  boundaryNotes: string[]
  nextActions: string[]
}
```

### scaffold DTO 最小要求

```ts
type ScaffoldStatusEnvelope = {
  status: 'scaffold' | 'building' | 'not_connected'
  updatedAt?: string
  evidence?: string[]
  nextActions?: string[]
}
```

## 5. 边界

- 不执行测试流程。
- 不执行 build。
- 不改真实支付、退款、库存扣减、权益扣减/回滚、抖音/美团/微信真实授权写接口。
- 不回滚工作区内已有无关改动。
