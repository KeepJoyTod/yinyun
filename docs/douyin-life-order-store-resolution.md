# DOUYIN_LIFE 订单归店解析规则

> 创建于 2026-06-16

## 概述

DOUYIN_LIFE 渠道订单同步时，通过 `externalPoiId` 和 `externalSkuId` 从 `yy_channel_product_mapping` 表解析真实 `storeId` 和 `productId`。

实现位于 `DouyinLifeStoreResolver` (Service 层)，由 `DouyinLifeChannelAdapter.upsertLocalOrder()` 调用。

## 解析优先级

1. **POI + SKU 精确匹配**: `channel_type=DOUYIN_LIFE` + `external_poi_id` + `external_sku_id` + `mapping_status='ACTIVE'` → 唯一匹配 → HIT
2. **POI 模糊匹配**: `channel_type=DOUYIN_LIFE` + `external_poi_id` only → 必须只对应一个门店 → HIT, 否则 → AMBIGUOUS
3. **均未命中**: → NOT_FOUND，保留默认门店 + 标记 NEED_MAPPING

## ResolutionResult 枚举

| 值 | 含义 | 行为 |
|---|---|---|
| HIT | 找到映射 | 写入真实 storeId/productId |
| POI_ONLY_AMBIGUOUS | POI 对应多个门店 | 保留默认门店 + NEED_MAPPING |
| NOT_FOUND | 未找到映射 | 保留默认门店 + NEED_MAPPING |

## 安全规则

- **禁止**匹配 DOUYIN_MINI_APP 的映射记录
- **禁止**静默选择第一个匹配项（POI-only 多门店时返回 AMBIGUOUS）
- **禁止**吞单（订单未匹配时仍写入 yy_order，标记 NEED_MAPPING）
- **禁止**fallback 到 firstStoreId（使用 config store / existing entity store）
- **yy_channel_sync_log** 记录解析结果，不含手机号、token、secret

## 异常展示

- `yy_order.inventory_status = 'NEED_MAPPING'`
- `yy_order.conflict_reason` 包含解析失败原因
- 前端 Dashboard "异常概览" 展示缺失映射数量
- 前端 OrdersView 支持按异常类型筛选

## 修复流程

1. 人工在 StoreView → DOUYIN_LIFE 映射区块查看缺失映射
2. 在 `/yy/channelProductMapping/list` 补录 POI/SKU 映射
3. 重新触发同步，映射命中后 NEED_MAPPING 自动清除
