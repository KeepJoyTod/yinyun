package org.dromara.yy.service;

import org.dromara.yy.domain.bo.YyMemberRechargeCreateBo;
import org.dromara.yy.domain.vo.YyMemberRechargeOrderVo;

import java.util.List;

public interface IYyMemberRechargeService {

    YyMemberRechargeOrderVo createRechargeOrder(Long customerId, YyMemberRechargeCreateBo bo);

    YyMemberRechargeOrderVo confirmRechargeOrder(Long rechargeOrderId);

    List<YyMemberRechargeOrderVo> listRechargeOrders(Long customerId, int limit);
}
