package org.dromara.yy.service.impl;

import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.bo.YyOrderPaymentConfirmBo;
import org.dromara.yy.domain.vo.YyOrderVo;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.service.IYyOrderService;
import org.dromara.yy.service.IYyPaymentService;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyOrderPaymentEntryServiceTest {

    @Mock
    private YyOrderMapper orderMapper;

    @Mock
    private IYyPaymentService paymentService;

    @Mock
    private IYyOrderService orderService;

    private final YyOrderPaymentEligibilityPolicy paymentEligibilityPolicy = new YyOrderPaymentEligibilityPolicy();

    @Test
    void confirmPaymentShouldCreateStoreConfirmLedgerAndMarkPaid() {
        YyOrder order = localOrder();
        YyOrderVo expected = new YyOrderVo();
        expected.setId(order.getId());
        when(orderMapper.selectById(9001L)).thenReturn(order);
        when(orderService.queryById(9001L)).thenReturn(expected);

        YyOrderPaymentEntryServiceImpl service = new YyOrderPaymentEntryServiceImpl(orderMapper, paymentService, orderService, paymentEligibilityPolicy);
        YyOrderPaymentConfirmBo bo = new YyOrderPaymentConfirmBo();
        bo.setAmountCent(39900L);
        bo.setRemark("cash confirmed");

        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(1001L);
        try (MockedStatic<LoginHelper> loginHelper = mockStatic(LoginHelper.class)) {
            loginHelper.when(LoginHelper::getLoginUser).thenReturn(loginUser);

            YyOrderVo result = service.confirmPayment(9001L, bo);

            assertEquals(expected, result);
            ArgumentCaptor<IYyPaymentService.CustomerPrepayCommand> prepayCaptor = ArgumentCaptor.forClass(IYyPaymentService.CustomerPrepayCommand.class);
            verify(paymentService).createPrepayForCustomerOrder(prepayCaptor.capture());
            assertEquals("STORE_CONFIRM", prepayCaptor.getValue().provider());
            assertEquals("000000", prepayCaptor.getValue().tenantId());

            ArgumentCaptor<IYyPaymentService.PaymentMarkPaidCommand> paidCaptor = ArgumentCaptor.forClass(IYyPaymentService.PaymentMarkPaidCommand.class);
            verify(paymentService).markPaid(paidCaptor.capture());
            assertEquals("STORE_CONFIRM", paidCaptor.getValue().provider());
            assertEquals("STORE_STAFF", paidCaptor.getValue().operatorType());
            assertEquals(1001L, paidCaptor.getValue().operatorId());
            assertEquals("cash confirmed", paidCaptor.getValue().rawPayload());
        }
    }

    @Test
    void confirmPaymentShouldRejectDouyinLifeOrder() {
        YyOrder order = localOrder();
        order.setChannelType("DOUYIN_LIFE");
        when(orderMapper.selectById(9001L)).thenReturn(order);

        YyOrderPaymentEntryServiceImpl service = new YyOrderPaymentEntryServiceImpl(orderMapper, paymentService, orderService, paymentEligibilityPolicy);
        YyOrderPaymentConfirmBo bo = new YyOrderPaymentConfirmBo();
        bo.setAmountCent(39900L);

        ServiceException exception = assertThrows(ServiceException.class, () -> service.confirmPayment(9001L, bo));
        assertEquals("抖音来客订单不允许通过工作台确认收款", exception.getMessage());
    }

    @Test
    void confirmPaymentShouldRejectInvalidOrderState() {
        YyOrder order = localOrder();
        order.setPayStatus("PAID");
        when(orderMapper.selectById(9001L)).thenReturn(order);

        YyOrderPaymentEntryServiceImpl service = new YyOrderPaymentEntryServiceImpl(orderMapper, paymentService, orderService, paymentEligibilityPolicy);
        YyOrderPaymentConfirmBo bo = new YyOrderPaymentConfirmBo();
        bo.setAmountCent(39900L);

        ServiceException exception = assertThrows(ServiceException.class, () -> service.confirmPayment(9001L, bo));
        assertEquals("当前订单不是待支付状态", exception.getMessage());
    }

    private static YyOrder localOrder() {
        YyOrder order = new YyOrder();
        order.setId(9001L);
        order.setTenantId("000000");
        order.setStoreId(900001L);
        order.setCustomerPhone("13800000000");
        order.setChannelType("CLIENT_WEB");
        order.setSource("CLIENT_PUBLIC");
        order.setStatus("PENDING");
        order.setPayStatus("UNPAID");
        order.setRefundStatus("");
        order.setTotalAmountCent(39900L);
        return order;
    }
}
