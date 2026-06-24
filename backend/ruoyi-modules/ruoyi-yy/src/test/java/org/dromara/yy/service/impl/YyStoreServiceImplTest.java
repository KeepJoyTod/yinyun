package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.apache.ibatis.session.Configuration;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyEmployee;
import org.dromara.yy.domain.YyEmployeeStore;
import org.dromara.yy.domain.YyStore;
import org.dromara.yy.domain.bo.YyStoreBo;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyStoreMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class YyStoreServiceImplTest {

    @Mock
    private YyStoreMapper storeMapper;

    @Mock
    private YyEmployeeMapper employeeMapper;

    @Mock
    private YyEmployeeStoreMapper employeeStoreMapper;

    @InjectMocks
    private YyStoreServiceImpl service;

    @Tag("dev")
    @Test
    void queryListShouldScopeNormalEmployeeToBoundStoresWhenStoreIdMissing() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyStore.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployee.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployeeStore.class);

        LoginUser loginUser = loginUser();
        YyEmployee employee = employee(2063173289800183810L, loginUser.getUserId(), 900000000000000100L);
        when(employeeMapper.selectOne(any())).thenReturn(employee);
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of(employeeStore(employee.getId(), 900000000000000200L)));
        when(storeMapper.selectVoList(any())).thenReturn(List.of());

        try (MockedStatic<LoginHelper> loginHelper = normalEmployeeLogin(loginUser)) {
            service.queryList(new YyStoreBo());
        }

        ArgumentCaptor<Wrapper<YyStore>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(storeMapper).selectVoList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();
        Map<String, Object> params = ((LambdaQueryWrapper<YyStore>) captor.getValue()).getParamNameValuePairs();

        assertContainsAny(sqlSegment, "id");
        assertTrue(params.containsValue(900000000000000200L), () -> "SQL params should include employee bound store id: " + params);
    }

    @Tag("dev")
    @Test
    void queryByIdShouldReturnNullWhenNormalEmployeeRequestsOtherStore() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployee.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployeeStore.class);

        LoginUser loginUser = loginUser();
        YyEmployee employee = employee(2063173289800183810L, loginUser.getUserId(), 900000000000000100L);
        when(employeeMapper.selectOne(any())).thenReturn(employee);
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of(employeeStore(employee.getId(), 900000000000000100L)));
        org.dromara.yy.domain.vo.YyStoreVo vo = new org.dromara.yy.domain.vo.YyStoreVo();
        vo.setId(900000000000000999L);
        when(storeMapper.selectVoById(900000000000000999L)).thenReturn(vo);

        try (MockedStatic<LoginHelper> loginHelper = normalEmployeeLogin(loginUser)) {
            assertEquals(null, service.queryById(900000000000000999L));
        }
    }

    @Tag("dev")
    @Test
    void updateShouldRejectNormalEmployeeOutsideStoreScope() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployee.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployeeStore.class);

        LoginUser loginUser = loginUser();
        YyEmployee employee = employee(2063173289800183810L, loginUser.getUserId(), 900000000000000100L);
        YyStore existing = store(900000000000000999L);
        YyStoreBo bo = storeBo(existing.getId());
        when(storeMapper.selectById(existing.getId())).thenReturn(existing);
        when(employeeMapper.selectOne(any())).thenReturn(employee);
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of(employeeStore(employee.getId(), 900000000000000100L)));

        try (MockedStatic<LoginHelper> loginHelper = normalEmployeeLogin(loginUser)) {
            assertThrows(ServiceException.class, () -> service.updateByBo(bo));
        }

        verify(storeMapper, never()).updateById(any(YyStore.class));
    }

    @Tag("dev")
    @Test
    void deleteShouldRejectNormalEmployeeOutsideStoreScope() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployee.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployeeStore.class);

        LoginUser loginUser = loginUser();
        YyEmployee employee = employee(2063173289800183810L, loginUser.getUserId(), 900000000000000100L);
        YyStore existing = store(900000000000000999L);
        when(storeMapper.selectByIds(List.of(existing.getId()))).thenReturn(List.of(existing));
        when(employeeMapper.selectOne(any())).thenReturn(employee);
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of(employeeStore(employee.getId(), 900000000000000100L)));

        try (MockedStatic<LoginHelper> loginHelper = normalEmployeeLogin(loginUser)) {
            assertThrows(ServiceException.class, () -> service.deleteWithValidByIds(List.of(existing.getId()), true));
        }

        verify(storeMapper, never()).deleteByIds(any());
    }

    @Tag("dev")
    @Test
    void insertByBoShouldPersistStoreAndBackfillId() {
        YyStoreBo bo = new YyStoreBo();
        bo.setStoreCode("HQ-001");
        bo.setStoreName("旗舰店");
        bo.setStatus("0");

        when(storeMapper.insert(any(YyStore.class))).thenAnswer(invocation -> {
            YyStore entity = invocation.getArgument(0);
            entity.setId(620100L);
            return 1;
        });

        assertTrue(service.insertByBo(bo));
        assertEquals(620100L, bo.getId());

        ArgumentCaptor<YyStore> captor = ArgumentCaptor.forClass(YyStore.class);
        verify(storeMapper).insert(captor.capture());
        YyStore saved = captor.getValue();
        assertEquals("HQ-001", saved.getStoreCode());
        assertEquals("旗舰店", saved.getStoreName());
        assertEquals("0", saved.getStatus());
    }

    private static LoginUser loginUser() {
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(2063173289800183809L);
        return loginUser;
    }

    private static MockedStatic<LoginHelper> normalEmployeeLogin(LoginUser loginUser) {
        MockedStatic<LoginHelper> loginHelper = mockStatic(LoginHelper.class);
        loginHelper.when(LoginHelper::isLogin).thenReturn(true);
        loginHelper.when(LoginHelper::isSuperAdmin).thenReturn(false);
        loginHelper.when(LoginHelper::isTenantAdmin).thenReturn(false);
        loginHelper.when(LoginHelper::getLoginUser).thenReturn(loginUser);
        return loginHelper;
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

    private static YyStore store(Long id) {
        YyStore store = new YyStore();
        store.setId(id);
        store.setStoreCode("BZ-WANDA");
        store.setStoreName("滨州万达店");
        store.setStatus("0");
        return store;
    }

    private static YyStoreBo storeBo(Long id) {
        YyStoreBo bo = new YyStoreBo();
        bo.setId(id);
        bo.setStoreCode("BZ-WANDA");
        bo.setStoreName("滨州万达店");
        bo.setStatus("0");
        return bo;
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
