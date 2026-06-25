package org.dromara.yy.service.impl;

import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyCustomer;
import org.dromara.yy.domain.YyEmployee;
import org.dromara.yy.domain.YyEmployeeStore;
import org.dromara.yy.domain.YyMemberBalanceLedger;
import org.dromara.yy.domain.YyMemberRechargeOrder;
import org.dromara.yy.domain.YyStore;
import org.dromara.yy.domain.bo.YyMemberStoredValueTransactionQueryBo;
import org.dromara.yy.domain.vo.YyMemberRechargeCapabilityVo;
import org.dromara.yy.domain.vo.YyMemberRechargeSettingVo;
import org.dromara.yy.domain.vo.YyMemberStoredValueTransactionVo;
import org.dromara.yy.mapper.YyCustomerMapper;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyMemberBalanceLedgerMapper;
import org.dromara.yy.mapper.YyMemberRechargeOrderMapper;
import org.dromara.yy.mapper.YyStoreMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Method;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyMemberStoredValueServiceImplTest {

    @Mock
    private YyCustomerMapper customerMapper;

    @Mock
    private YyStoreMapper storeMapper;

    @Mock
    private YyEmployeeMapper employeeMapper;

    @Mock
    private YyEmployeeStoreMapper employeeStoreMapper;

    @Mock
    private YyMemberBalanceLedgerMapper memberBalanceLedgerMapper;

    @Mock
    private YyMemberRechargeOrderMapper memberRechargeOrderMapper;

    @InjectMocks
    private YyMemberStoredValueServiceImpl service;

    @Test
    void getRechargeCapabilityShouldReturnConservativeScaffold() {
        YyMemberRechargeCapabilityVo result = service.getRechargeCapability();

        assertEquals("MEMBER_RECHARGE", result.getCapabilityCode());
        assertEquals(false, result.getEnabled());
        assertEquals("scaffold", result.getStatus());
        assertEquals("yy:customer:list", result.getPermissionCode());
        assertEquals(true, result.getRequiresApproval());
        assertEquals("disabled", result.getPluginState());
        assertEquals("missing", result.getLicenseState());
    }

    @Test
    void getRechargeSettingShouldKeepManualReadOnlyAndThirdPartyClosed() {
        YyMemberRechargeSettingVo result = service.getRechargeSetting();

        assertEquals(false, result.getEnabled());
        assertEquals("scaffold", result.getStatus());
        assertEquals(true, result.getAllowManualRecharge());
        assertEquals(true, result.getAllowGiftAmount());
        assertEquals(false, result.getAllowCrossStore());
        assertEquals("STORE_CASH", result.getDefaultChannelType());
        assertTrue(result.getSupportedChannels().contains("BANK_TRANSFER"));
        assertTrue(result.getGiftRules().isEmpty());
    }

    @Test
    void listStoredValueTransactionsShouldMapBalanceLedgerAndRechargeOrder() {
        when(memberBalanceLedgerMapper.selectList(any())).thenReturn(List.of(balanceLedger()));
        when(memberRechargeOrderMapper.selectById(5001L)).thenReturn(rechargeOrder());
        when(customerMapper.selectById(101L)).thenReturn(customer(101L));
        when(storeMapper.selectById(9001L)).thenReturn(store(9001L));

        YyMemberStoredValueTransactionQueryBo query = new YyMemberStoredValueTransactionQueryBo();
        query.setCustomerId(101L);
        query.setLimit(20);

        try (MockedStatic<LoginHelper> loginHelper = mockStatic(LoginHelper.class)) {
            loginHelper.when(LoginHelper::isLogin).thenReturn(false);

            List<YyMemberStoredValueTransactionVo> result = service.listStoredValueTransactions(query);

            assertEquals(1, result.size());
            YyMemberStoredValueTransactionVo row = result.get(0);
            assertEquals(7001L, row.getId());
            assertEquals("BAL-7001", row.getTransactionNo());
            assertEquals("member-101", row.getCustomerName());
            assertEquals("RECHARGE", row.getTransactionType());
            assertEquals("CONFIRMED", row.getTransactionStatus());
            assertEquals("IN", row.getDirection());
            assertEquals("RECHARGE_ORDER", row.getSourceType());
            assertEquals(5001L, row.getRechargeOrderId());
            assertEquals("YYMR-5001", row.getRechargeOrderNo());
            assertEquals("深圳总店", row.getStoreName());
            assertEquals("STORE_CASH", row.getChannelType());
            assertEquals(new BigDecimal("400.00"), row.getSummary().getBalanceBefore());
            assertEquals(new BigDecimal("120.00"), row.getSummary().getChangeAmount());
            assertEquals(new BigDecimal("20.00"), row.getSummary().getGiftAmount());
            assertEquals(new BigDecimal("100.00"), row.getSummary().getPrincipalAmount());
            assertEquals(new BigDecimal("520.00"), row.getSummary().getBalanceAfter());
            assertTrue(row.getTags().contains("recharge"));
        }
    }

    @Test
    void listStoredValueTransactionsShouldRejectStoreOutsideEmployeeScope() {
        when(employeeMapper.selectOne(any())).thenReturn(employee(301L, 7001L, 8001L));
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of(employeeStore(301L, 8001L)));

        YyMemberStoredValueTransactionQueryBo query = new YyMemberStoredValueTransactionQueryBo();
        query.setStoreId(9001L);

        try (MockedStatic<LoginHelper> loginHelper = normalEmployeeLogin(7001L)) {
            assertThrows(ServiceException.class, () -> service.listStoredValueTransactions(query));
        }

        verify(memberBalanceLedgerMapper, never()).selectList(any());
    }

    @Test
    void listStoredValueTransactionsShouldCapLimitAtOneHundred() throws Exception {
        Method normalizeLimit = YyMemberStoredValueServiceImpl.class.getDeclaredMethod("normalizeLimit", Integer.class);
        normalizeLimit.setAccessible(true);

        assertEquals(100, normalizeLimit.invoke(service, 500));
        assertEquals(1, normalizeLimit.invoke(service, 0));
        assertEquals(20, normalizeLimit.invoke(service, new Object[] { null }));
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

    private static YyMemberBalanceLedger balanceLedger() {
        YyMemberBalanceLedger ledger = new YyMemberBalanceLedger();
        ledger.setId(7001L);
        ledger.setCustomerId(101L);
        ledger.setStoreId(9001L);
        ledger.setChangeType("RECHARGE");
        ledger.setChangeAmount(new BigDecimal("120.00"));
        ledger.setBalanceAfter(new BigDecimal("520.00"));
        ledger.setSourceType("RECHARGE_ORDER");
        ledger.setSourceId(5001L);
        ledger.setHappenedAt(new Date(1760000000000L));
        ledger.setRemark("会员手工充值");
        return ledger;
    }

    private static YyMemberRechargeOrder rechargeOrder() {
        YyMemberRechargeOrder order = new YyMemberRechargeOrder();
        order.setId(5001L);
        order.setCustomerId(101L);
        order.setStoreId(9001L);
        order.setRechargeOrderNo("YYMR-5001");
        order.setRechargeAmount(new BigDecimal("100.00"));
        order.setGiftAmount(new BigDecimal("20.00"));
        order.setStatus("CONFIRMED");
        order.setChannelType("STORE_CASH");
        return order;
    }

    private static YyCustomer customer(Long id) {
        YyCustomer customer = new YyCustomer();
        customer.setId(id);
        customer.setCustomerName("member-" + id);
        return customer;
    }

    private static YyStore store(Long id) {
        YyStore store = new YyStore();
        store.setId(id);
        store.setStoreName("深圳总店");
        return store;
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
