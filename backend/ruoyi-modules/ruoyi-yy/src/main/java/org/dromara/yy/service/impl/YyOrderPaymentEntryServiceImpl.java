package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.model.LoginUser;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.satoken.utils.LoginHelper;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.bo.YyOrderPaymentConfirmBo;
import org.dromara.yy.domain.vo.YyOrderVo;
import org.dromara.yy.service.IYyOrderPaymentEntryService;
import org.dromara.yy.service.IYyOrderService;
import org.dromara.yy.service.IYyPaymentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;

/**
 * 工作台订单确认收款入口服务。
 */
@RequiredArgsConstructor
@Service
public class YyOrderPaymentEntryServiceImpl implements IYyOrderPaymentEntryService {

    private static final String PROVIDER_STORE_CONFIRM = "STORE_CONFIRM";

    private final org.dromara.yy.mapper.YyOrderMapper orderMapper;
    private final IYyPaymentService paymentService;
    private final IYyOrderService orderService;
    private final YyOrderPaymentEligibilityPolicy paymentEligibilityPolicy;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public YyOrderVo confirmPayment(Long orderId, YyOrderPaymentConfirmBo bo) {
        if (orderId == null) {
            throw new ServiceException("订单不能为空");
        }
        if (bo == null || bo.getAmountCent() == null || bo.getAmountCent() < 0) {
            throw new ServiceException("支付金额不能为空");
        }
        YyOrder order = orderMapper.selectById(orderId);
        String channelType = paymentEligibilityPolicy.validateStoreConfirmOrder(order, bo.getAmountCent());

        LoginUser loginUser = LoginHelper.getLoginUser();
        Long operatorId = loginUser == null ? null : loginUser.getUserId();

        String outTradeNo = "STOREPAY-" + order.getId() + "-" + IdWorker.getId();
        paymentService.createPrepayForCustomerOrder(new IYyPaymentService.CustomerPrepayCommand(
            order.getId(),
            order.getTenantId(),
            order.getStoreId(),
            order.getCustomerPhone(),
            PROVIDER_STORE_CONFIRM,
            outTradeNo
        ));
        paymentService.markPaid(new IYyPaymentService.PaymentMarkPaidCommand(
            order.getId(),
            order.getTenantId(),
            order.getStoreId(),
            channelType,
            PROVIDER_STORE_CONFIRM,
            outTradeNo,
            "",
            "",
            bo.getAmountCent(),
            bo.getAmountCent(),
            new Date(),
            new Date(),
            StringUtils.trimToEmpty(bo.getRemark()),
            "STORE_STAFF",
            operatorId
        ));
        return orderService.queryById(orderId);
    }
}
