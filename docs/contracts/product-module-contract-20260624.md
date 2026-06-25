# 商品模块契约（2026-06-24）

## 范围

- 表现层：
  - `studio-workbench/src/app/router/featureRegistry.ts`
  - `studio-workbench/src/features/products/DerivedProductModuleView.vue`
  - `studio-workbench/src/features/products/ProductCardCatalogView.vue`
- 控制逻辑层：
  - `studio-workbench/src/features/products/derivedProductModules.ts`
  - `studio-workbench/src/features/products/productCardCatalogOperations.ts`
  - `studio-workbench/src/shared/stores/productStoreTransforms.ts`
  - `studio-workbench/src/shared/api/backendProductsApi.ts`
- 持久数据层：
  - `yy_product`
  - `backend/ruoyi-modules/ruoyi-yy/src/main/java/org/dromara/yy/domain/vo/YyProductVo.java`

## 用户路径

1. 店员进入工作台商品菜单。
2. 点击 `入册产品` 进入 `/product/album`。
3. 页面复用 `ProductCardCatalogView`，支持按门店过滤、查看概览卡片、新增/编辑/上下架。
4. 点击保存后，前端统一走 `appStore.updateProduct(...) -> backendApi.createProduct/updateProduct(...)`。
5. 成功后刷新当前商品目录；失败时显示错误 notice，不伪造成功状态。

## 请求契约

### ProductPayload

文件：`studio-workbench/src/shared/api/backendTypesPayloads.ts`

```ts
type ProductPayload = {
  storeId?: BackendId | null
  productCode: string
  bizCategory?: string
  name: string
  coverUrl: string | null
  spec: string
  priceCents: number
  unitPriceCents: number
  includedCount: number
  active: boolean
  description: string
}
```

### 写入后端字段

文件：`studio-workbench/src/shared/api/backendProductsApi.ts`

- `productType = payload.bizCategory || payload.spec || 'SERVICE'`
- `productName = payload.name`
- `selectionPrice = payload.unitPriceCents / 100`
- `albumProductName = payload.description || payload.name`
- `remark = payload.description`

## 分类契约

文件：`studio-workbench/src/features/products/productCardCatalogOperations.ts`

- `product-group` 默认新建分类：`GROUP_BUY`
- `product-album` 默认新建分类：`ALBUM`
- 展示兼容：
  - `GROUP`
  - `GROUP_BUY`
  - `PRINT`
  - `ALBUM`
  - `CARD`

## DTO -> Store 契约

文件：`studio-workbench/src/shared/stores/productStoreTransforms.ts`

- `mapProduct(dto)` 负责回填 `ProductConfig.bizCategory`
- 推断顺序：
  1. 明确分类值：`CARD / ALBUM / PRINT / GROUP_BUY / GROUP / ADDON`
  2. 再 fallback 到描述关键字
- `productPayload(product)` 必须把 `bizCategory` 带回 API 层

## 边界

- 不新增第二套商品账本。
- 不修改订单、排期、支付链路。
- `GROUP` 仅做兼容读取；新写入统一使用 `GROUP_BUY`。
- `ALBUM` 直接复用现有 `yy_product.productType / selectionPrice / albumProductName / remark`。

## 2026-06-24 phase1 闭环补齐

- 新增 `studio-workbench/src/shared/products/albumProductMetadata.ts` 作为入册规格/张数唯一 codec：
  - 写入：`albumProductName = <规格>｜<张数>张`
  - 读取：兼容解析 `轻奢相册｜12张` 和历史自由文本 `精修入册10张`
- `studio-workbench/src/shared/api/yingyueAdapter.ts` / `productStoreTransforms.ts` 负责把 `yy_product.album_product_name` 回填为：
  - `ProductConfig.spec`
  - `ProductConfig.includedCount`
  - `ProductConfig.bizCategory=ALBUM`
- 新增 `studio-workbench/src/features/products/albumProductReadiness.ts` 作为入册闭环 owner，统一判断：
  - 规格/入册张数是否完整
  - 选片/加修联动是否完整
  - 订单履约是否完整
- 订单履约字段不再塞回商品备注，直接复用真实协作配置表：
  - `GET /yy/collaboration/product-config/list`
  - `PUT /yy/collaboration/product-config/{productId}`
  - 持久层：`yy_product_collaboration_config`

## 2026-06-24 phase2 履约证据回读

- 新增 `studio-workbench/src/features/products/albumProductFulfillmentEvidence.ts` 作为入册履约证据 owner。
- `buildAlbumProductFulfillmentEvidence(...)` 仅读取现有前端状态，不新增接口和库表：
  - `ProductConfig`
  - `BookingOrder`
  - `Album`
  - `SelectionLink`
- 匹配规则：
  - 订单匹配 `productBackendId`，兼容 `externalProductId / externalSkuId`
  - 相册匹配订单 `backendId / id`
  - 选片链接匹配订单或相册 `backendId / id`
- `AlbumProductReadinessPanel` 新增可选 `evidence?: AlbumProductFulfillmentEvidence`，展示：
  - 订单关联
  - 选片证据
  - 交付证据
- 本阶段只做工作台代码闭环和本地验证，不声明真实生产订单端到端已验收。

## 2026-06-25 全链路脚手架补齐

### 主账本与扩展表

- `yy_product` 继续作为唯一商品主账本。
- 新增 SQL 草案：`backend/script/sql/20260625_product_module_scaffold.sql`，只承载扩展配置表，不修改订单、支付、库存、权益主链路。
- 扩展配置表：
  - `yy_product_category`
  - `yy_product_sku`
  - `yy_product_display_config`
  - `yy_product_relation`
  - `yy_product_booking_rule`
  - `yy_product_channel_config`
  - `yy_product_fulfillment_rule`

### 后端接口契约

- `GET /yy/productCatalog/{productId}`：返回商品聚合目录。
- `GET /yy/productCatalog/{productId}/order-readiness`：只读检查商品是否可用于订单侧后续接入。
- `GET /yy/productCatalog/{productId}/inventory-binding`：只读检查 SKU/预约规则与库存绑定状态。
- `GET /yy/productCatalog/{productId}/benefit-binding`：只读检查卡券/权益适用状态。
- `GET/POST/PUT/DELETE /yy/productSku`：SKU 配置骨架。
- `GET/POST/PUT/DELETE /yy/productCategory`：分类配置骨架。
- `GET/POST/PUT/DELETE /yy/productDisplayConfig`：展示配置骨架。
- `GET/POST/PUT/DELETE /yy/productRelation`：关联/加购/入册/冲印关系骨架。
- `GET/POST/PUT/DELETE /yy/productBookingRule`：预约规则配置骨架。
- `GET/POST/PUT/DELETE /yy/productChannelConfig`：抖音/美团渠道商品配置骨架，继续关联 `yy_channel_product_mapping`。
- `GET/POST/PUT/DELETE /yy/productFulfillmentRule`：履约规则配置骨架，兼容 `yy_product_collaboration_config`。

### 前端 owner 契约

- `features/products/catalog`：商品目录聚合入口。
- `features/products/sku`：SKU/价格配置入口。
- `features/products/category`：分类与批量运营入口。
- `features/products/relation`：关联产品/加购/入册配置入口。
- `features/products/booking-rules`：预约限制、预付模式、服务组绑定入口。
- `features/products/channel`：抖音/美团渠道商品映射入口。
- `features/products/cards`：卡项产品与权益 readiness 入口。
- 控制层新增 `backendProductCatalogApi.ts`、`backendProductSkuApi.ts`、`backendProductCategoryApi.ts`、`backendProductRelationApi.ts`、`productCatalogStore.ts`、`productCatalogTransforms.ts`。

### 边界

- 本阶段不新增测试文件。
- 本阶段不执行测试流程。
- 本阶段不调用真实支付、退款、核销、库存扣减、发券、充值、提现、抖音或美团写接口。
- 当前状态为全链路业务脚手架与契约补齐，不等于生产验收完成。
