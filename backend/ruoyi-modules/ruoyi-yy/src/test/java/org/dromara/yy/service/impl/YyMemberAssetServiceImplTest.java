package org.dromara.yy.service.impl;

import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyCustomer;
import org.dromara.yy.domain.YyEmployee;
import org.dromara.yy.domain.YyEmployeeStore;
import org.dromara.yy.domain.YyMemberAccount;
import org.dromara.yy.mapper.YyCouponInstanceMapper;
import org.dromara.yy.mapper.YyCouponTemplateMapper;
import org.dromara.yy.mapper.YyCustomerMapper;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyMemberAccountMapper;
import org.dromara.yy.mapper.YyMemberBalanceLedgerMapper;
import org.dromara.yy.mapper.YyMemberBenefitLedgerMapper;
import org.dromara.yy.mapper.YyMemberCardInstanceMapper;
import org.dromara.yy.mapper.YyMemberGrowthLedgerMapper;
import org.dromara.yy.mapper.YyMemberPointsLedgerMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyMemberAssetServiceImplTest {

    @Mock
    private YyCustomerMapper customerMapper;

    @Mock
    private YyEmployeeMapper employeeMapper;

    @Mock
    private YyEmployeeStoreMapper employeeStoreMapper;

    @Mock
    private YyMemberAccountMapper memberAccountMapper;

    @Mock
    private YyMemberCardInstanceMapper memberCardInstanceMapper;

    @Mock
    private YyMemberBenefitLedgerMapper memberBenefitLedgerMapper;

    @Mock
    private YyCouponInstanceMapper couponInstanceMapper;

    @Mock
    private YyCouponTemplateMapper couponTemplateMapper;

    @Mock
    private YyMemberPointsLedgerMapper memberPointsLedgerMapper;

    @Mock
    private YyMemberGrowthLedgerMapper memberGrowthLedgerMapper;

    @Mock
    private YyMemberBalanceLedgerMapper memberBalanceLedgerMapper;

    @InjectMocks
    private YyMemberAssetServiceImpl service;

    @Test
    void getOverviewShouldRejectCustomerOutsideEmployeeStoreScope() {
        when(customerMapper.selectById(101L)).thenReturn(customer(101L));
        when(memberAccountMapper.selectOne(any())).thenReturn(account(101L, 9001L));
        when(employeeMapper.selectOne(any())).thenReturn(employee(301L, 7001L, 8001L));
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of(employeeStore(301L, 8001L)));

        try (MockedStatic<LoginHelper> loginHelper = normalEmployeeLogin(7001L)) {
            assertThrows(ServiceException.class, () -> service.getMemberOverview(101L));
        }

        verify(memberCardInstanceMapper, never()).selectCount(any());
        verify(memberBenefitLedgerMapper, never()).selectCount(any());
        verify(couponInstanceMapper, never()).selectCount(any());
    }

    private static MockedStatic<LoginHelper> normalEmployeeLogin(Long userId) {
        MockedStatic<LoginHelper> loginHelper = mockStatic(LoginHelper.class);
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(userId);
        loginHelper.when(LoginHelper::isLogin).thenReturn(true);
        loginHelper.when(LoginHelper::isSuperAdmin).thenReturn(false);
        loginHelper.when(LoginHelper::isTenantAdmin).thenReturn(false);
        loginHelper.when(LoginHelper::getLoginUser).thenReturn(loginUser);
        return loginHelper;
    }

    private static YyCustomer customer(Long id) {
        YyCustomer customer = new YyCustomer();
        customer.setId(id);
        customer.setCustomerName("member-" + id);
        customer.setTenantId("000000");
        return customer;
    }

    private static YyMemberAccount account(Long customerId, Long storeId) {
        YyMemberAccount account = new YyMemberAccount();
        account.setId(2001L);
        account.setCustomerId(customerId);
        account.setStoreId(storeId);
        account.setTenantId("000000");
        account.setBalanceAmount(BigDecimal.ZERO);
        return account;
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
        employeeStore.setEmployeeId(employeeId);
        employeeStore.setStoreId(storeId);
        employeeStore.setDelFlag("0");
        return employeeStore;
    }
}
