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
import org.dromara.yy.domain.YyProduct;
import org.dromara.yy.domain.bo.YyProductBo;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyProductMapper;
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

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyProductServiceImplTest {

    @Mock
    private YyProductMapper productMapper;

    @Mock
    private YyEmployeeMapper employeeMapper;

    @Mock
    private YyEmployeeStoreMapper employeeStoreMapper;

    @InjectMocks
    private YyProductServiceImpl service;

    @Test
    void queryListShouldScopeNormalEmployeeToBoundStoresWhenStoreIdMissing() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyProduct.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployee.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployeeStore.class);

        LoginUser loginUser = loginUser();
        YyEmployee employee = employee(2063173289800183810L, loginUser.getUserId(), 900000000000000100L);
        YyEmployeeStore secondary = employeeStore(employee.getId(), 900000000000000200L);
        when(employeeMapper.selectOne(any())).thenReturn(employee);
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of(secondary));
        when(productMapper.selectVoList(any())).thenReturn(List.of());

        try (MockedStatic<LoginHelper> loginHelper = normalEmployeeLogin(loginUser)) {
            service.queryList(new YyProductBo());
        }

        ArgumentCaptor<Wrapper<YyProduct>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(productMapper).selectVoList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();
        Map<String, Object> params = ((LambdaQueryWrapper<YyProduct>) captor.getValue()).getParamNameValuePairs();

        assertContainsAny(sqlSegment, "store_id", "storeId");
        assertTrue(params.containsValue(900000000000000200L), () -> "SQL params should include employee bound store: " + params);
    }

    @Test
    void queryListShouldReturnEmptyScopeWhenNormalEmployeeRequestsOtherStore() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyProduct.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployee.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployeeStore.class);

        LoginUser loginUser = loginUser();
        YyEmployee employee = employee(2063173289800183810L, loginUser.getUserId(), 900000000000000100L);
        when(employeeMapper.selectOne(any())).thenReturn(employee);
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of(employeeStore(employee.getId(), 900000000000000100L)));
        when(productMapper.selectVoList(any())).thenReturn(List.of());
        YyProductBo bo = new YyProductBo();
        bo.setStoreId(900000000000000999L);

        try (MockedStatic<LoginHelper> loginHelper = normalEmployeeLogin(loginUser)) {
            service.queryList(bo);
        }

        ArgumentCaptor<Wrapper<YyProduct>> captor = ArgumentCaptor.forClass(Wrapper.class);
        verify(productMapper).selectVoList(captor.capture());
        String sqlSegment = captor.getValue().getSqlSegment();
        assertTrue(sqlSegment.contains("1 = 0") || sqlSegment.contains("1=0"),
            () -> "SQL segment should force empty result for out-of-scope store: " + sqlSegment);
    }

    @Test
    void updateShouldRejectNormalEmployeeOutsideExistingStoreScope() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployee.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployeeStore.class);

        LoginUser loginUser = loginUser();
        YyEmployee employee = employee(2063173289800183810L, loginUser.getUserId(), 900000000000000100L);
        YyProduct existing = product(900001L, 900000000000000999L);
        YyProductBo bo = productBo(900000000000000100L);
        bo.setId(existing.getId());
        when(productMapper.selectById(existing.getId())).thenReturn(existing);
        when(employeeMapper.selectOne(any())).thenReturn(employee);
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of(employeeStore(employee.getId(), 900000000000000100L)));

        try (MockedStatic<LoginHelper> loginHelper = normalEmployeeLogin(loginUser)) {
            assertThrows(ServiceException.class, () -> service.updateByBo(bo));
        }

        verify(productMapper, never()).updateById(any(YyProduct.class));
    }

    @Test
    void deleteShouldRejectNormalEmployeeOutsideStoreScope() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployee.class);
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new Configuration(), "test"), YyEmployeeStore.class);

        LoginUser loginUser = loginUser();
        YyEmployee employee = employee(2063173289800183810L, loginUser.getUserId(), 900000000000000100L);
        YyProduct existing = product(900001L, 900000000000000999L);
        when(productMapper.selectByIds(List.of(existing.getId()))).thenReturn(List.of(existing));
        when(employeeMapper.selectOne(any())).thenReturn(employee);
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of(employeeStore(employee.getId(), 900000000000000100L)));

        try (MockedStatic<LoginHelper> loginHelper = normalEmployeeLogin(loginUser)) {
            assertThrows(ServiceException.class, () -> service.deleteWithValidByIds(List.of(existing.getId()), true));
        }

        verify(productMapper, never()).deleteByIds(any());
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

    private static YyProduct product(Long id, Long storeId) {
        YyProduct product = new YyProduct();
        product.setId(id);
        product.setStoreId(storeId);
        product.setProductType("PHOTO_CARD");
        product.setProductName("证件照套餐");
        product.setStatus("0");
        return product;
    }

    private static YyProductBo productBo(Long storeId) {
        YyProductBo bo = new YyProductBo();
        bo.setStoreId(storeId);
        bo.setProductType("PHOTO_CARD");
        bo.setProductName("证件照套餐");
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
