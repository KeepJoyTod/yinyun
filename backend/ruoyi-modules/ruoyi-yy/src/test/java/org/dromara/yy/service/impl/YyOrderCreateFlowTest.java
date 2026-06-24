package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyPhotoAlbum;
import org.dromara.yy.domain.bo.ClientBookingIntentRequest;
import org.dromara.yy.domain.bo.YyOrderBo;
import org.dromara.yy.domain.bo.YyStaffBookingCreateBo;
import org.dromara.yy.domain.vo.ClientBookingIntentVo;
import org.dromara.yy.domain.vo.YyOrderVo;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class YyOrderCreateFlowTest extends YyOrderServiceImplTestSupport {

    @Tag("dev")
    @Test
    void insertByBoShouldPersistOrderAndSyncCustomerByMobile() {
        Date orderTime = new Date(1780243200000L);
        YyOrderBo bo = new YyOrderBo();
        bo.setStoreId(7407304729216157722L);
        bo.setOrderNo("YY202606020001");
        bo.setCustomerName("手工客户");
        bo.setCustomerPhone("138****0000");
        bo.setSource("LOCAL");
        bo.setOrderTime(orderTime);
        when(orderMapper.insert(any(YyOrder.class))).thenAnswer(invocation -> {
            YyOrder entity = invocation.getArgument(0);
            entity.setId(910000000000000001L);
            return 1;
        });

        assertTrue(service.insertByBo(bo));

        verify(customerService).upsertByMobile(
            eq("手工客户"),
            eq("138****0000"),
            eq("LOCAL"),
            eq(BigDecimal.ZERO),
            eq(orderTime),
            eq("预约订单新增自动沉淀")
        );
    }

    @Tag("dev")
    @Test
    void createStaffBookingShouldInsertLocalOrderAndReserveInventory() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyPhotoAlbum.class);
        Date arrivalTime = new Date(1781377200000L);
        YyStaffBookingCreateBo bo = new YyStaffBookingCreateBo();
        bo.setStoreId(900000000000000100L);
        bo.setServiceGroupId(900000000000010100L);
        bo.setCustomerName("手动预约客户");
        bo.setCustomerPhone("138****0000");
        bo.setArrivalTime(arrivalTime);
        bo.setSlotDate("2026-06-13");
        bo.setSlotStartTime("11:00");
        bo.setSlotEndTime("11:30");
        bo.setStatus("PENDING");
        bo.setPayStatus("UNPAID");
        bo.setRemark("前台电话预约");
        when(orderMapper.insert(any(YyOrder.class))).thenAnswer(invocation -> {
            YyOrder entity = invocation.getArgument(0);
            entity.setId(930000000000000001L);
            return 1;
        });
        when(orderMapper.selectVoById(any())).thenAnswer(invocation -> {
            Long id = invocation.getArgument(0);
            YyOrderVo created = new YyOrderVo();
            created.setId(id);
            created.setOrderNo("YY-STAFF-" + id);
            created.setStatus("PENDING");
            created.setPayStatus("UNPAID");
            created.setSlotDate("2026-06-13");
            created.setSlotStartTime("11:00");
            created.setSlotEndTime("11:30");
            return created;
        });
        when(photoAlbumMapper.selectList(any())).thenReturn(List.of());

        YyOrderVo result = service.createStaffBooking(bo);

        assertTrue(result.getOrderNo().startsWith("YY-STAFF-"));
        assertEquals("PENDING", result.getStatus());
        assertEquals("UNPAID", result.getPayStatus());
        ArgumentCaptor<YyOrder> captor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).insert(captor.capture());
        YyOrder inserted = captor.getValue();
        assertEquals("LOCAL", inserted.getSource());
        assertEquals("LOCAL", inserted.getChannelType());
        assertEquals("STAFF_MANUAL", inserted.getBookingMethod());
        assertEquals(arrivalTime, inserted.getArrivalTime());
        assertEquals("2026-06-13", inserted.getSlotDate());
        assertEquals("11:00", inserted.getSlotStartTime());
        assertEquals("11:30", inserted.getSlotEndTime());
        verify(bookingSlotInventoryService).confirmPaidOrderSlot(inserted);
        verify(customerService).upsertByMobile(
            eq("手动预约客户"),
            eq("138****0000"),
            eq("LOCAL"),
            eq(BigDecimal.ZERO),
            any(Date.class),
            eq("预约订单新增自动沉淀")
        );
    }

    @Tag("dev")
    @Test
    void createStaffBookingShouldAllowUndecidedScheduleWithoutInventoryReservation() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyPhotoAlbum.class);
        YyStaffBookingCreateBo bo = new YyStaffBookingCreateBo();
        bo.setStoreId(900000000000000100L);
        bo.setServiceGroupId(900000000000010100L);
        bo.setCustomerName("待定档期客户");
        bo.setCustomerPhone("138****0001");
        bo.setArrivalTime(new Date(1781377200000L));
        bo.setScheduleMode("UNDECIDED");
        bo.setSlotDate("");
        bo.setSlotStartTime("");
        bo.setSlotEndTime("");
        bo.setStatus("PENDING");
        bo.setPayStatus("UNPAID");
        when(orderMapper.insert(any(YyOrder.class))).thenAnswer(invocation -> {
            YyOrder entity = invocation.getArgument(0);
            entity.setId(930000000000000002L);
            return 1;
        });
        when(orderMapper.selectVoById(any())).thenAnswer(invocation -> {
            Long id = invocation.getArgument(0);
            YyOrderVo created = new YyOrderVo();
            created.setId(id);
            created.setOrderNo("YY-STAFF-" + id);
            created.setStatus("PENDING");
            created.setPayStatus("UNPAID");
            return created;
        });
        when(photoAlbumMapper.selectList(any())).thenReturn(List.of());

        service.createStaffBooking(bo);

        ArgumentCaptor<YyOrder> captor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).insert(captor.capture());
        assertNull(captor.getValue().getSlotDate());
        assertNull(captor.getValue().getSlotStartTime());
        assertNull(captor.getValue().getSlotEndTime());
        verify(bookingSlotInventoryService, never()).confirmPaidOrderSlot(any(YyOrder.class));
    }

    @Tag("dev")
    @Test
    void createStaffBookingShouldCreateServingOrderForSaveAndReceive() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyPhotoAlbum.class);
        YyStaffBookingCreateBo bo = new YyStaffBookingCreateBo();
        bo.setStoreId(900000000000000100L);
        bo.setServiceGroupId(900000000000010100L);
        bo.setCustomerName("立即接待客户");
        bo.setCustomerPhone("138****0002");
        bo.setArrivalTime(new Date(1781377200000L));
        bo.setScheduleMode("SCHEDULED");
        bo.setSubmitMode("SAVE_AND_RECEIVE");
        bo.setSlotDate("2026-06-13");
        bo.setSlotStartTime("12:00");
        bo.setSlotEndTime("12:30");
        bo.setStatus("PENDING");
        bo.setPayStatus("UNPAID");
        when(orderMapper.insert(any(YyOrder.class))).thenAnswer(invocation -> {
            YyOrder entity = invocation.getArgument(0);
            entity.setId(930000000000000003L);
            return 1;
        });
        when(orderMapper.selectVoById(any())).thenAnswer(invocation -> {
            Long id = invocation.getArgument(0);
            YyOrderVo created = new YyOrderVo();
            created.setId(id);
            created.setOrderNo("YY-STAFF-" + id);
            created.setStatus("SERVING");
            created.setPayStatus("UNPAID");
            return created;
        });
        when(photoAlbumMapper.selectList(any())).thenReturn(List.of());

        service.createStaffBooking(bo);

        ArgumentCaptor<YyOrder> captor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).insert(captor.capture());
        assertEquals("SERVING", captor.getValue().getStatus());
        verify(bookingSlotInventoryService).confirmPaidOrderSlot(captor.getValue());
    }

    @Tag("dev")
    @Test
    void createClientBookingIntentShouldPersistPublicWebOrder() {
        configureClientBookingDefaults();
        ClientBookingIntentRequest request = new ClientBookingIntentRequest();
        request.setName(" 陈女士 ");
        request.setPhone("138 0000 0000");
        request.setService("证件照精修套餐");
        request.setArrivalTime(new Date(1781234400000L));
        when(orderMapper.insert(any(YyOrder.class))).thenAnswer(invocation -> {
            YyOrder entity = invocation.getArgument(0);
            entity.setId(920000000000000001L);
            return 1;
        });

        ClientBookingIntentVo result = service.createClientBookingIntent(request, "127.0.0.1");

        assertTrue(result.getOrderNo().startsWith("YYWEB-"));
        assertEquals("PENDING", result.getStatus());
        assertEquals("138****0000", result.getCustomerPhoneMasked());
        assertEquals(new Date(1781234400000L), result.getArrivalTime());
        ArgumentCaptor<YyOrder> captor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).insert(captor.capture());
        YyOrder order = captor.getValue();
        assertEquals("000000", order.getTenantId());
        assertEquals(900001L, order.getStoreId());
        assertEquals("陈女士", order.getCustomerName());
        assertEquals("138****0000", order.getCustomerPhone());
        assertEquals("CLIENT_WEB", order.getSource());
        assertEquals("WEB_INTENT", order.getBookingMethod());
        assertEquals("PENDING", order.getStatus());
        assertTrue(order.getRemark().contains("证件照精修套餐"));
        assertTrue(order.getRemark().contains("127.0.0.1"));
        verify(customerService).upsertByMobile(
            eq("陈女士"),
            eq("138****0000"),
            eq("CLIENT_WEB"),
            eq(BigDecimal.ZERO),
            any(Date.class),
            eq("预约订单新增自动沉淀")
        );
    }

    @Tag("dev")
    @Test
    void createClientBookingIntentShouldRejectBadPhone() {
        configureClientBookingDefaults();
        ClientBookingIntentRequest request = new ClientBookingIntentRequest();
        request.setName("陈女士");
        request.setPhone("123");
        request.setService("证件照精修套餐");

        assertThrows(org.dromara.common.core.exception.ServiceException.class,
            () -> service.createClientBookingIntent(request, "127.0.0.1"));
    }

    @Tag("dev")
    @Test
    void createClientBookingIntentShouldTrimAndLimitPublicInput() {
        configureClientBookingDefaults();
        ClientBookingIntentRequest request = new ClientBookingIntentRequest();
        request.setName(" 陈女士".repeat(20));
        request.setPhone("138****0000");
        request.setService("证件照精修套餐".repeat(30));
        when(orderMapper.insert(any(YyOrder.class))).thenAnswer(invocation -> {
            YyOrder entity = invocation.getArgument(0);
            entity.setId(920000000000000002L);
            return 1;
        });

        service.createClientBookingIntent(request, "127.0.0.1, 10.0.0.1");

        ArgumentCaptor<YyOrder> captor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).insert(captor.capture());
        YyOrder order = captor.getValue();
        assertTrue(order.getCustomerName().length() <= 64);
        assertTrue(order.getRemark().length() <= 500);
        assertTrue(order.getRemark().contains("127.0.0.1"));
    }

}
