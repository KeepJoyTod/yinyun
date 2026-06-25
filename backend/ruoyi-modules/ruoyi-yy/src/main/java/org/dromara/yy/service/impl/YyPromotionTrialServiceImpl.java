package org.dromara.yy.service.impl;

import lombok.RequiredArgsConstructor;
import org.dromara.yy.domain.YyPromotionTrialSnapshot;
import org.dromara.yy.domain.bo.YyPromotionTrialBo;
import org.dromara.yy.domain.vo.YyPromotionTrialResultVo;
import org.dromara.yy.mapper.YyPromotionTrialSnapshotMapper;
import org.dromara.yy.service.IYyPromotionTrialService;
import org.dromara.yy.service.marketing.policy.PromotionPriorityPolicy;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class YyPromotionTrialServiceImpl implements IYyPromotionTrialService {

    private final YyPromotionTrialSnapshotMapper snapshotMapper;
    private final PromotionPriorityPolicy priorityPolicy = new PromotionPriorityPolicy();

    @Override
    public YyPromotionTrialResultVo runTrial(YyPromotionTrialBo bo) {
        YyPromotionTrialResultVo result = priorityPolicy.evaluate(bo);
        YyPromotionTrialSnapshot snapshot = new YyPromotionTrialSnapshot();
        snapshot.setOrderIdSnapshot(bo.getOrderId());
        snapshot.setRequestPayload(buildPayloadSnapshot(bo));
        snapshot.setAppliedRuleCode(result.getAppliedRuleCode());
        snapshot.setOriginalAmountCent(result.getOriginalAmountCent());
        snapshot.setFinalAmountCent(result.getFinalAmountCent());
        snapshot.setDiscountAmountCent(result.getDiscountAmountCent());
        snapshot.setConflictSource(result.getConflictSource());
        snapshot.setBlockedReasons(String.join(" | ", result.getBlockedReasons()));
        snapshotMapper.insert(snapshot);
        return result;
    }

    private static String buildPayloadSnapshot(YyPromotionTrialBo bo) {
        return "orderId=" + safe(bo.getOrderId())
            + ",storeId=" + safe(bo.getStoreId())
            + ",customerId=" + safe(bo.getCustomerId())
            + ",productId=" + safe(bo.getProductId())
            + ",productName=" + safe(bo.getProductName())
            + ",orderSource=" + safe(bo.getOrderSource())
            + ",customerLevel=" + safe(bo.getCustomerLevel())
            + ",originalAmountCent=" + (bo.getOriginalAmountCent() == null ? 0L : bo.getOriginalAmountCent());
    }

    private static String safe(String value) {
        return value == null ? "" : value;
    }
}
