package org.dromara.yy.service;

import org.dromara.yy.domain.bo.YyPromotionTrialBo;
import org.dromara.yy.domain.vo.YyPromotionTrialResultVo;

public interface IYyPromotionTrialService {

    YyPromotionTrialResultVo runTrial(YyPromotionTrialBo bo);
}
