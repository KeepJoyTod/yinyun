package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyPhotoAccessLog;
import org.dromara.yy.domain.YyPhotoAlbum;
import org.dromara.yy.domain.YyPhotoAsset;
import org.dromara.yy.domain.YyNotificationLog;
import org.dromara.yy.domain.bo.YyPhotoAlbumActionBo;
import org.dromara.yy.domain.vo.YyPhotoAlbumActionResultVo;
import org.dromara.yy.domain.vo.YyPhotoAlbumVo;
import org.dromara.yy.domain.vo.YyPhotoAlbumOperationsSummaryVo;
import org.dromara.yy.mapper.YyPhotoAccessLogMapper;
import org.dromara.yy.mapper.YyPhotoAlbumMapper;
import org.dromara.yy.mapper.YyPhotoAssetMapper;
import org.dromara.yy.mapper.YyNotificationLogMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyPhotoAlbumServiceImplTest {

    @Mock
    private YyPhotoAlbumMapper albumMapper;

    @Mock
    private YyPhotoAssetMapper assetMapper;

    @Mock
    private YyPhotoAccessLogMapper accessLogMapper;

    @Mock
    private YyNotificationLogMapper notificationLogMapper;

    @Test
    void queryListShouldNotBeUnscopedForNormalEmployeeWhenStoreIdMissing() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyPhotoAlbum.class);
        YyPhotoAlbumServiceImpl service = new YyPhotoAlbumServiceImpl(albumMapper, assetMapper, accessLogMapper, notificationLogMapper);
        when(albumMapper.selectVoList(any(Wrapper.class))).thenReturn(List.of());

        try (MockedStatic<LoginHelper> loginHelper = mockStatic(LoginHelper.class)) {
            loginHelper.when(LoginHelper::isLogin).thenReturn(true);
            loginHelper.when(LoginHelper::isSuperAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::isTenantAdmin).thenReturn(false);

            service.queryList(new org.dromara.yy.domain.bo.YyPhotoAlbumBo());
        }

        ArgumentCaptor<Wrapper<YyPhotoAlbum>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(albumMapper).selectVoList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();

        assertContainsAny(sqlSegment, "store_id", "storeId", "1 = 0", "1=0");
    }

    @Test
    void queryOperationsSummaryShouldAggregateAssetsAndRecentFailureByAlbum() {
        YyPhotoAlbumServiceImpl service = new YyPhotoAlbumServiceImpl(albumMapper, assetMapper, accessLogMapper, notificationLogMapper);
        when(assetMapper.selectList(any(Wrapper.class))).thenReturn(List.of(
            asset(11L, 1L, "1", "1", "photos/11.jpg"),
            asset(12L, 1L, "1", "0", ""),
            asset(13L, 1L, "0", "1", "photos/13.jpg"),
            asset(21L, 2L, "1", "0", "photos/21.jpg")
        ));
        when(accessLogMapper.selectList(any(Wrapper.class))).thenReturn(List.of(
            failedLog(102L, 1L, "DOWNLOAD", "OSS timeout", new Date(2000)),
            failedLog(101L, 1L, "PREVIEW", "old failure", new Date(1000))
        ));

        List<YyPhotoAlbumOperationsSummaryVo> result = service.queryOperationsSummary(List.of(1L, 2L, 3L));

        assertEquals(3, result.size());
        YyPhotoAlbumOperationsSummaryVo first = result.get(0);
        assertEquals(1L, first.getAlbumId());
        assertEquals(3L, first.getTotalAssets());
        assertEquals(2L, first.getVisibleAssets());
        assertEquals(2L, first.getSelectedAssets());
        assertEquals(1L, first.getMissingObjectKeyAssets());
        assertEquals("DOWNLOAD", first.getRecentFailure().getAction());
        assertEquals("OSS timeout", first.getRecentFailure().getRemark());

        YyPhotoAlbumOperationsSummaryVo second = result.get(1);
        assertEquals(2L, second.getAlbumId());
        assertEquals(1L, second.getTotalAssets());
        assertEquals(1L, second.getVisibleAssets());
        assertEquals(0L, second.getSelectedAssets());
        assertEquals(0L, second.getMissingObjectKeyAssets());
        assertNull(second.getRecentFailure());

        YyPhotoAlbumOperationsSummaryVo third = result.get(2);
        assertEquals(3L, third.getAlbumId());
        assertEquals(0L, third.getTotalAssets());
        assertEquals(0L, third.getVisibleAssets());
        assertEquals(0L, third.getSelectedAssets());
        assertEquals(0L, third.getMissingObjectKeyAssets());
        assertNull(third.getRecentFailure());

        verify(assetMapper).selectList(any(Wrapper.class));
        verify(accessLogMapper).selectList(any(Wrapper.class));
    }

    @Test
    void upsertPlaceholderForOrderShouldCreateStablePickupAlbum() {
        YyPhotoAlbumServiceImpl service = new YyPhotoAlbumServiceImpl(albumMapper, assetMapper, accessLogMapper, notificationLogMapper);
        when(albumMapper.selectOne(any(Wrapper.class))).thenReturn(null);
        YyOrder order = order(900001L, 7407304729216157722L, "DOUYIN_LIFE", "1095598420357785988", "王同学", "13800000000");

        YyPhotoAlbumVo result = service.upsertPlaceholderForOrder(order, order.getSource(), order.getExternalOrderId(), "book-1", "code-1");

        assertEquals(900001L, result.getOrderId());
        assertEquals("DOUYIN_LIFE", result.getChannelType());
        assertEquals("1095598420357785988", result.getDouyinOrderId());
        assertEquals("book-1", result.getBookId());
        assertEquals("code-1", result.getCertificateCode());
        assertEquals("ACTIVE", result.getStatus());
        assertEquals("WAITING", result.getSelectionStatus());
        assertTrue(result.getAccessCode().startsWith("PICK-"));
        verify(albumMapper).insert(any(YyPhotoAlbum.class));
        verify(albumMapper, never()).updateById(any(YyPhotoAlbum.class));
    }

    @Test
    void upsertPlaceholderForOrderShouldRepairExistingAlbumWithoutDuplicateInsert() {
        YyPhotoAlbumServiceImpl service = new YyPhotoAlbumServiceImpl(albumMapper, assetMapper, accessLogMapper, notificationLogMapper);
        YyPhotoAlbum existing = new YyPhotoAlbum();
        existing.setId(700001L);
        existing.setOrderId(900001L);
        existing.setChannelType("DOUYIN_LIFE");
        existing.setDouyinOrderId("1095598420357785988");
        existing.setAccessCode("PICK-OLD");
        when(albumMapper.selectOne(any(Wrapper.class))).thenReturn(existing);
        YyOrder order = order(900001L, 7407304729216157722L, "DOUYIN_LIFE", "1095598420357785988", "王同学", "13800000000");

        YyPhotoAlbumVo result = service.upsertPlaceholderForOrder(order, order.getSource(), order.getExternalOrderId(), "", "");

        assertEquals(700001L, result.getId());
        assertEquals("PICK-OLD", result.getAccessCode());
        assertEquals("王同学", result.getCustomerName());
        assertEquals("13800000000", result.getCustomerPhone());
        verify(albumMapper, never()).insert(any(YyPhotoAlbum.class));
        verify(albumMapper).updateById(any(YyPhotoAlbum.class));
    }

    @Test
    void confirmSelectionShouldPromoteSubmittedAlbumToConfirmed() {
        YyPhotoAlbumServiceImpl service = new YyPhotoAlbumServiceImpl(albumMapper, assetMapper, accessLogMapper, notificationLogMapper);
        YyPhotoAlbum album = album(1001L, "ACTIVE", "SUBMITTED");
        when(albumMapper.selectById(1001L)).thenReturn(album);

        YyPhotoAlbumActionResultVo result = service.confirmSelection(1001L, action("门店复核通过", null, null));

        assertEquals(1001L, result.getAlbumId());
        assertEquals("SELECTION_CONFIRM", result.getAction());
        assertEquals("CONFIRMED", result.getSelectionStatus());
        assertEquals("ACTIVE", result.getStatus());
        assertEquals("SUCCESS", result.getAuditStatus());
        assertTrue(result.getMessage().contains("客片确认"));
        assertEquals("CONFIRMED", album.getSelectionStatus());
        verify(albumMapper).updateById(album);
        verify(notificationLogMapper, never()).insert(any(YyNotificationLog.class));
    }

    @Test
    void deliverAlbumShouldRequireDeliverableVisibleAssets() {
        YyPhotoAlbumServiceImpl service = new YyPhotoAlbumServiceImpl(albumMapper, assetMapper, accessLogMapper, notificationLogMapper);
        YyPhotoAlbum album = album(1002L, "ACTIVE", "CONFIRMED");
        when(albumMapper.selectById(1002L)).thenReturn(album);
        when(assetMapper.selectList(any(Wrapper.class))).thenReturn(List.of(
            asset(201L, 1002L, "1", "1", ""),
            asset(202L, 1002L, "0", "1", "photos/202.jpg")
        ));

        assertThrows(org.dromara.common.core.exception.ServiceException.class,
            () -> service.deliverAlbum(1002L, action("准备交付", null, null)));

        verify(albumMapper, never()).updateById(any(YyPhotoAlbum.class));
    }

    @Test
    void deliverAlbumShouldMarkAlbumDeliveredAfterConfirmation() {
        YyPhotoAlbumServiceImpl service = new YyPhotoAlbumServiceImpl(albumMapper, assetMapper, accessLogMapper, notificationLogMapper);
        YyPhotoAlbum album = album(1003L, "ACTIVE", "CONFIRMED");
        when(albumMapper.selectById(1003L)).thenReturn(album);
        when(assetMapper.selectList(any(Wrapper.class))).thenReturn(List.of(
            asset(301L, 1003L, "1", "1", "photos/301.jpg"),
            asset(302L, 1003L, "1", "0", "photos/302.jpg")
        ));

        YyPhotoAlbumActionResultVo result = service.deliverAlbum(1003L, action("原片已发云盘", null, null));

        assertEquals("DELIVER", result.getAction());
        assertEquals("DELIVERED", result.getStatus());
        assertEquals("DELIVERED", result.getSelectionStatus());
        assertEquals("SUCCESS", result.getAuditStatus());
        assertEquals("DELIVERED", album.getStatus());
        assertEquals("DELIVERED", album.getSelectionStatus());
        verify(albumMapper).updateById(album);
    }

    @Test
    void notifyAlbumShouldRecordFallbackAuditWhenChannelNotIntegrated() {
        YyPhotoAlbumServiceImpl service = new YyPhotoAlbumServiceImpl(albumMapper, assetMapper, accessLogMapper, notificationLogMapper);
        YyPhotoAlbum album = album(1004L, "DELIVERED", "DELIVERED");
        album.setCustomerPhone("13800000000");
        when(albumMapper.selectById(1004L)).thenReturn(album);

        YyPhotoAlbumActionResultVo result = service.notifyAlbum(1004L, action("请客户查收", "SMS", "13800000000"));

        assertEquals("NOTIFY", result.getAction());
        assertEquals("FALLBACK_LOGGED", result.getAuditStatus());
        assertTrue(result.getFallback());
        assertEquals("SMS", result.getNotificationChannel());
        assertEquals("FALLBACK", result.getNotificationSendStatus());
        assertTrue(result.getMessage().contains("未接入"));
        verify(notificationLogMapper).insert(any(YyNotificationLog.class));
        verify(albumMapper, never()).updateById(any(YyPhotoAlbum.class));
    }

    private static YyPhotoAsset asset(Long id, Long albumId, String visible, String selected, String objectKey) {
        YyPhotoAsset asset = new YyPhotoAsset();
        asset.setId(id);
        asset.setAlbumId(albumId);
        asset.setVisible(visible);
        asset.setIsSelected(selected);
        asset.setObjectKey(objectKey);
        return asset;
    }

    private static YyPhotoAlbum album(Long id, String status, String selectionStatus) {
        YyPhotoAlbum album = new YyPhotoAlbum();
        album.setId(id);
        album.setStoreId(7407304729216157722L);
        album.setOrderId(900001L);
        album.setAlbumName("证件照交付");
        album.setCustomerName("王同学");
        album.setCustomerPhone("13800000000");
        album.setStatus(status);
        album.setSelectionStatus(selectionStatus);
        return album;
    }

    private static YyPhotoAlbumActionBo action(String remark, String channelType, String receiver) {
        YyPhotoAlbumActionBo action = new YyPhotoAlbumActionBo();
        action.setRemark(remark);
        action.setChannelType(channelType);
        action.setReceiver(receiver);
        return action;
    }

    private static YyOrder order(Long id, Long storeId, String source, String externalOrderId, String customerName, String customerPhone) {
        YyOrder order = new YyOrder();
        order.setId(id);
        order.setStoreId(storeId);
        order.setSource(source);
        order.setExternalOrderId(externalOrderId);
        order.setCustomerName(customerName);
        order.setCustomerPhone(customerPhone);
        return order;
    }

    private static YyPhotoAccessLog failedLog(Long id, Long albumId, String action, String remark, Date createTime) {
        YyPhotoAccessLog log = new YyPhotoAccessLog();
        log.setId(id);
        log.setAlbumId(albumId);
        log.setAction(action);
        log.setSuccess("0");
        log.setRemark(remark);
        log.setCreateTime(createTime);
        return log;
    }

    private static void assertContainsAny(String actual, String... expectedItems) {
        for (String expected : expectedItems) {
            if (actual.contains(expected)) {
                return;
            }
        }
        throw new AssertionError("Expected SQL segment to contain any of " + List.of(expectedItems) + ", actual: " + actual);
    }
}
