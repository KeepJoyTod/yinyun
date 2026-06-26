package org.dromara.yy.service;

import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.yy.domain.bo.YyRiskApprovalDecisionBo;
import org.dromara.yy.domain.bo.YyRiskApprovalQueryBo;
import org.dromara.yy.domain.vo.YyRiskApprovalVo;

public interface IYyRiskApprovalService {

    String BUSINESS_SLOT_CLOSE_WITH_PAID_ORDER = "SLOT_CLOSE_WITH_PAID_ORDER";
    String BUSINESS_ORDER_REFUND = "ORDER_REFUND";
    String BUSINESS_MEMBER_RECHARGE_CONFIRM = "MEMBER_RECHARGE_CONFIRM";
    String BUSINESS_MEMBER_WITHDRAW_APPLY = "MEMBER_WITHDRAW_APPLY";
    String BUSINESS_CARD_BATCH_ORDER_APPLY = "CARD_BATCH_ORDER_APPLY";

    String STATUS_PENDING = "PENDING";
    String STATUS_APPROVED = "APPROVED";
    String STATUS_REJECTED = "REJECTED";
    String STATUS_CANCELLED = "CANCELLED";

    TableDataInfo<YyRiskApprovalVo> queryPageList(YyRiskApprovalQueryBo bo, PageQuery pageQuery);

    YyRiskApprovalVo createPending(CreateRiskApprovalCommand command);

    YyRiskApprovalVo approve(Long id, YyRiskApprovalDecisionBo bo);

    YyRiskApprovalVo reject(Long id, YyRiskApprovalDecisionBo bo);

    record CreateRiskApprovalCommand(
        Long storeId,
        String businessType,
        Long businessId,
        String businessNo,
        String title,
        String reason,
        String payloadJson
    ) {
    }
}
