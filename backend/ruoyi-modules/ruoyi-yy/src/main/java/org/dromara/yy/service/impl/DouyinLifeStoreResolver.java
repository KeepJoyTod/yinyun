package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyChannelProductMapping;
import org.dromara.yy.mapper.YyChannelProductMappingMapper;
import org.dromara.yy.service.IDouyinLifeStoreResolver;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DouyinLifeStoreResolver implements IDouyinLifeStoreResolver {

    private static final String CHANNEL_TYPE_DOUYIN_LIFE = "DOUYIN_LIFE";
    private final YyChannelProductMappingMapper mappingMapper;

    @Override
    public StoreResolution resolveStore(String externalPoiId, String externalSkuId, String channelType) {
        if (!CHANNEL_TYPE_DOUYIN_LIFE.equalsIgnoreCase(channelType)) {
            return new StoreResolution(ResolutionResult.NOT_FOUND, null,
                "channelType=" + channelType + " 不是 DOUYIN_LIFE，跳过归店解析");
        }

        if (StringUtils.isNotBlank(externalSkuId) && StringUtils.isNotBlank(externalPoiId)) {
            List<YyChannelProductMapping> matches = mappingMapper.selectList(
                new LambdaQueryWrapper<YyChannelProductMapping>()
                    .eq(YyChannelProductMapping::getChannelType, CHANNEL_TYPE_DOUYIN_LIFE)
                    .eq(YyChannelProductMapping::getExternalPoiId, externalPoiId)
                    .eq(YyChannelProductMapping::getExternalSkuId, externalSkuId)
                    .eq(YyChannelProductMapping::getMappingStatus, "ACTIVE")
                    .eq(YyChannelProductMapping::getDelFlag, "0")
            );
            if (matches.size() == 1) {
                YyChannelProductMapping m = matches.get(0);
                if (m.getStoreId() != null) {
                    return new StoreResolution(ResolutionResult.HIT, m.getStoreId(), null);
                }
            }
            if (matches.size() > 1) {
                return new StoreResolution(ResolutionResult.NOT_FOUND, null,
                    "POI+SKU 映射重复: " + matches.size() + " 条记录");
            }
        }

        if (StringUtils.isNotBlank(externalPoiId)) {
            List<YyChannelProductMapping> poiMatches = mappingMapper.selectList(
                new LambdaQueryWrapper<YyChannelProductMapping>()
                    .eq(YyChannelProductMapping::getChannelType, CHANNEL_TYPE_DOUYIN_LIFE)
                    .eq(YyChannelProductMapping::getExternalPoiId, externalPoiId)
                    .eq(YyChannelProductMapping::getMappingStatus, "ACTIVE")
                    .eq(YyChannelProductMapping::getDelFlag, "0")
                    .isNotNull(YyChannelProductMapping::getStoreId)
            );

            if (poiMatches.isEmpty()) {
                return new StoreResolution(ResolutionResult.NOT_FOUND, null,
                    "POI 无活跃映射: " + externalPoiId);
            }

            Set<Long> uniqueStoreIds = poiMatches.stream()
                .map(YyChannelProductMapping::getStoreId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

            if (uniqueStoreIds.size() > 1) {
                return new StoreResolution(ResolutionResult.POI_ONLY_AMBIGUOUS, null,
                    "POI 映射到多个门店 (" + uniqueStoreIds.size() + ")，无法自动归店: " + externalPoiId);
            }

            if (uniqueStoreIds.size() == 1) {
                return new StoreResolution(ResolutionResult.HIT, uniqueStoreIds.iterator().next(), null);
            }
        }

        return new StoreResolution(ResolutionResult.NOT_FOUND, null,
            "externalPoiId 为空，无法归店");
    }

    @Override
    public ProductResolution resolveProduct(String externalSkuId, Long storeId, String channelType) {
        if (!CHANNEL_TYPE_DOUYIN_LIFE.equalsIgnoreCase(channelType)) {
            return new ProductResolution(ResolutionResult.NOT_FOUND, null,
                "channelType=" + channelType + " 不是 DOUYIN_LIFE");
        }
        if (StringUtils.isBlank(externalSkuId)) {
            return new ProductResolution(ResolutionResult.NOT_FOUND, null,
                "externalSkuId 为空");
        }
        List<YyChannelProductMapping> matches = mappingMapper.selectList(
            new LambdaQueryWrapper<YyChannelProductMapping>()
                .eq(YyChannelProductMapping::getChannelType, CHANNEL_TYPE_DOUYIN_LIFE)
                .eq(YyChannelProductMapping::getExternalSkuId, externalSkuId)
                .eq(YyChannelProductMapping::getStoreId, storeId)
                .eq(YyChannelProductMapping::getMappingStatus, "ACTIVE")
                .eq(YyChannelProductMapping::getDelFlag, "0")
        );
        if (matches.size() == 1) {
            return new ProductResolution(ResolutionResult.HIT, matches.get(0).getProductId(), null);
        }
        return new ProductResolution(ResolutionResult.NOT_FOUND, null,
            "SKU 产品映射未找到: " + externalSkuId);
    }
}
