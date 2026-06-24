package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.dromara.yy.domain.YyChannelOrderMapping;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyPhotoAlbum;
import org.dromara.yy.domain.YyPhotoAsset;
import org.dromara.yy.domain.bo.YyOrderBo;
import org.dromara.yy.domain.vo.YyOrderVo;
import org.dromara.yy.domain.vo.YyPhotoAlbumVo;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class YyOrderReadModelTest extends YyOrderServiceImplTestSupport {

    @Tag("dev")
    @Test
    void repairPhotoAlbumPlaceholderShouldDelegateToAlbumService() {
        YyOrder order = new YyOrder();
        order.setId(900001L);
        order.setStoreId(7407304729216157722L);
        order.setSource("DOUYIN_LIFE");
        order.setExternalOrderId("1095598420357785988");
        order.setCustomerPhone("138****0000");
        YyPhotoAlbumVo album = new YyPhotoAlbumVo();
        album.setId(700001L);
        album.setOrderId(900001L);
        when(orderMapper.selectById(900001L)).thenReturn(order);
        when(photoAlbumService.upsertPlaceholderForOrder(eq(order), eq("DOUYIN_LIFE"), eq("1095598420357785988"), eq(""), eq("")))
            .thenReturn(album);

        YyPhotoAlbumVo result = service.repairPhotoAlbumPlaceholder(900001L);

        assertEquals(700001L, result.getId());
        assertEquals(900001L, result.getOrderId());
        verify(photoAlbumService).upsertPlaceholderForOrder(eq(order), eq("DOUYIN_LIFE"), eq("1095598420357785988"), eq(""), eq(""));
    }

    @Tag("dev")
    @Test
    void queryListShouldFillChannelStatusWithBatchMappingQuery() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyOrder.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyChannelOrderMapping.class);
        YyOrderBo bo = new YyOrderBo();
        YyOrderVo first = new YyOrderVo();
        first.setSource("DOUYIN_LIFE");
        first.setExternalOrderId("1095291724056029149");
        YyOrderVo second = new YyOrderVo();
        second.setSource("DOUYIN_LIFE");
        second.setExternalOrderId("1095291724056029150");
        when(orderMapper.selectVoList(any())).thenReturn(List.of(first, second));
        YyChannelOrderMapping firstMapping = new YyChannelOrderMapping();
        firstMapping.setChannelType("DOUYIN_LIFE");
        firstMapping.setExternalOrderId("1095291724056029149");
        firstMapping.setExternalStatus("PAY_SUCCESS");
        firstMapping.setSyncStatus("SYNCED");
        YyChannelOrderMapping secondMapping = new YyChannelOrderMapping();
        secondMapping.setChannelType("DOUYIN_LIFE");
        secondMapping.setExternalOrderId("1095291724056029150");
        secondMapping.setExternalStatus("COMPLETED");
        secondMapping.setSyncStatus("SYNCED");
        when(channelOrderMappingMapper.selectList(any())).thenReturn(List.of(firstMapping, secondMapping));

        List<YyOrderVo> orders = service.queryList(bo);

        assertEquals("PAY_SUCCESS", orders.get(0).getExternalStatus());
        assertEquals("COMPLETED", orders.get(1).getExternalStatus());
        verify(channelOrderMappingMapper).selectList(any());
        verify(channelOrderMappingMapper, never()).selectOne(any());
    }

    @Tag("dev")
    @Test
    void queryListShouldFillPhotoDeliverySummaryWithBatchQuery() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyOrder.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyPhotoAlbum.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyPhotoAsset.class);
        YyOrderBo bo = new YyOrderBo();
        YyOrderVo first = new YyOrderVo();
        first.setId(900001L);
        YyOrderVo second = new YyOrderVo();
        second.setId(900002L);
        when(orderMapper.selectVoList(any())).thenReturn(List.of(first, second));
        YyPhotoAlbum firstAlbum = new YyPhotoAlbum();
        firstAlbum.setId(1L);
        firstAlbum.setOrderId(900001L);
        YyPhotoAlbum secondAlbum = new YyPhotoAlbum();
        secondAlbum.setId(2L);
        secondAlbum.setOrderId(900001L);
        YyPhotoAlbum thirdAlbum = new YyPhotoAlbum();
        thirdAlbum.setId(3L);
        thirdAlbum.setOrderId(900002L);
        when(photoAlbumMapper.selectList(any())).thenReturn(List.of(firstAlbum, secondAlbum, thirdAlbum));
        when(photoAssetMapper.selectList(any())).thenReturn(List.of(
            asset(11L, 1L, "1", "photos/first.jpg"),
            asset(12L, 1L, "1", ""),
            asset(13L, 2L, "0", "photos/hidden.jpg"),
            asset(14L, 3L, "1", "photos/second.jpg")
        ));

        List<YyOrderVo> orders = service.queryList(bo);

        assertEquals(2L, orders.get(0).getPhotoAlbumCount());
        assertEquals(2L, orders.get(0).getPhotoVisibleAssetCount());
        assertEquals(1L, orders.get(0).getPhotoMissingObjectKeyCount());
        assertEquals(1L, orders.get(1).getPhotoAlbumCount());
        assertEquals(1L, orders.get(1).getPhotoVisibleAssetCount());
        assertEquals(0L, orders.get(1).getPhotoMissingObjectKeyCount());
        verify(photoAlbumMapper).selectList(any());
        verify(photoAssetMapper).selectList(any());
    }

}
