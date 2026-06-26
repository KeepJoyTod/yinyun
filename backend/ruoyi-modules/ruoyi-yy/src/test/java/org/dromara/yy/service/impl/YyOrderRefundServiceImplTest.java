package org.dromara.yy.service.impl;

import org.dromara.common.core.exception.ServiceException;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.bo.YyOrderRefundRequestBo;
import org.dromara.yy.domain.vo.YyRiskApprovalVo;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.service.IYyRiskApprovalService;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@Tag("dev")
class YyOrderRefundServiceImplTest {

    @Mock
    private YyOrderMapper orderMapper;

    @Mock
    private IYyRiskApprovalService riskApprovalService;

    @InjectMocks
    private YyOrderRefundServiceImpl service;

    @Test
    void requestRefundShouldCreatePendingApprovalForPaidOrder() {
        YyOrder order = paidOrder();
        when(orderMapper.selectById(1001L)).thenReturn(order);
        YyRiskApprovalVo approval = new YyRiskApprovalVo();
        approval.setId(7001L);
        when(riskApprovalService.createPending(any())).thenReturn(approval);

        YyOrderRefundRequestBo bo = new YyOrderRefundRequestBo();
        bo.setRefundAmountCent(5000L);
        bo.setReason("customer refund");

        YyRiskApprovalVo result = service.requestRefund(1001L, bo);

        assertEquals(7001L, result.getId());
        ArgumentCaptor<IYyRiskApprovalService.CreateRiskApprovalCommand> captor =
            ArgumentCaptor.forClass(IYyRiskApprovalService.CreateRiskApprovalCommand.class);
        verify(riskApprovalService).createPending(captor.capture());
        assertEquals(IYyRiskApprovalService.BUSINESS_ORDER_REFUND, captor.getValue().businessType());
        assertEquals(1001L, captor.getValue().businessId());
    }

    @Test
    void requestRefundShouldRejectUnpaidOrder() {
        YyOrder order = paidOrder();
        order.setPayStatus("UNPAID");
        when(orderMapper.selectById(1001L)).thenReturn(order);

        YyOrderRefundRequestBo bo = new YyOrderRefundRequestBo();
        bo.setRefundAmountCent(5000L);

        assertThrows(ServiceException.class, () -> service.requestRefund(1001L, bo));
        verify(riskApprovalService, never()).createPending(any());
    }

    private static YyOrder paidOrder() {
        YyOrder order = new YyOrder();
        order.setId(1001L);
        order.setStoreId(9001L);
        order.setOrderNo("YY20260625001");
        order.setPayStatus("PAID");
        order.setPaidAmountCent(10000L);
        order.setTotalAmountCent(10000L);
        return order;
    }
}
