package org.dromara.yy.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.bo.YyOrderRefundRequestBo;
import org.dromara.yy.domain.vo.YyRiskApprovalVo;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.service.IYyOrderRefundService;
import org.dromara.yy.service.IYyRiskApprovalService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@RequiredArgsConstructor
@Service
public class YyOrderRefundServiceImpl implements IYyOrderRefundService {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final String PAY_STATUS_PAID = "PAID";

    private final YyOrderMapper orderMapper;
    private final IYyRiskApprovalService riskApprovalService;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyRiskApprovalVo requestRefund(Long orderId, YyOrderRefundRequestBo bo) {
        if (orderId == null) {
            throw new ServiceException("order id is required");
        }
        if (bo == null || bo.getRefundAmountCent() == null || bo.getRefundAmountCent() <= 0) {
            throw new ServiceException("refund amount is invalid");
        }
        YyOrder order = orderMapper.selectById(orderId);
        if (order == null) {
            throw new ServiceException("order not found");
        }
        if (!PAY_STATUS_PAID.equalsIgnoreCase(StringUtils.trimToEmpty(order.getPayStatus()))) {
            throw new ServiceException("only paid orders can request refund");
        }
        if (StringUtils.isNotBlank(order.getRefundStatus()) || defaultLong(order.getRefundAmountCent(), 0L) > 0) {
            throw new ServiceException("order already has refund fact");
        }
        long paidAmountCent = defaultLong(order.getPaidAmountCent(), order.getTotalAmountCent());
        if (bo.getRefundAmountCent() > paidAmountCent) {
            throw new ServiceException("refund amount exceeds paid amount");
        }
        String payloadJson = toJson(Map.of(
            "orderId", order.getId(),
            "refundAmountCent", bo.getRefundAmountCent(),
            "paidAmountCent", paidAmountCent
        ));
        return riskApprovalService.createPending(new IYyRiskApprovalService.CreateRiskApprovalCommand(
            order.getStoreId(),
            IYyRiskApprovalService.BUSINESS_ORDER_REFUND,
            order.getId(),
            StringUtils.defaultIfBlank(order.getOrderNo(), String.valueOf(order.getId())),
            "Order refund request",
            StringUtils.defaultIfBlank(bo.getReason(), "manual refund request"),
            payloadJson
        ));
    }

    private static String toJson(Object value) {
        try {
            return OBJECT_MAPPER.writeValueAsString(value);
        } catch (Exception ignored) {
            return "{}";
        }
    }

    private static Long defaultLong(Long value, Long fallback) {
        return value == null ? fallback : value;
    }
}
