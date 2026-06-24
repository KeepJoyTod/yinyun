package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyEmployee;
import org.dromara.yy.domain.YyEmployeeStore;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyChannelOrderMapping;
import org.dromara.yy.domain.YyPhotoAlbum;
import org.dromara.yy.domain.YyPhotoAsset;
import org.dromara.yy.domain.bo.ClientBookingIntentRequest;
import org.dromara.yy.domain.bo.YyOrderBo;
import org.dromara.yy.domain.bo.YyStaffBookingCreateBo;
import org.dromara.yy.domain.vo.ClientBookingIntentVo;
import org.dromara.yy.domain.vo.ClientOrderLinkVo;
import org.dromara.yy.domain.vo.ClientOrderTokenVo;
import org.dromara.yy.domain.vo.YyMobileOrderVo;
import org.dromara.yy.domain.vo.YyOrderVo;
import org.dromara.yy.domain.vo.YyPhotoAlbumVo;
import org.dromara.yy.mapper.YyChannelOrderMappingMapper;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.mapper.YyPhotoAlbumMapper;
import org.dromara.yy.mapper.YyPhotoAssetMapper;
import org.dromara.yy.service.IYyCustomerService;
import org.dromara.yy.service.IYyBookingSlotInventoryService;
import org.dromara.yy.service.IYyPhotoAlbumService;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class YyOrderServiceImplTest {

    @Mock
    private YyOrderMapper orderMapper;

    @Mock
    private YyChannelOrderMappingMapper channelOrderMappingMapper;

    @Mock
    private YyPhotoAlbumMapper photoAlbumMapper;

    @Mock
    private YyPhotoAssetMapper photoAssetMapper;

    @Mock
    private YyEmployeeMapper employeeMapper;

    @Mock
    private YyEmployeeStoreMapper employeeStoreMapper;

    @Mock
    private IYyCustomerService customerService;

    @Mock
    private IYyPhotoAlbumService photoAlbumService;

    @Mock
    private IYyBookingSlotInventoryService bookingSlotInventoryService;

    @InjectMocks
    private YyOrderServiceImpl service;

    private void configureClientBookingDefaults() {
        ReflectionTestUtils.setField(service, "clientBookingDefaultTenantId", "000000");
        ReflectionTestUtils.setField(service, "clientBookingDefaultStoreId", 900001L);
    }

    @Tag("dev")
    @Test
    void insertByBoShouldPersistOrderAndSyncCustomerByMobile() {
        Date orderTime = new Date(1780243200000L);
        YyOrderBo bo = new YyOrderBo();
        bo.setStoreId(7407304729216157722L);
        bo.setOrderNo("YY202606020001");
        bo.setCustomerName("手工客户");
        bo.setCustomerPhone("13800000000");
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
            eq("13800000000"),
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
        bo.setCustomerPhone("13800000000");
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
            eq("13800000000"),
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
        bo.setCustomerPhone("13800000001");
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
        bo.setCustomerPhone("13800000002");
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
        request.setPhone("13800000000");
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

    @Tag("dev")
    @Test
    void queryListShouldBuildKeywordAndTimeFilters() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyOrder.class);

        YyOrderBo bo = new YyOrderBo();
        bo.setKeyword("138");
        bo.setBeginOrderTime(new java.util.Date(1748707200000L));
        bo.setEndArrivalTime(new java.util.Date(1748880000000L));

        when(orderMapper.selectVoList(any())).thenReturn(List.of());

        service.queryList(bo);

        ArgumentCaptor<Wrapper<YyOrder>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(orderMapper).selectVoList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();

        assertContainsAny(sqlSegment, "order_no", "orderNo");
        assertContainsAny(sqlSegment, "customer_name", "customerName");
        assertContainsAny(sqlSegment, "customer_phone", "customerPhone");
        assertContainsAny(sqlSegment, "external_order_id", "externalOrderId");
        assertContainsAny(sqlSegment, "order_time", "orderTime");
        assertContainsAny(sqlSegment, "arrival_time", "arrivalTime");
    }

    @Tag("dev")
    @Test
    void queryListShouldBuildUndeliverablePhotoFilter() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyOrder.class);

        YyOrderBo bo = new YyOrderBo();
        bo.setPhotoDeliveryIssueOnly("1");
        when(orderMapper.selectVoList(any())).thenReturn(List.of());

        service.queryList(bo);

        ArgumentCaptor<Wrapper<YyOrder>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(orderMapper).selectVoList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();

        assertContainsAny(sqlSegment, "customer_phone", "customerPhone");
        assertTrue(sqlSegment.contains("yy_photo_album"), () -> "SQL segment should check album existence: " + sqlSegment);
        assertTrue(sqlSegment.contains("yy_photo_asset"), () -> "SQL segment should check visible asset/object key readiness: " + sqlSegment);
        assertTrue(sqlSegment.contains("object_key"), () -> "SQL segment should check missing object_key: " + sqlSegment);
    }

    @Tag("dev")
    @Test
    void queryListShouldBuildExactSlotFiltersAndTrimApiValues() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyOrder.class);

        YyOrderBo bo = new YyOrderBo();
        bo.setSlotDate(" 2026-06-13 ");
        bo.setSlotStartTime(" 11:00 ");
        bo.setSlotEndTime(" 11:30 ");
        bo.setInventoryStatus(" CONFLICT ");
        bo.setSyncStatus(" SYNCED ");
        bo.setPhotoDeliveryIssueOnly(" 1 ");
        when(orderMapper.selectVoList(any())).thenReturn(List.of());

        service.queryList(bo);

        ArgumentCaptor<Wrapper<YyOrder>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(orderMapper).selectVoList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();
        Map<String, Object> params = ((LambdaQueryWrapper<YyOrder>) captor.getValue()).getParamNameValuePairs();

        assertContainsAny(sqlSegment, "slot_date", "slotDate");
        assertContainsAny(sqlSegment, "slot_start_time", "slotStartTime");
        assertContainsAny(sqlSegment, "slot_end_time", "slotEndTime");
        assertContainsAny(sqlSegment, "inventory_status", "inventoryStatus");
        assertTrue(sqlSegment.contains("yy_channel_order_mapping"), () -> "SQL segment should include sync_status mapping filter: " + sqlSegment);
        assertTrue(sqlSegment.contains("yy_photo_album"), () -> "SQL segment should include photo delivery issue filter: " + sqlSegment);
        assertTrue(params.containsValue("2026-06-13"));
        assertTrue(params.containsValue("11:00"));
        assertTrue(params.containsValue("11:30"));
        assertTrue(params.containsValue("CONFLICT"));
        assertTrue(params.containsValue("SYNCED"));
    }

    @Tag("dev")
    @Test
    void queryListShouldBuildChannelMappingStatusFilters() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyOrder.class);

        YyOrderBo bo = new YyOrderBo();
        bo.setSource("DOUYIN_LIFE");
        bo.setExternalStatus("PAY_SUCCESS");
        bo.setSyncStatus("SYNCED");
        when(orderMapper.selectVoList(any())).thenReturn(List.of());

        service.queryList(bo);

        ArgumentCaptor<Wrapper<YyOrder>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(orderMapper).selectVoList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();

        assertTrue(sqlSegment.contains("yy_channel_order_mapping"), () -> "SQL segment should join mapping status: " + sqlSegment);
        assertTrue(sqlSegment.contains("external_status"), () -> "SQL segment should filter external_status: " + sqlSegment);
        assertTrue(sqlSegment.contains("sync_status"), () -> "SQL segment should filter sync_status: " + sqlSegment);
    }

    @Tag("dev")
    @Test
    void queryListShouldScopeNormalEmployeeToBoundStoresWhenStoreIdMissing() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyOrder.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployee.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployeeStore.class);

        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(2063173289800183809L);
        YyEmployee employee = employee(2063173289800183810L, loginUser.getUserId(), 900000000000000100L);
        YyEmployeeStore secondary = employeeStore(employee.getId(), 900000000000000200L);
        when(employeeMapper.selectOne(any())).thenReturn(employee);
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of(secondary));
        when(orderMapper.selectVoList(any())).thenReturn(List.of());

        try (MockedStatic<LoginHelper> loginHelper = mockStatic(LoginHelper.class)) {
            loginHelper.when(LoginHelper::isLogin).thenReturn(true);
            loginHelper.when(LoginHelper::isSuperAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::isTenantAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::getLoginUser).thenReturn(loginUser);

            service.queryList(new YyOrderBo());
        }

        ArgumentCaptor<Wrapper<YyOrder>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(orderMapper).selectVoList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();
        Map<String, Object> params = ((LambdaQueryWrapper<YyOrder>) captor.getValue()).getParamNameValuePairs();

        assertContainsAny(sqlSegment, "store_id", "storeId");
        assertTrue(params.containsValue(900000000000000200L), () -> "SQL params should include employee bound store: " + params);
    }

    @Tag("dev")
    @Test
    void queryListShouldReturnEmptyScopeWhenNormalEmployeeRequestsOtherStore() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyOrder.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployee.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployeeStore.class);

        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(2063173289800183809L);
        YyEmployee employee = employee(2063173289800183810L, loginUser.getUserId(), 900000000000000100L);
        YyEmployeeStore ownStore = employeeStore(employee.getId(), 900000000000000100L);
        YyOrderBo bo = new YyOrderBo();
        bo.setStoreId(900000000000000999L);
        when(employeeMapper.selectOne(any())).thenReturn(employee);
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of(ownStore));
        when(orderMapper.selectVoList(any())).thenReturn(List.of());

        try (MockedStatic<LoginHelper> loginHelper = mockStatic(LoginHelper.class)) {
            loginHelper.when(LoginHelper::isLogin).thenReturn(true);
            loginHelper.when(LoginHelper::isSuperAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::isTenantAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::getLoginUser).thenReturn(loginUser);

            service.queryList(bo);
        }

        ArgumentCaptor<Wrapper<YyOrder>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(orderMapper).selectVoList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();

        assertTrue(sqlSegment.contains("1 = 0") || sqlSegment.contains("1=0"),
            () -> "SQL segment should force empty result for out-of-scope store: " + sqlSegment);
    }

    @Tag("dev")
    @Test
    void queryListShouldKeepRequestedStoreFilterForTenantAdminWithoutEmployeeScope() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyOrder.class);

        YyOrderBo bo = new YyOrderBo();
        bo.setStoreId(900000000000000100L);
        when(orderMapper.selectVoList(any())).thenReturn(List.of());

        try (MockedStatic<LoginHelper> loginHelper = mockStatic(LoginHelper.class)) {
            loginHelper.when(LoginHelper::isLogin).thenReturn(true);
            loginHelper.when(LoginHelper::isSuperAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::isTenantAdmin).thenReturn(true);

            service.queryList(bo);
        }

        ArgumentCaptor<Wrapper<YyOrder>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(orderMapper).selectVoList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();
        Map<String, Object> params = ((LambdaQueryWrapper<YyOrder>) captor.getValue()).getParamNameValuePairs();

        assertContainsAny(sqlSegment, "store_id", "storeId");
        assertTrue(params.containsValue(900000000000000100L), () -> "SQL params should keep requested store for tenant admin: " + params);
        verify(employeeMapper, never()).selectOne(any());
        verify(employeeStoreMapper, never()).selectList(any());
    }

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
        existing.setCustomerPhone("13800000009");
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
        matched.setCustomerPhone("13800000000");
        matched.setExternalOrderId("1095291724056029149");
        matched.setOrderTime(new Date(1780243200000L));
        YyOrder other = new YyOrder();
        other.setId(2L);
        other.setStoreId(7407304729216157723L);
        other.setOrderNo("DYL-OTHER");
        other.setSource("DOUYIN_LIFE");
        other.setStatus("PENDING");
        other.setCustomerName("同手机号其他门店客户");
        other.setCustomerPhone("13800000000");
        other.setExternalOrderId("1095291724056029150");
        when(orderMapper.selectList(any())).thenReturn(List.of(matched, other));
        YyChannelOrderMapping mapping = new YyChannelOrderMapping();
        mapping.setExternalStatus("PAY_SUCCESS");
        mapping.setRawPayload("{\"mobile\":\"13800000000\"}");
        when(channelOrderMappingMapper.selectOne(any())).thenReturn(mapping);

        List<YyMobileOrderVo> orders = service.queryMobileOrdersByPhone(7407304729216157722L, "13800000000", "0000");

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

        List<YyMobileOrderVo> orders = service.queryMobileOrdersByPhone(7407304729216157722L, "13800000000", "0000");

        assertEquals(1, orders.size());
        assertEquals("DYL-1095291724056029149", orders.get(0).getOrderNo());
        assertEquals("138****0000", orders.get(0).getCustomerPhoneMasked());
    }

    @Tag("dev")
    @Test
    void mobileOrdersShouldRejectWhenPhoneLast4Mismatch() {
        List<YyMobileOrderVo> orders = service.queryMobileOrdersByPhone(7407304729216157722L, "13800000000", "9999");

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
        order.setCustomerPhone("13800000000");
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

        List<ClientOrderLinkVo> links = service.queryClientOrderLinksByPhone(7407304729216157722L, "13800000000", "0000");

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

        List<ClientOrderLinkVo> links = service.queryClientOrderLinksByPhone(7407304729216157722L, "13800000000", "0000");

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
        List<ClientOrderLinkVo> links = service.queryClientOrderLinksByPhone(null, "13800000000", "0000");

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
        order.setCustomerPhone("13800000000");
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

    @Tag("dev")
    @Test
    void repairPhotoAlbumPlaceholderShouldDelegateToAlbumService() {
        YyOrder order = new YyOrder();
        order.setId(900001L);
        order.setStoreId(7407304729216157722L);
        order.setSource("DOUYIN_LIFE");
        order.setExternalOrderId("1095598420357785988");
        order.setCustomerPhone("13800000000");
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

    private static YyPhotoAsset asset(Long id, Long albumId, String visible, String objectKey) {
        YyPhotoAsset asset = new YyPhotoAsset();
        asset.setId(id);
        asset.setAlbumId(albumId);
        asset.setVisible(visible);
        asset.setObjectKey(objectKey);
        return asset;
    }

    private static YyEmployee employee(Long id, Long userId, Long storeId) {
        YyEmployee employee = new YyEmployee();
        employee.setId(id);
        employee.setUserId(userId);
        employee.setStoreId(storeId);
        employee.setStatus("0");
        return employee;
    }

    private static YyEmployeeStore employeeStore(Long employeeId, Long storeId) {
        YyEmployeeStore employeeStore = new YyEmployeeStore();
        employeeStore.setId(storeId + 10L);
        employeeStore.setEmployeeId(employeeId);
        employeeStore.setStoreId(storeId);
        employeeStore.setDelFlag("0");
        return employeeStore;
    }

    private static YyOrder paidOrderWithSlot() {
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

    private static YyOrder staffManualOrderWithSlot() {
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

    private static void assertContainsAny(String actual, String... expectedItems) {
        for (String expected : expectedItems) {
            if (actual.contains(expected)) {
                return;
            }
        }
        assertTrue(false, () -> "SQL segment should contain one of " + List.of(expectedItems) + ", actual: " + actual);
    }
}
