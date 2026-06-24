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
