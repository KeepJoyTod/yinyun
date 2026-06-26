package org.dromara.yy.service;

import org.dromara.yy.domain.bo.YyCustomerExperienceP1ReviewDraftBo;
import org.dromara.yy.domain.vo.YyCustomerExperienceP1AssetSummaryVo;
import org.dromara.yy.domain.vo.YyCustomerExperienceP1BookingOptionsVo;
import org.dromara.yy.domain.vo.YyCustomerExperienceP1OrderVerificationVo;
import org.dromara.yy.domain.vo.YyCustomerExperienceP1ReviewDraftResultVo;

public interface IYyClientExperienceP1Service {

    YyCustomerExperienceP1BookingOptionsVo bookingOptions(Long productId, Long storeId);

    YyCustomerExperienceP1AssetSummaryVo assetSummary();

    YyCustomerExperienceP1OrderVerificationVo orderVerification(String orderId);

    YyCustomerExperienceP1ReviewDraftResultVo createReviewDraft(YyCustomerExperienceP1ReviewDraftBo bo);
}
