package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyChannelOrderMapping;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyPhotoAlbum;
import org.dromara.yy.domain.vo.ClientOrderLinkVo;
import org.dromara.yy.domain.vo.ClientOrderTokenVo;
import org.dromara.yy.domain.vo.YyMobileOrderVo;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class YyOrderClientAccessTest extends YyOrderServiceImplTestSupport {

    @Tag("dev")
    @Test
    void mobileOrdersShouldRequireStoreMatchAndPhoneLast4WithoutCustomerName() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyOrder.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyChannelOrderMapping.class);
        YyOrder matched = new YyOrder();
        matched.setId(1L);
        matched.setStoreId(7407304729216157722L);
        matched.setOrderNo("DYL-1095291724056029149");
        matched.setSource("DOUYIN_LIFE");
        matched.setStatus("PENDING");
        matched.setCustomerName("微信客户");
        matched.setCustomerPhone("138****0000");
        matched.setExternalOrderId("1095291724056029149");
        matched.setOrderTime(new Date(1780243200000L));
        YyOrder other = new YyOrder();
        other.setId(2L);
        other.setStoreId(7407304729216157723L);
        other.setOrderNo("DYL-OTHER");
        other.setSource("DOUYIN_LIFE");
        other.setStatus("PENDING");
        other.setCustomerName("同手机号其他门店客户");
        other.setCustomerPhone("138****0000");
        other.setExternalOrderId("1095291724056029150");
        when(orderMapper.selectList(any())).thenReturn(List.of(matched, other));
        YyChannelOrderMapping mapping = new YyChannelOrderMapping();
        mapping.setExternalStatus("PAY_SUCCESS");
        mapping.setRawPayload("{\"mobile\":\"138****0000\"}");
        when(channelOrderMappingMapper.selectOne(any())).thenReturn(mapping);

        List<YyMobileOrderVo> orders = service.queryMobileOrdersByPhone(7407304729216157722L, "138****0000", "0000");

        assertEquals(1, orders.size());
        YyMobileOrderVo order = orders.get(0);
        assertEquals("DYL-1095291724056029149", order.getOrderNo());
        assertEquals("DOUYIN_LIFE", order.getSource());
        assertEquals("PENDING", order.getStatus());
        assertEquals("PAY_SUCCESS", order.getExternalStatus());
        assertNull(order.getCustomerName());
        assertEquals("138****0000", order.getCustomerPhoneMasked());
        assertEquals(new Date(1780243200000L), order.getOrderTime());
    }

    @Tag("dev")
    @Test
    void mobileOrdersShouldMatchDouyinMaskedPhoneWithFullPhone() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyOrder.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyChannelOrderMapping.class);
        YyOrder order = new YyOrder();
        order.setId(1L);
        order.setStoreId(7407304729216157722L);
        order.setOrderNo("DYL-1095291724056029149");
        order.setSource("DOUYIN_LIFE");
        order.setStatus("PENDING");
        order.setCustomerName("抖音客户");
        order.setCustomerPhone("138****0000");
        order.setExternalOrderId("1095291724056029149");
        order.setOrderTime(new Date(1780243200000L));
        when(orderMapper.selectList(any())).thenReturn(List.of(order));
        YyChannelOrderMapping mapping = new YyChannelOrderMapping();
        mapping.setExternalStatus("PAY_SUCCESS");
        when(channelOrderMappingMapper.selectOne(any())).thenReturn(mapping);

        List<YyMobileOrderVo> orders = service.queryMobileOrdersByPhone(7407304729216157722L, "138****0000", "0000");

        assertEquals(1, orders.size());
        assertEquals("DYL-1095291724056029149", orders.get(0).getOrderNo());
        assertEquals("138****0000", orders.get(0).getCustomerPhoneMasked());
    }

    @Tag("dev")
    @Test
    void mobileOrdersShouldRejectWhenPhoneLast4Mismatch() {
        List<YyMobileOrderVo> orders = service.queryMobileOrdersByPhone(7407304729216157722L, "138****0000", "9999");

        assertEquals(0, orders.size());
        verify(orderMapper, never()).selectList(any());
    }

    @Tag("dev")
    @Test
    void clientOrderLinksShouldReturnControlledPickupAndDetailUrlsWithoutCustomerName() {
        ReflectionTestUtils.setField(service, "clientOrderPublicBaseUrl", "https://photo.evanshine.me");
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyOrder.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyChannelOrderMapping.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyPhotoAlbum.class);
        YyOrder order = new YyOrder();
        order.setId(2063173289800183809L);
        order.setStoreId(7407304729216157722L);
        order.setOrderNo("DYL-1095291724056029149");
        order.setSource("DOUYIN_LIFE");
        order.setChannelType("DOUYIN_LIFE");
        order.setStatus("PENDING");
        order.setPayStatus("PAID");
        order.setCustomerName("微信客户");
        order.setCustomerPhone("138****0000");
        order.setExternalOrderId("1095291724056029149");
        order.setOrderTime(new Date(1780243200000L));
        order.setArrivalTime(new Date(1780329600000L));
        order.setPaidAmountCent(12900L);
        when(orderMapper.selectList(any())).thenReturn(List.of(order));
        YyChannelOrderMapping mapping = new YyChannelOrderMapping();
        mapping.setExternalStatus("PAY_SUCCESS");
        mapping.setSyncStatus("SYNCED");
        when(channelOrderMappingMapper.selectOne(any())).thenReturn(mapping);
        YyPhotoAlbum album = new YyPhotoAlbum();
        album.setId(990202606080001L);
        album.setOrderId(2063173289800183809L);
        album.setStatus("ACTIVE");
        when(photoAlbumMapper.selectList(any())).thenReturn(List.of(album));

        List<ClientOrderLinkVo> links = service.queryClientOrderLinksByPhone(7407304729216157722L, "138****0000", "0000");

        assertEquals(1, links.size());
        ClientOrderLinkVo link = links.get(0);
        assertEquals("2063173289800183809", link.getOrderId());
        assertEquals("DYL-1095291724056029149", link.getOrderNo());
        assertEquals("DOUYIN_LIFE", link.getChannelType());
        assertEquals("PENDING", link.getStatus());
        assertEquals("PAID", link.getPayStatus());
        assertEquals("PAY_SUCCESS", link.getExternalStatus());
        assertNull(link.getCustomerName());
        assertEquals("138****0000", link.getPhoneMasked());
        assertEquals("129.00", link.getAmount());
        assertTrue(link.getPickupAvailable());
        assertEquals("https://photo.evanshine.me/customer/albums/990202606080001", link.getPickupUrl());
        assertEquals("https://photo.evanshine.me/customer/orders/DYL-1095291724056029149", link.getOrderDetailUrl());
    }

    @Tag("dev")
    @Test
    void clientOrderLinksShouldMatchDouyinMaskedPhoneWithFullPhone() {
        ReflectionTestUtils.setField(service, "clientOrderPublicBaseUrl", "https://photo.evanshine.me");
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyOrder.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyChannelOrderMapping.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyPhotoAlbum.class);
        YyOrder order = new YyOrder();
        order.setId(2063173289800183809L);
        order.setStoreId(7407304729216157722L);
        order.setOrderNo("DYL-1095291724056029149");
        order.setSource("DOUYIN_LIFE");
        order.setChannelType("DOUYIN_LIFE");
        order.setStatus("PENDING");
        order.setPayStatus("PAID");
        order.setCustomerName("抖音客户");
        order.setCustomerPhone("138****0000");
        order.setExternalOrderId("1095291724056029149");
        order.setOrderTime(new Date(1780243200000L));
        when(orderMapper.selectList(any())).thenReturn(List.of(order));
        YyPhotoAlbum album = new YyPhotoAlbum();
        album.setId(990202606080001L);
        album.setOrderId(2063173289800183809L);
        album.setStatus("ACTIVE");
        when(photoAlbumMapper.selectList(any())).thenReturn(List.of(album));

        List<ClientOrderLinkVo> links = service.queryClientOrderLinksByPhone(7407304729216157722L, "138****0000", "0000");

        assertEquals(1, links.size());
        assertEquals("DYL-1095291724056029149", links.get(0).getOrderNo());
        assertEquals("138****0000", links.get(0).getPhoneMasked());
    }

    @Tag("dev")
    @Test
    void clientOrderLinksShouldRequireFullPhoneToAvoidLast4Enumeration() {
        List<ClientOrderLinkVo> links = service.queryClientOrderLinksByPhone(7407304729216157722L, "", "0000");

        assertEquals(0, links.size());
        verify(orderMapper, never()).selectList(any());
    }

    @Tag("dev")
    @Test
    void clientOrderLinksShouldRequireStoreIdToAvoidCrossStoreLookup() {
        List<ClientOrderLinkVo> links = service.queryClientOrderLinksByPhone(null, "138****0000", "0000");

        assertEquals(0, links.size());
        verify(orderMapper, never()).selectList(any());
    }

    @Tag("dev")
    @Test
    void clientOrderVerifyShouldIssueScopedTokenAndAllowTokenOrderDetailLookup() {
        ReflectionTestUtils.setField(service, "clientOrderPublicBaseUrl", "https://photo.evanshine.me");
        ReflectionTestUtils.setField(service, "clientOrderTokenSecret", "test-client-order-secret");
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyOrder.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyChannelOrderMapping.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyPhotoAlbum.class);
        YyOrder order = new YyOrder();
        order.setId(2063173289800183809L);
        order.setStoreId(7407304729216157722L);
        order.setOrderNo("DYL-1095291724056029149");
        order.setSource("DOUYIN_LIFE");
        order.setChannelType("DOUYIN_LIFE");
        order.setStatus("PENDING");
        order.setPayStatus("PAID");
        order.setCustomerName("微信客户");
        order.setCustomerPhone("138****0000");
        order.setExternalOrderId("1095291724056029149");
        order.setOrderTime(new Date(1780243200000L));
        order.setArrivalTime(new Date(1780329600000L));
        when(orderMapper.selectList(any())).thenReturn(List.of(order));
        YyPhotoAlbum album = new YyPhotoAlbum();
        album.setId(990202606080001L);
        album.setOrderId(2063173289800183809L);
        album.setStatus("ACTIVE");
        when(photoAlbumMapper.selectList(any())).thenReturn(List.of(album));

        ClientOrderTokenVo token = service.verifyClientOrderAccess(7407304729216157722L, "138 0000 0000", "0000");
        List<ClientOrderLinkVo> tokenOrders = service.queryClientOrderLinksByToken(token.getClientOrderToken());
        ClientOrderLinkVo detail = service.queryClientOrderLinkByToken("DYL-1095291724056029149", token.getClientOrderToken());

        assertTrue(StringUtils.isNotBlank(token.getClientOrderToken()));
        assertEquals(7200L, token.getExpiresIn());
        assertEquals("138****0000", token.getPhoneMasked());
        assertEquals(1, token.getOrders().size());
        assertEquals("DYL-1095291724056029149", tokenOrders.get(0).getOrderNo());
        assertEquals("DYL-1095291724056029149", detail.getOrderNo());
        assertEquals("https://photo.evanshine.me/customer/orders/DYL-1095291724056029149", detail.getOrderDetailUrl());
        assertTrue(!detail.getOrderDetailUrl().contains("storeId="));
    }

    @Tag("dev")
    @Test
    void clientOrderTokenShouldRejectInvalidToken() {
        assertThrows(org.dromara.common.core.exception.ServiceException.class,
            () -> service.queryClientOrderLinksByToken("bad-token"));
        verify(orderMapper, never()).selectList(any());
    }

}
