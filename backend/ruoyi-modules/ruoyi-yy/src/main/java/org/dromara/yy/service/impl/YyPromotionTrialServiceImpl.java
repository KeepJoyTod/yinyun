package org.dromara.yy.service.impl;

import org.dromara.yy.domain.bo.YyPromotionTrialBo;
import org.dromara.yy.domain.vo.YyPromotionTrialResultVo;
import org.dromara.yy.service.IYyPromotionTrialService;
import org.dromara.yy.service.marketing.policy.PromotionPriorityPolicy;
import org.springframework.stereotype.Service;

@Service
public class YyPromotionTrialServiceImpl implements IYyPromotionTrialService {

    private final PromotionPriorityPolicy priorityPolicy = new PromotionPriorityPolicy();

    @Override
    public YyPromotionTrialResultVo runTrial(YyPromotionTrialBo bo) {
        return priorityPolicy.evaluate(bo);
    }
}
