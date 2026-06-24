package org.dromara.yy.service;

import org.dromara.yy.domain.bo.YyMemberRechargeCreateBo;
import org.dromara.yy.domain.vo.YyMemberRechargeOrderVo;

public interface IYyMemberRechargeService {

    YyMemberRechargeOrderVo createRechargeOrder(Long customerId, YyMemberRechargeCreateBo bo);

    YyMemberRechargeOrderVo confirmRechargeOrder(Long rechargeOrderId);
}
