package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyPhotoAlbum;
import org.dromara.yy.domain.bo.YyOrderBo;
import org.dromara.yy.domain.vo.YyOrderVo;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;

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
class YyOrderLifecycleInventoryTest extends YyOrderServiceImplTestSupport {

    @Tag("dev")
    @Test
    void updateByBoShouldPreserveExistingPaymentFieldsWhenFormOmitsPaymentSummary() {
        YyOrder existing = paidOrderWithSlot();
        when(orderMapper.selectById(990001L)).thenReturn(existing);
        when(orderMapper.updateById(any(YyOrder.class))).thenReturn(1);

        YyOrderBo bo = new YyOrderBo();
        bo.setId(990001L);
        bo.setStoreId(900001L);
        bo.setOrderNo("YY-PAID-001");
        bo.setSource("DOUYIN_LIFE");
        bo.setStatus("CONFIRMED");

        assertTrue(service.updateByBo(bo));

        ArgumentCaptor<YyOrder> captor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).updateById(captor.capture());
        assertEquals("PAID", captor.getValue().getPayStatus());
        assertEquals(100L, captor.getValue().getPaidAmountCent());
        assertEquals("DOUYIN_LIFE", captor.getValue().getChannelType());
    }

    @Tag("dev")
    @Test
    void updateByBoShouldReleaseOldConfirmedSlotAndConfirmNewPaidSlotWhenRescheduled() {
        YyOrder existing = paidOrderWithSlot();
        existing.setInventoryStatus("CONFIRMED");
        when(orderMapper.selectById(990001L)).thenReturn(existing);
        when(orderMapper.updateById(any(YyOrder.class))).thenReturn(1);

        YyOrderBo bo = new YyOrderBo();
        bo.setId(990001L);
        bo.setStoreId(900001L);
        bo.setOrderNo("YY-PAID-001");
        bo.setSource("DOUYIN_LIFE");
        bo.setStatus("CONFIRMED");
        bo.setServiceGroupId(700001L);
        bo.setSlotDate("2026-06-13");
        bo.setSlotStartTime("11:00");
        bo.setSlotEndTime("11:30");

        assertTrue(service.updateByBo(bo));

        verify(bookingSlotInventoryService).releaseConfirmedOrderSlot(existing);
        verify(bookingSlotInventoryService).confirmPaidOrderSlot(any(YyOrder.class));
    }

    @Tag("dev")
    @Test
    void updateByBoShouldReserveNewSlotWhenUnpaidStaffBookingIsRescheduled() {
        YyOrder existing = staffManualOrderWithSlot();
        when(orderMapper.selectById(990003L)).thenReturn(existing);
        when(orderMapper.updateById(any(YyOrder.class))).thenReturn(1);

        YyOrderBo bo = new YyOrderBo();
        bo.setId(990003L);
        bo.setStoreId(900001L);
        bo.setOrderNo("YY-STAFF-990003");
        bo.setSource("LOCAL");
        bo.setStatus("PENDING");
        bo.setServiceGroupId(700001L);
        bo.setSlotDate("2026-06-13");
        bo.setSlotStartTime("10:30");
        bo.setSlotEndTime("11:00");

        assertTrue(service.updateByBo(bo));

        verify(bookingSlotInventoryService).releaseConfirmedOrderSlot(existing);
        verify(bookingSlotInventoryService).confirmPaidOrderSlot(any(YyOrder.class));
    }

    @Tag("dev")
    @Test
    void updateByBoShouldRejectPaidRescheduleWithoutCompleteSlot() {
        YyOrder existing = paidOrderWithSlot();
        when(orderMapper.selectById(990001L)).thenReturn(existing);

        YyOrderBo bo = new YyOrderBo();
        bo.setId(990001L);
        bo.setStoreId(900001L);
        bo.setOrderNo("YY-PAID-001");
        bo.setSource("DOUYIN_LIFE");
        bo.setStatus("CONFIRMED");
        bo.setSlotDate("2026-06-13");
        bo.setSlotStartTime("");
        bo.setSlotEndTime("");

        assertThrows(org.dromara.common.core.exception.ServiceException.class, () -> service.updateByBo(bo));
        verify(orderMapper, never()).updateById(any(YyOrder.class));
        verify(bookingSlotInventoryService, never()).releaseConfirmedOrderSlot(any(YyOrder.class));
        verify(bookingSlotInventoryService, never()).confirmPaidOrderSlot(any(YyOrder.class));
    }

    @Tag("dev")
    @Test
    void updateByBoShouldKeepHistoricalDouyinLifeOrderWithoutSlotOutOfInventoryMatching() {
        YyOrder existing = new YyOrder();
        existing.setId(990002L);
        existing.setTenantId("000000");
        existing.setStoreId(900001L);
        existing.setOrderNo("DYL-HISTORY-001");
        existing.setSource("DOUYIN_LIFE");
        existing.setChannelType("DOUYIN_LIFE");
        existing.setExternalOrderId("1095291724056029999");
        existing.setStatus("CONFIRMED");
        existing.setPayStatus("PAID");
        existing.setPaidTime(new Date(1781234400000L));
        existing.setCustomerName("历史订单客户");
        existing.setCustomerPhone("138****0009");
        when(orderMapper.selectById(990002L)).thenReturn(existing);
        when(orderMapper.updateById(any(YyOrder.class))).thenReturn(1);

        YyOrderBo bo = new YyOrderBo();
        bo.setId(990002L);
        bo.setStoreId(900001L);
        bo.setOrderNo("DYL-HISTORY-001");
        bo.setSource("DOUYIN_LIFE");
        bo.setStatus("CONFIRMED");
        bo.setRemark("补充备注，不改历史时段");

        assertTrue(service.updateByBo(bo));

        ArgumentCaptor<YyOrder> captor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).updateById(captor.capture());
        assertNull(captor.getValue().getSlotDate());
        assertNull(captor.getValue().getSlotStartTime());
        assertNull(captor.getValue().getSlotEndTime());
        verify(bookingSlotInventoryService, never()).releaseConfirmedOrderSlot(any(YyOrder.class));
        verify(bookingSlotInventoryService, never()).confirmPaidOrderSlot(any(YyOrder.class));
    }

    @Tag("dev")
    @Test
    void transitionStatusShouldAdvanceWithExpectedStatusGuard() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyPhotoAlbum.class);
        YyOrder existing = paidOrderWithSlot();
        existing.setStatus("PENDING");
        when(orderMapper.selectById(990001L)).thenReturn(existing);
        when(orderMapper.updateById(any(YyOrder.class))).thenReturn(1);
        YyOrderVo updated = new YyOrderVo();
        updated.setId(990001L);
        updated.setStatus("CONFIRMED");
        when(orderMapper.selectVoById(990001L)).thenReturn(updated);
        when(photoAlbumMapper.selectList(any())).thenReturn(List.of());

        YyOrderVo result = service.transitionStatus(990001L, "PENDING", "CONFIRMED", "前台已确认");

        assertEquals("CONFIRMED", result.getStatus());
        ArgumentCaptor<YyOrder> captor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).updateById(captor.capture());
        assertEquals(990001L, captor.getValue().getId());
        assertEquals("CONFIRMED", captor.getValue().getStatus());
        assertEquals("前台已确认", captor.getValue().getRemark());
    }

    @Tag("dev")
    @Test
    void transitionStatusShouldSupportJianyueArrivalAndServingChain() {
        YyOrder existing = paidOrderWithSlot();
        existing.setStatus("CONFIRMED");
        when(orderMapper.selectById(990001L)).thenReturn(existing);
        when(orderMapper.updateById(any(YyOrder.class))).thenReturn(1);
        YyOrderVo updated = new YyOrderVo();
        updated.setId(990001L);
        updated.setStatus("ARRIVED");
        when(orderMapper.selectVoById(990001L)).thenReturn(updated);
        when(photoAlbumMapper.selectList(any())).thenReturn(List.of());

        YyOrderVo result = service.transitionStatus(990001L, "CONFIRMED", "ARRIVED", "客户已到店");

        assertEquals("ARRIVED", result.getStatus());
        ArgumentCaptor<YyOrder> captor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).updateById(captor.capture());
        assertEquals("ARRIVED", captor.getValue().getStatus());
        assertEquals("客户已到店", captor.getValue().getRemark());
    }

    @Tag("dev")
    @Test
    void transitionStatusShouldReleaseInventoryWhenCancelled() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyPhotoAlbum.class);
        YyOrder existing = staffManualOrderWithSlot();
        when(orderMapper.selectById(990003L)).thenReturn(existing);
        when(orderMapper.updateById(any(YyOrder.class))).thenReturn(1);
        YyOrderVo updated = new YyOrderVo();
        updated.setId(990003L);
        updated.setStatus("CANCELLED");
        when(orderMapper.selectVoById(990003L)).thenReturn(updated);
        when(photoAlbumMapper.selectList(any())).thenReturn(List.of());

        YyOrderVo result = service.transitionStatus(990003L, "PENDING", "CANCELLED", "客户主动取消");

        assertEquals("CANCELLED", result.getStatus());
        verify(bookingSlotInventoryService).releaseConfirmedOrderSlot(existing);
    }

    @Tag("dev")
    @Test
    void transitionStatusShouldRejectStaleExpectedStatus() {
        YyOrder existing = paidOrderWithSlot();
        existing.setStatus("CONFIRMED");
        when(orderMapper.selectById(990001L)).thenReturn(existing);

        assertThrows(org.dromara.common.core.exception.ServiceException.class,
            () -> service.transitionStatus(990001L, "PENDING", "SERVING", ""));

        verify(orderMapper, never()).updateById(any(YyOrder.class));
    }

    @Tag("dev")
    @Test
    void transitionStatusShouldRejectInvalidStateJump() {
        YyOrder existing = paidOrderWithSlot();
        existing.setStatus("PENDING");
        when(orderMapper.selectById(990001L)).thenReturn(existing);

        assertThrows(org.dromara.common.core.exception.ServiceException.class,
            () -> service.transitionStatus(990001L, "PENDING", "COMPLETED", ""));

        verify(orderMapper, never()).updateById(any(YyOrder.class));
    }

    @Tag("dev")
    @Test
    void rescheduleShouldUseUpdateFlowAndInventoryGuardForPaidOrder() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyPhotoAlbum.class);
        YyOrder existing = paidOrderWithSlot();
        when(orderMapper.selectById(990001L)).thenReturn(existing);
        when(orderMapper.updateById(any(YyOrder.class))).thenReturn(1);
        YyOrderVo updated = new YyOrderVo();
        updated.setId(990001L);
        updated.setArrivalTime(new Date(1781377200000L));
        when(orderMapper.selectVoById(990001L)).thenReturn(updated);
        when(photoAlbumMapper.selectList(any())).thenReturn(List.of());

        YyOrderVo result = service.reschedule(
            990001L,
            "CONFIRMED",
            new Date(1781377200000L),
            700001L,
            "2026-06-13",
            "11:00",
            "11:30",
            "改到周六上午"
        );

        assertEquals(new Date(1781377200000L), result.getArrivalTime());
        verify(bookingSlotInventoryService).releaseConfirmedOrderSlot(existing);
        verify(bookingSlotInventoryService).confirmPaidOrderSlot(any(YyOrder.class));
    }

}
