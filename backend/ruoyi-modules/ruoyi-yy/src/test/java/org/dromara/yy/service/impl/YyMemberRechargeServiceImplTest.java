package org.dromara.yy.service.impl;

import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyCustomer;
import org.dromara.yy.domain.YyEmployee;
import org.dromara.yy.domain.YyEmployeeStore;
import org.dromara.yy.domain.YyMemberAccount;
import org.dromara.yy.domain.YyMemberBalanceLedger;
import org.dromara.yy.domain.YyMemberRechargeOrder;
import org.dromara.yy.domain.bo.YyMemberRechargeCreateBo;
import org.dromara.yy.domain.vo.YyMemberRechargeOrderVo;
import org.dromara.yy.mapper.YyCustomerMapper;
import org.dromara.yy.mapper.YyEmployeeMapper;
import org.dromara.yy.mapper.YyEmployeeStoreMapper;
import org.dromara.yy.mapper.YyMemberAccountMapper;
import org.dromara.yy.mapper.YyMemberBalanceLedgerMapper;
import org.dromara.yy.mapper.YyMemberRechargeOrderMapper;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyMemberRechargeServiceImplTest {

    @Mock
    private YyCustomerMapper customerMapper;

    @Mock
    private YyEmployeeMapper employeeMapper;

    @Mock
    private YyEmployeeStoreMapper employeeStoreMapper;

    @Mock
    private YyMemberAccountMapper memberAccountMapper;

    @Mock
    private YyMemberBalanceLedgerMapper memberBalanceLedgerMapper;

    @Mock
    private YyMemberRechargeOrderMapper memberRechargeOrderMapper;

    @InjectMocks
    private YyMemberRechargeServiceImpl service;

    @Test
    void createRechargeOrderShouldStayPendingApprovalWhenGiftAmountExists() {
        when(customerMapper.selectById(101L)).thenReturn(customer(101L));
        when(memberAccountMapper.selectOne(any())).thenReturn(account(101L, 9001L));

        YyMemberRechargeCreateBo bo = new YyMemberRechargeCreateBo();
        bo.setStoreId(9001L);
        bo.setRechargeAmount(new BigDecimal("200.00"));
        bo.setGiftAmount(new BigDecimal("20.00"));

        try (MockedStatic<LoginHelper> loginHelper = mockStatic(LoginHelper.class)) {
            loginHelper.when(LoginHelper::isLogin).thenReturn(false);

            YyMemberRechargeOrderVo result = service.createRechargeOrder(101L, bo);

            assertEquals("PENDING_APPROVAL", result.getStatus());
            verify(memberRechargeOrderMapper).insert(any(YyMemberRechargeOrder.class));
            verify(memberAccountMapper).updateById(any(YyMemberAccount.class));
        }
    }

    @Test
    void createRechargeOrderShouldRejectStoreOutsideEmployeeScope() {
        when(customerMapper.selectById(101L)).thenReturn(customer(101L));
        when(memberAccountMapper.selectOne(any())).thenReturn(account(101L, 9001L));
        when(employeeMapper.selectOne(any())).thenReturn(employee(301L, 7001L, 8001L));
        when(employeeStoreMapper.selectList(any())).thenReturn(List.of(employeeStore(301L, 8001L)));

        YyMemberRechargeCreateBo bo = new YyMemberRechargeCreateBo();
        bo.setStoreId(9001L);
        bo.setRechargeAmount(new BigDecimal("100.00"));

        try (MockedStatic<LoginHelper> loginHelper = normalEmployeeLogin(7001L)) {
            assertThrows(ServiceException.class, () -> service.createRechargeOrder(101L, bo));
        }

        verify(memberRechargeOrderMapper, never()).insert(any(YyMemberRechargeOrder.class));
    }

    @Test
    void confirmRechargeOrderShouldRejectPendingApprovalOrders() {
        YyMemberRechargeOrder order = new YyMemberRechargeOrder();
        order.setId(5001L);
        order.setCustomerId(101L);
        order.setStoreId(9001L);
        order.setRechargeAmount(new BigDecimal("200.00"));
        order.setGiftAmount(new BigDecimal("20.00"));
        order.setStatus("PENDING_APPROVAL");
        when(memberRechargeOrderMapper.selectById(5001L)).thenReturn(order);

        try (MockedStatic<LoginHelper> loginHelper = mockStatic(LoginHelper.class)) {
            loginHelper.when(LoginHelper::isLogin).thenReturn(false);
            assertThrows(ServiceException.class, () -> service.confirmRechargeOrder(5001L));
        }

        verify(memberAccountMapper, never()).updateById(any(YyMemberAccount.class));
        verify(memberBalanceLedgerMapper, never()).insert(any(YyMemberBalanceLedger.class));
    }

    @Test
    void listRechargeOrdersShouldReturnLatestOrdersWithLedgerBalanceAfter() {
        when(customerMapper.selectById(101L)).thenReturn(customer(101L));
        when(memberAccountMapper.selectOne(any())).thenReturn(account(101L, 9001L, new BigDecimal("320.00")));
        when(memberRechargeOrderMapper.selectList(any())).thenReturn(List.of(
            rechargeOrder(9002L, 101L, 9001L, "PENDING", new BigDecimal("80.00"), BigDecimal.ZERO, null),
            rechargeOrder(9001L, 101L, 9001L, "CONFIRMED", new BigDecimal("200.00"), new BigDecimal("20.00"), new Date())
        ));
        when(memberBalanceLedgerMapper.selectList(any())).thenReturn(List.of(
            ledger(9001L, new BigDecimal("220.00"))
        ));

        try (MockedStatic<LoginHelper> loginHelper = mockStatic(LoginHelper.class)) {
            loginHelper.when(LoginHelper::isLogin).thenReturn(false);

            List<YyMemberRechargeOrderVo> result = service.listRechargeOrders(101L, 20);

            assertEquals(2, result.size());
            assertEquals("PENDING", result.get(0).getStatus());
            assertEquals(new BigDecimal("320.00"), result.get(0).getBalanceAfter());
            assertEquals("CONFIRMED", result.get(1).getStatus());
            assertEquals(new BigDecimal("220.00"), result.get(1).getBalanceAfter());
        }
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
        return account(customerId, storeId, BigDecimal.ZERO);
    }

    private static YyMemberAccount account(Long customerId, Long storeId, BigDecimal balanceAmount) {
        YyMemberAccount account = new YyMemberAccount();
        account.setId(2001L);
        account.setCustomerId(customerId);
        account.setStoreId(storeId);
        account.setTenantId("000000");
        account.setBalanceAmount(balanceAmount);
        account.setPendingRechargeCount(0);
        return account;
    }

    private static YyMemberRechargeOrder rechargeOrder(
        Long id,
        Long customerId,
        Long storeId,
        String status,
        BigDecimal rechargeAmount,
        BigDecimal giftAmount,
        Date paidTime
    ) {
        YyMemberRechargeOrder order = new YyMemberRechargeOrder();
        order.setId(id);
        order.setCustomerId(customerId);
        order.setStoreId(storeId);
        order.setRechargeOrderNo("YYMR-" + id);
        order.setRechargeAmount(rechargeAmount);
        order.setGiftAmount(giftAmount);
        order.setStatus(status);
        order.setChannelType("STORE_CASH");
        order.setPaidTime(paidTime);
        return order;
    }

    private static YyMemberBalanceLedger ledger(Long sourceId, BigDecimal balanceAfter) {
        YyMemberBalanceLedger ledger = new YyMemberBalanceLedger();
        ledger.setId(8001L);
        ledger.setSourceType("RECHARGE_ORDER");
        ledger.setSourceId(sourceId);
        ledger.setBalanceAfter(balanceAfter);
        return ledger;
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
