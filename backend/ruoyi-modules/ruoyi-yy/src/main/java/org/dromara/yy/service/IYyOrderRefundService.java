package org.dromara.yy.service;

import org.dromara.yy.domain.bo.YyOrderRefundRequestBo;
import org.dromara.yy.domain.vo.YyRiskApprovalVo;

public interface IYyOrderRefundService {

    YyRiskApprovalVo requestRefund(Long orderId, YyOrderRefundRequestBo bo);
}
