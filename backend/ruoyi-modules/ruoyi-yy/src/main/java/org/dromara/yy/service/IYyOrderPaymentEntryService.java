package org.dromara.yy.service;

import org.dromara.yy.domain.bo.YyOrderPaymentConfirmBo;
import org.dromara.yy.domain.vo.YyOrderVo;

/**
 * 工作台订单支付入口服务。
 */
public interface IYyOrderPaymentEntryService {

    YyOrderVo confirmPayment(Long orderId, YyOrderPaymentConfirmBo bo);
}
