package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyEmployee;
import org.dromara.yy.domain.YyEmployeeStore;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.bo.YyOrderBo;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class YyOrderQueryScopeTest extends YyOrderServiceImplTestSupport {

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

}
