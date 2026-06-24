package org.dromara.yy.service.impl;

import org.dromara.yy.domain.YyEmployee;
import org.dromara.yy.domain.YyEmployeeStore;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyPhotoAsset;
import org.dromara.yy.mapper.YyChannelOrderMappingMapper;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.mapper.YyPhotoAlbumMapper;
import org.dromara.yy.mapper.YyPhotoAssetMapper;
import org.dromara.yy.service.IYyBookingSlotInventoryService;
import org.dromara.yy.service.IYyCustomerService;
import org.dromara.yy.service.IYyPhotoAlbumService;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

abstract class YyOrderServiceImplTestSupport {

    @Mock
    protected YyOrderMapper orderMapper;

    @Mock
    protected YyChannelOrderMappingMapper channelOrderMappingMapper;

    @Mock
    protected YyPhotoAlbumMapper photoAlbumMapper;

    @Mock
    protected YyPhotoAssetMapper photoAssetMapper;

    @Mock
    protected YyEmployeeMapper employeeMapper;

    @Mock
    protected YyEmployeeStoreMapper employeeStoreMapper;

    @Mock
    protected IYyCustomerService customerService;

    @Mock
    protected IYyPhotoAlbumService photoAlbumService;

    @Mock
    protected IYyBookingSlotInventoryService bookingSlotInventoryService;

    @InjectMocks
    protected YyOrderServiceImpl service;

    protected void configureClientBookingDefaults() {
        ReflectionTestUtils.setField(service, "clientBookingDefaultTenantId", "000000");
        ReflectionTestUtils.setField(service, "clientBookingDefaultStoreId", 900001L);
    }

    protected static YyPhotoAsset asset(Long id, Long albumId, String visible, String objectKey) {
        YyPhotoAsset asset = new YyPhotoAsset();
        asset.setId(id);
        asset.setAlbumId(albumId);
        asset.setVisible(visible);
        asset.setObjectKey(objectKey);
        return asset;
    }

    protected static YyEmployee employee(Long id, Long userId, Long storeId) {
        YyEmployee employee = new YyEmployee();
        employee.setId(id);
        employee.setUserId(userId);
        employee.setStoreId(storeId);
        employee.setStatus("0");
        return employee;
    }

    protected static YyEmployeeStore employeeStore(Long employeeId, Long storeId) {
        YyEmployeeStore employeeStore = new YyEmployeeStore();
        employeeStore.setId(storeId + 10L);
        employeeStore.setEmployeeId(employeeId);
        employeeStore.setStoreId(storeId);
        employeeStore.setDelFlag("0");
        return employeeStore;
    }

    protected static YyOrder paidOrderWithSlot() {
        YyOrder order = new YyOrder();
        order.setId(990001L);
        order.setTenantId("000000");
        order.setStoreId(900001L);
        order.setOrderNo("YY-PAID-001");
        order.setSource("DOUYIN_LIFE");
        order.setChannelType("DOUYIN_LIFE");
        order.setStatus("CONFIRMED");
        order.setPayStatus("PAID");
        order.setTotalAmountCent(100L);
        order.setPaidAmountCent(100L);
        order.setRefundStatus("");
        order.setRefundAmountCent(0L);
        order.setServiceGroupId(700001L);
        order.setInventorySlotId(880001L);
        order.setSlotDate("2026-06-12");
        order.setSlotStartTime("10:00");
        order.setSlotEndTime("10:30");
        order.setInventoryStatus("CONFIRMED");
        return order;
    }

    protected static YyOrder staffManualOrderWithSlot() {
        YyOrder order = new YyOrder();
        order.setId(990003L);
        order.setTenantId("000000");
        order.setStoreId(900001L);
        order.setOrderNo("YY-STAFF-990003");
        order.setSource("LOCAL");
        order.setChannelType("LOCAL");
        order.setBookingMethod("STAFF_MANUAL");
        order.setStatus("PENDING");
        order.setPayStatus("UNPAID");
        order.setTotalAmountCent(0L);
        order.setPaidAmountCent(0L);
        order.setRefundStatus("");
        order.setRefundAmountCent(0L);
        order.setServiceGroupId(700001L);
        order.setInventorySlotId(880003L);
        order.setSlotDate("2026-06-13");
        order.setSlotStartTime("10:00");
        order.setSlotEndTime("10:30");
        order.setInventoryStatus("CONFIRMED");
        return order;
    }

    protected static void assertContainsAny(String actual, String... expectedItems) {
        for (String expected : expectedItems) {
            if (actual.contains(expected)) {
                return;
            }
        }
        assertTrue(false, () -> "SQL segment should contain one of " + List.of(expectedItems) + ", actual: " + actual);
    }
}
