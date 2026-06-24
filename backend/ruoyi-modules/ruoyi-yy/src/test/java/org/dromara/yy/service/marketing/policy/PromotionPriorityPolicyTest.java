package org.dromara.yy.service.marketing.policy;

import org.dromara.common.core.exception.ServiceException;
import org.dromara.yy.domain.bo.YyPromotionTrialBo;
import org.junit.jupiter.api.Tag;
import org.dromara.yy.domain.vo.YyPromotionTrialResultVo;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@Tag("dev")
class PromotionPriorityPolicyTest {

    private final PromotionPriorityPolicy policy = new PromotionPriorityPolicy();

    @Test
    void shouldPreferRedeemVoucherOverCampaignAndCoupon() {
        YyPromotionTrialBo bo = new YyPromotionTrialBo();
        bo.setProductName("兑换券套餐");
        bo.setOrderSource("抖音活动");
        bo.setOriginalAmountCent(19_900L);

        YyPromotionTrialResultVo result = policy.evaluate(bo);

        assertEquals("eligible", result.getStatus());
        assertEquals("REDEEM_VOUCHER", result.getAppliedRuleCode());
        assertEquals(0L, result.getFinalAmountCent());
    }

    @Test
    void shouldThrowWhenOriginalAmountIsInvalid() {
        YyPromotionTrialBo bo = new YyPromotionTrialBo();
        bo.setOriginalAmountCent(0L);
        assertThrows(ServiceException.class, () -> policy.evaluate(bo));
    }
}
