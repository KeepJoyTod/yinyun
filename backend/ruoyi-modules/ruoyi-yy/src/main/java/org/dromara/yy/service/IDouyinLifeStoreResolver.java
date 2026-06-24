package org.dromara.yy.service;

public interface IDouyinLifeStoreResolver {

    enum ResolutionResult {
        HIT,
        POI_ONLY_AMBIGUOUS,
        NOT_FOUND
    }

    record StoreResolution(ResolutionResult result, Long storeId, String message) {}
    record ProductResolution(ResolutionResult result, Long productId, String message) {}

    /**
     * Resolve store ID for a DOUYIN_LIFE order by external POI/SKU mapping.
     *
     * Priority:
     * 1. channel_type=DOUYIN_LIFE + external_poi_id + external_sku_id + mapping_status=ACTIVE -> unique match
     * 2. channel_type=DOUYIN_LIFE + external_poi_id only -> must be unique across stores, else AMBIGUOUS
     * 3. Reject non-DOUYIN_LIFE channel types
     */
    StoreResolution resolveStore(String externalPoiId, String externalSkuId, String channelType);

    /**
     * Resolve product ID for a DOUYIN_LIFE order by external SKU mapping.
     */
    ProductResolution resolveProduct(String externalSkuId, Long storeId, String channelType);
}
