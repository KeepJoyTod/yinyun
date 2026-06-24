package org.dromara.yy.channel.douyin;

import org.dromara.yy.domain.YyChannelProductMapping;
import org.dromara.yy.mapper.YyChannelProductMappingMapper;
import org.dromara.yy.service.IDouyinLifeStoreResolver;
import org.dromara.yy.service.impl.DouyinLifeStoreResolver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DouyinLifeStoreResolverTest {

    @Mock
    private YyChannelProductMappingMapper mappingMapper;

    @InjectMocks
    private DouyinLifeStoreResolver resolver;

    @Test
    void poiPlusSkuHit() {
        YyChannelProductMapping mapping = new YyChannelProductMapping();
        mapping.setStoreId(900000000000000100L);
        mapping.setProductId(1000L);
        mapping.setChannelType("DOUYIN_LIFE");
        mapping.setExternalPoiId("poi-A");
        mapping.setExternalSkuId("sku-B");
        mapping.setMappingStatus("ACTIVE");
        mapping.setDelFlag("0");

        when(mappingMapper.selectList(any())).thenReturn(Collections.singletonList(mapping));

        IDouyinLifeStoreResolver.StoreResolution result = resolver.resolveStore("poi-A", "sku-B", "DOUYIN_LIFE");

        assertEquals(IDouyinLifeStoreResolver.ResolutionResult.HIT, result.result());
        assertEquals(900000000000000100L, result.storeId());
        assertNull(result.message());
    }

    @Test
    void poiOnlyUniqueHit() {
        YyChannelProductMapping mapping = new YyChannelProductMapping();
        mapping.setStoreId(900000000000000200L);
        mapping.setChannelType("DOUYIN_LIFE");
        mapping.setExternalPoiId("poi-C");
        mapping.setExternalSkuId("");
        mapping.setMappingStatus("ACTIVE");
        mapping.setDelFlag("0");

        when(mappingMapper.selectList(any())).thenReturn(Collections.singletonList(mapping));

        IDouyinLifeStoreResolver.StoreResolution result = resolver.resolveStore("poi-C", null, "DOUYIN_LIFE");

        assertEquals(IDouyinLifeStoreResolver.ResolutionResult.HIT, result.result());
        assertEquals(900000000000000200L, result.storeId());
    }

    @Test
    void poiOnlyAmbiguous() {
        YyChannelProductMapping m1 = new YyChannelProductMapping();
        m1.setStoreId(900000000000000100L);
        m1.setChannelType("DOUYIN_LIFE");
        m1.setExternalPoiId("poi-D");
        m1.setMappingStatus("ACTIVE");
        m1.setDelFlag("0");

        YyChannelProductMapping m2 = new YyChannelProductMapping();
        m2.setStoreId(900000000000000300L);
        m2.setChannelType("DOUYIN_LIFE");
        m2.setExternalPoiId("poi-D");
        m2.setMappingStatus("ACTIVE");
        m2.setDelFlag("0");

        when(mappingMapper.selectList(any())).thenReturn(List.of(m1, m2));

        IDouyinLifeStoreResolver.StoreResolution result = resolver.resolveStore("poi-D", null, "DOUYIN_LIFE");

        assertEquals(IDouyinLifeStoreResolver.ResolutionResult.POI_ONLY_AMBIGUOUS, result.result());
        assertNotNull(result.message());
        assertTrue(result.message().contains("多个门店"));
    }

    @Test
    void notFoundNoMapping() {
        when(mappingMapper.selectList(any())).thenReturn(Collections.emptyList());

        IDouyinLifeStoreResolver.StoreResolution result = resolver.resolveStore("poi-X", "sku-Y", "DOUYIN_LIFE");

        assertEquals(IDouyinLifeStoreResolver.ResolutionResult.NOT_FOUND, result.result());
        assertNotNull(result.message());
    }

    @Test
    void douyinMiniAppRejected() {
        IDouyinLifeStoreResolver.StoreResolution result = resolver.resolveStore("poi-A", "sku-B", "DOUYIN_MINI_APP");

        assertEquals(IDouyinLifeStoreResolver.ResolutionResult.NOT_FOUND, result.result());
        assertNotNull(result.message());
        assertTrue(result.message().contains("不是 DOUYIN_LIFE"));
    }

    @Test
    void emptyPoiIdRejected() {
        IDouyinLifeStoreResolver.StoreResolution result = resolver.resolveStore("", "sku-B", "DOUYIN_LIFE");

        assertEquals(IDouyinLifeStoreResolver.ResolutionResult.NOT_FOUND, result.result());
        assertNotNull(result.message());
        assertTrue(result.message().contains("externalPoiId 为空"));
    }

    @Test
    void emptyPoiIdNullRejected() {
        IDouyinLifeStoreResolver.StoreResolution result = resolver.resolveStore(null, "sku-B", "DOUYIN_LIFE");

        assertEquals(IDouyinLifeStoreResolver.ResolutionResult.NOT_FOUND, result.result());
    }

    @Test
    void productResolveHit() {
        YyChannelProductMapping mapping = new YyChannelProductMapping();
        mapping.setProductId(500L);
        mapping.setChannelType("DOUYIN_LIFE");
        mapping.setExternalSkuId("sku-Z");
        mapping.setStoreId(900000000000000100L);
        mapping.setMappingStatus("ACTIVE");
        mapping.setDelFlag("0");

        when(mappingMapper.selectList(any())).thenReturn(Collections.singletonList(mapping));

        IDouyinLifeStoreResolver.ProductResolution result = resolver.resolveProduct("sku-Z", 900000000000000100L, "DOUYIN_LIFE");

        assertEquals(IDouyinLifeStoreResolver.ResolutionResult.HIT, result.result());
        assertEquals(500L, result.productId());
    }

    @Test
    void productResolveNotFound() {
        when(mappingMapper.selectList(any())).thenReturn(Collections.emptyList());

        IDouyinLifeStoreResolver.ProductResolution result = resolver.resolveProduct("sku-MISSING", 100L, "DOUYIN_LIFE");

        assertEquals(IDouyinLifeStoreResolver.ResolutionResult.NOT_FOUND, result.result());
    }
}
