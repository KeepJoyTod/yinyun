package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyBookingSlotInventory;
import org.dromara.yy.domain.YyEmployee;
import org.dromara.yy.domain.YyEmployeeStore;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.bo.YyBookingSlotInventoryBo;
import org.dromara.yy.domain.vo.BookingSlotInventoryDecision;
import org.dromara.yy.domain.vo.YyBookingSlotInventoryVo;
import org.dromara.yy.mapper.YyBookingSlotInventoryMapper;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.mapper.YyScheduleRuleMapper;
import org.dromara.yy.mapper.YyServiceGroupMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Date;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyBookingSlotInventoryServiceImplTest {

    @Mock
    private YyBookingSlotInventoryMapper inventoryMapper;

    @Mock
    private YyOrderMapper orderMapper;

    @Mock
    private YyScheduleRuleMapper scheduleRuleMapper;

    @Mock
    private YyServiceGroupMapper serviceGroupMapper;

    @Mock
    private YyEmployeeMapper employeeMapper;

    @Mock
    private YyEmployeeStoreMapper employeeStoreMapper;

    @InjectMocks
    private YyBookingSlotInventoryServiceImpl service;

    @Test
    void confirmPaidOrderSlotShouldNotDeductAgainWhenOrderAlreadyConfirmed() {
        YyOrder order = orderWithInventorySlot();
        order.setInventoryStatus("CONFIRMED");

        BookingSlotInventoryDecision decision = service.confirmPaidOrderSlot(order);

        assertEquals("CONFIRMED", decision.getInventoryStatus());
        assertFalse(decision.isDeducted());
        verify(inventoryMapper, never()).incrementPaidCountIfAvailable(any());
        verify(orderMapper, never()).updateById(any(YyOrder.class));
    }

    @Test
    void confirmPaidOrderSlotShouldConfirmWhenAtomicDeductSucceeds() {
        YyOrder order = orderWithInventorySlot();
        when(inventoryMapper.incrementPaidCountIfAvailable(880001L)).thenReturn(1);

        BookingSlotInventoryDecision decision = service.confirmPaidOrderSlot(order);

        assertEquals("CONFIRMED", decision.getInventoryStatus());
        assertTrue(decision.isDeducted());
        assertEquals("CONFIRMED", order.getInventoryStatus());
        verify(orderMapper).updateById(any(YyOrder.class));
    }

    @Test
    void confirmPaidOrderSlotShouldMarkConflictWhenSlotIsFull() {
        YyOrder order = orderWithInventorySlot();
        when(inventoryMapper.incrementPaidCountIfAvailable(880001L)).thenReturn(0);

        BookingSlotInventoryDecision decision = service.confirmPaidOrderSlot(order);

        assertEquals("CONFLICT", decision.getInventoryStatus());
        assertFalse(decision.isDeducted());
        assertEquals("CONFLICT", order.getInventoryStatus());

        ArgumentCaptor<YyOrder> captor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).updateById(captor.capture());
        assertEquals("CONFLICT", captor.getValue().getInventoryStatus());
        assertEquals("库存已满，需人工改期", captor.getValue().getConflictReason());
    }

    @Test
    void confirmPaidOrderSlotShouldSkipHistoricalOrderWithoutRealSlotIdentity() {
        YyOrder order = new YyOrder();
        order.setId(990002L);
        order.setTenantId("000000");
        order.setStoreId(900001L);
        order.setSource("DOUYIN_LIFE");
        order.setChannelType("DOUYIN_LIFE");
        order.setExternalOrderId("1095291724056029999");
        order.setPayStatus("PAID");

        BookingSlotInventoryDecision decision = service.confirmPaidOrderSlot(order);

        assertEquals("SKIPPED", decision.getInventoryStatus());
        assertFalse(decision.isDeducted());
        verify(inventoryMapper, never()).incrementPaidCountIfAvailable(any());
        verify(inventoryMapper, never()).insert(any(YyBookingSlotInventory.class));
        ArgumentCaptor<YyOrder> captor = ArgumentCaptor.forClass(YyOrder.class);
        verify(orderMapper).updateById(captor.capture());
        assertEquals("SKIPPED", captor.getValue().getInventoryStatus());
        assertEquals("订单缺少完整预约时段，未参与库存扣减", captor.getValue().getConflictReason());
    }

    @Test
    void releaseConfirmedOrderSlotShouldDecreaseOnlyConfirmedOrders() {
        YyOrder order = orderWithInventorySlot();
        order.setInventoryStatus("CONFIRMED");

        service.releaseConfirmedOrderSlot(order);

        verify(inventoryMapper).decrementPaidCount(880001L);
        verify(orderMapper).updateById(any(YyOrder.class));
    }

    @Test
    void queryListShouldFilterStoreDateAndStatus() {
        YyBookingSlotInventoryBo bo = new YyBookingSlotInventoryBo();
        bo.setStoreId(900001L);
        bo.setBeginBizDate("2026-06-12");
        bo.setEndBizDate("2026-06-13");
        bo.setStatus("ACTIVE");
        when(inventoryMapper.selectVoList(any())).thenReturn(List.of(new YyBookingSlotInventoryVo()));

        List<YyBookingSlotInventoryVo> result = service.queryList(bo);

        assertEquals(1, result.size());
        verify(inventoryMapper).selectVoList(any());
    }

    @Test
    void queryListShouldSupportConflictOnlyFilter() {
        YyBookingSlotInventoryBo bo = new YyBookingSlotInventoryBo();
        bo.setConflictOnly("1");
        when(inventoryMapper.selectVoList(any())).thenReturn(List.of(new YyBookingSlotInventoryVo()));

        List<YyBookingSlotInventoryVo> result = service.queryList(bo);

        assertEquals(1, result.size());
        verify(inventoryMapper).selectVoList(any());
    }

    @Test
    void queryListShouldScopeNormalEmployeeToBoundStoresWhenStoreIdMissing() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyBookingSlotInventory.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployee.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployeeStore.class);

        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(2063173289800183809L);
        YyEmployee employee = employee(2063173289800183810L, loginUser.getUserId(), 900000000000000100L);
        YyEmployeeStore secondary = employeeStore(employee.getId(), 900000000000000200L);
        when(employeeMapper.selectOne(any())).thenReturn(employee);
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of(secondary));
        when(inventoryMapper.selectVoList(any())).thenReturn(List.of());

        try (MockedStatic<LoginHelper> loginHelper = mockStatic(LoginHelper.class)) {
            loginHelper.when(LoginHelper::isLogin).thenReturn(true);
            loginHelper.when(LoginHelper::isSuperAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::isTenantAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::getLoginUser).thenReturn(loginUser);

            service.queryList(new YyBookingSlotInventoryBo());
        }

        ArgumentCaptor<Wrapper<YyBookingSlotInventory>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(inventoryMapper).selectVoList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();
        Map<String, Object> params = ((LambdaQueryWrapper<YyBookingSlotInventory>) captor.getValue()).getParamNameValuePairs();

        assertContainsAny(sqlSegment, "store_id", "storeId");
        assertTrue(params.containsValue(900000000000000200L), () -> "SQL params should include employee bound store: " + params);
    }

    @Test
    void queryListShouldScopeNormalEmployeeWhenBoIsNull() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyBookingSlotInventory.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployee.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployeeStore.class);

        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(2063173289800183809L);
        YyEmployee employee = employee(2063173289800183810L, loginUser.getUserId(), 900000000000000100L);
        YyEmployeeStore ownStore = employeeStore(employee.getId(), 900000000000000100L);
        when(employeeMapper.selectOne(any())).thenReturn(employee);
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of(ownStore));
        when(inventoryMapper.selectVoList(any())).thenReturn(List.of());

        try (MockedStatic<LoginHelper> loginHelper = mockStatic(LoginHelper.class)) {
            loginHelper.when(LoginHelper::isLogin).thenReturn(true);
            loginHelper.when(LoginHelper::isSuperAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::isTenantAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::getLoginUser).thenReturn(loginUser);

            service.queryList(null);
        }

        ArgumentCaptor<Wrapper<YyBookingSlotInventory>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(inventoryMapper).selectVoList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();
        Map<String, Object> params = ((LambdaQueryWrapper<YyBookingSlotInventory>) captor.getValue()).getParamNameValuePairs();

        assertContainsAny(sqlSegment, "store_id", "storeId");
        assertTrue(params.containsValue(900000000000000100L), () -> "SQL params should include employee fallback store: " + params);
    }

    @Test
    void queryListShouldReturnEmptyScopeWhenNormalEmployeeRequestsOtherStore() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyBookingSlotInventory.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployee.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployeeStore.class);

        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(2063173289800183809L);
        YyEmployee employee = employee(2063173289800183810L, loginUser.getUserId(), 900000000000000100L);
        YyEmployeeStore ownStore = employeeStore(employee.getId(), 900000000000000100L);
        YyBookingSlotInventoryBo bo = new YyBookingSlotInventoryBo();
        bo.setStoreId(900000000000000999L);
        when(employeeMapper.selectOne(any())).thenReturn(employee);
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of(ownStore));
        when(inventoryMapper.selectVoList(any())).thenReturn(List.of());

        try (MockedStatic<LoginHelper> loginHelper = mockStatic(LoginHelper.class)) {
            loginHelper.when(LoginHelper::isLogin).thenReturn(true);
            loginHelper.when(LoginHelper::isSuperAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::isTenantAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::getLoginUser).thenReturn(loginUser);

            service.queryList(bo);
        }

        ArgumentCaptor<Wrapper<YyBookingSlotInventory>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(inventoryMapper).selectVoList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();

        assertTrue(sqlSegment.contains("1 = 0") || sqlSegment.contains("1=0"),
            () -> "SQL segment should force empty result for out-of-scope store: " + sqlSegment);
    }

    @Test
    void updateCapacityShouldRejectNormalEmployeeOutsideStoreScope() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployee.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployeeStore.class);

        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(2063173289800183809L);
        YyEmployee employee = employee(2063173289800183810L, loginUser.getUserId(), 900000000000000100L);
        YyEmployeeStore ownStore = employeeStore(employee.getId(), 900000000000000100L);
        YyBookingSlotInventory slot = inventorySlot();
        slot.setStoreId(900000000000000999L);
        when(inventoryMapper.selectById(880001L)).thenReturn(slot);
        when(employeeMapper.selectOne(any())).thenReturn(employee);
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of(ownStore));

        YyBookingSlotInventoryBo bo = new YyBookingSlotInventoryBo();
        bo.setId(880001L);
        bo.setCapacity(5);

        try (MockedStatic<LoginHelper> loginHelper = mockStatic(LoginHelper.class)) {
            loginHelper.when(LoginHelper::isLogin).thenReturn(true);
            loginHelper.when(LoginHelper::isSuperAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::isTenantAdmin).thenReturn(false);
            loginHelper.when(LoginHelper::getLoginUser).thenReturn(loginUser);

            assertThrows(org.dromara.common.core.exception.ServiceException.class, () -> service.updateByBo(bo));
        }

        verify(inventoryMapper, never()).updateById(any(YyBookingSlotInventory.class));
    }

    @Test
    void updateCapacityShouldRejectCapacityBelowPaidCount() {
        YyBookingSlotInventory slot = inventorySlot();
        slot.setCapacity(3);
        slot.setPaidCount(2);
        when(inventoryMapper.selectById(880001L)).thenReturn(slot);

        YyBookingSlotInventoryBo bo = new YyBookingSlotInventoryBo();
        bo.setId(880001L);
        bo.setCapacity(1);

        assertThrows(org.dromara.common.core.exception.ServiceException.class, () -> service.updateByBo(bo));
        verify(inventoryMapper, never()).updateById(any(YyBookingSlotInventory.class));
    }

    @Test
    void updateCapacityShouldPersistMutableFields() {
        YyBookingSlotInventory slot = inventorySlot();
        slot.setCapacity(3);
        slot.setPaidCount(2);
        when(inventoryMapper.selectById(880001L)).thenReturn(slot);
        when(inventoryMapper.updateById(any(YyBookingSlotInventory.class))).thenReturn(1);

        YyBookingSlotInventoryBo bo = new YyBookingSlotInventoryBo();
        bo.setId(880001L);
        bo.setCapacity(5);
        bo.setStatus("ACTIVE");
        bo.setRemark("临时扩容");

        assertTrue(service.updateByBo(bo));
        ArgumentCaptor<YyBookingSlotInventory> captor = ArgumentCaptor.forClass(YyBookingSlotInventory.class);
        verify(inventoryMapper).updateById(captor.capture());
        assertEquals(880001L, captor.getValue().getId());
        assertEquals(5, captor.getValue().getCapacity());
        assertEquals("ACTIVE", captor.getValue().getStatus());
        assertEquals("临时扩容", captor.getValue().getRemark());
    }

    private static YyOrder orderWithInventorySlot() {
        YyOrder order = new YyOrder();
        order.setId(990001L);
        order.setTenantId("000000");
        order.setStoreId(900001L);
        order.setServiceGroupId(700001L);
        order.setInventorySlotId(880001L);
        order.setSlotDate("2026-06-12");
        order.setSlotStartTime("10:00");
        order.setSlotEndTime("10:30");
        order.setPayStatus("PAID");
        order.setPaidTime(new Date(1781234400000L));
        return order;
    }

    private static YyBookingSlotInventory inventorySlot() {
        YyBookingSlotInventory slot = new YyBookingSlotInventory();
        slot.setId(880001L);
        slot.setTenantId("000000");
        slot.setStoreId(900001L);
        slot.setServiceGroupId(700001L);
        slot.setBizDate("2026-06-12");
        slot.setStartTime("10:00");
        slot.setEndTime("10:30");
        slot.setStatus("ACTIVE");
        slot.setDelFlag("0");
        return slot;
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

    private static void assertContainsAny(String actual, String... expectedItems) {
        for (String expected : expectedItems) {
            if (actual.contains(expected)) {
                return;
            }
        }
        throw new AssertionError("Expected SQL segment to contain any of " + List.of(expectedItems) + ", actual: " + actual);
    }
}
