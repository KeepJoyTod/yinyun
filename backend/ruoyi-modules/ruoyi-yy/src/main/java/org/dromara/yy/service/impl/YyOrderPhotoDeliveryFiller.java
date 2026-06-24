package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyPhotoAlbum;
import org.dromara.yy.domain.YyPhotoAsset;
import org.dromara.yy.domain.vo.YyOrderVo;
import org.dromara.yy.mapper.YyPhotoAlbumMapper;
import org.dromara.yy.mapper.YyPhotoAssetMapper;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

final class YyOrderPhotoDeliveryFiller {

    private YyOrderPhotoDeliveryFiller() {
    }

    static void fillPhotoAlbumCount(List<YyOrderVo> orders, YyPhotoAlbumMapper photoAlbumMapper,
                                    YyPhotoAssetMapper photoAssetMapper) {
        if (orders == null || orders.isEmpty()) {
            return;
        }
        List<Long> orderIds = orders.stream()
            .filter(Objects::nonNull)
            .map(YyOrderVo::getId)
            .filter(Objects::nonNull)
            .distinct()
            .toList();
        if (orderIds.isEmpty()) {
            return;
        }

        List<YyPhotoAlbum> albums = photoAlbumMapper.selectList(Wrappers.<YyPhotoAlbum>lambdaQuery()
            .select(YyPhotoAlbum::getId, YyPhotoAlbum::getOrderId)
            .in(YyPhotoAlbum::getOrderId, orderIds));
        List<YyPhotoAlbum> albumList = albums == null ? List.of() : albums;
        Map<Long, Long> albumCounts = albumList.stream()
            .filter(album -> album.getOrderId() != null)
            .collect(LinkedHashMap::new, (map, album) -> map.merge(album.getOrderId(), 1L, Long::sum), Map::putAll);
        Map<Long, Long> albumOrderIds = albumList.stream()
            .filter(album -> album.getId() != null && album.getOrderId() != null)
            .collect(LinkedHashMap::new, (map, album) -> map.put(album.getId(), album.getOrderId()), Map::putAll);
        Map<Long, PhotoDeliverySummary> deliverySummaries = buildPhotoDeliverySummaries(albumOrderIds, photoAssetMapper);

        for (YyOrderVo order : orders) {
            if (order != null) {
                PhotoDeliverySummary deliverySummary = deliverySummaries.getOrDefault(order.getId(), PhotoDeliverySummary.EMPTY);
                order.setPhotoAlbumCount(albumCounts.getOrDefault(order.getId(), 0L));
                order.setPhotoVisibleAssetCount(deliverySummary.visibleAssetCount());
                order.setPhotoMissingObjectKeyCount(deliverySummary.missingObjectKeyCount());
            }
        }
    }

    private static Map<Long, PhotoDeliverySummary> buildPhotoDeliverySummaries(Map<Long, Long> albumOrderIds,
                                                                               YyPhotoAssetMapper photoAssetMapper) {
        if (albumOrderIds.isEmpty()) {
            return Map.of();
        }
        List<YyPhotoAsset> assets = photoAssetMapper.selectList(Wrappers.<YyPhotoAsset>lambdaQuery()
            .select(YyPhotoAsset::getId, YyPhotoAsset::getAlbumId, YyPhotoAsset::getVisible, YyPhotoAsset::getObjectKey)
            .in(YyPhotoAsset::getAlbumId, albumOrderIds.keySet()));
        Map<Long, PhotoDeliverySummary> summaries = new LinkedHashMap<>();
        for (YyPhotoAsset asset : assets == null ? List.<YyPhotoAsset>of() : assets) {
            Long orderId = albumOrderIds.get(asset.getAlbumId());
            if (orderId == null || !"1".equals(asset.getVisible())) {
                continue;
            }
            summaries.compute(orderId, (key, summary) -> {
                PhotoDeliverySummary current = summary == null ? PhotoDeliverySummary.EMPTY : summary;
                long missingObjectKey = StringUtils.isBlank(asset.getObjectKey()) ? 1L : 0L;
                return new PhotoDeliverySummary(current.visibleAssetCount() + 1, current.missingObjectKeyCount() + missingObjectKey);
            });
        }
        return summaries;
    }

    private record PhotoDeliverySummary(long visibleAssetCount, long missingObjectKeyCount) {
        private static final PhotoDeliverySummary EMPTY = new PhotoDeliverySummary(0L, 0L);
    }
}
