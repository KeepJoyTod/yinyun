package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.yy.domain.bo.YyCustomerExperienceP1ReviewDraftBo;
import org.dromara.yy.domain.vo.YyCustomerExperienceP1AssetSummaryVo;
import org.dromara.yy.domain.vo.YyCustomerExperienceP1BookingOptionsVo;
import org.dromara.yy.domain.vo.YyCustomerExperienceP1OrderVerificationVo;
import org.dromara.yy.domain.vo.YyCustomerExperienceP1ReviewDraftResultVo;
import org.dromara.yy.service.IYyClientExperienceP1Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@SaIgnore
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/customer/experience-p1")
public class YyClientExperienceP1Controller {

    private final IYyClientExperienceP1Service yyClientExperienceP1Service;

    @GetMapping("/booking-options")
    public R<YyCustomerExperienceP1BookingOptionsVo> bookingOptions(
        @RequestParam(required = false) Long productId,
        @RequestParam(required = false) Long storeId
    ) {
        return R.ok(yyClientExperienceP1Service.bookingOptions(productId, storeId));
    }

    @GetMapping("/asset-summary")
    public R<YyCustomerExperienceP1AssetSummaryVo> assetSummary() {
        return R.ok(yyClientExperienceP1Service.assetSummary());
    }

    @GetMapping("/order-verification/{orderId}")
    public R<YyCustomerExperienceP1OrderVerificationVo> orderVerification(@PathVariable String orderId) {
        return R.ok(yyClientExperienceP1Service.orderVerification(orderId));
    }

    @PostMapping("/review-drafts")
    public R<YyCustomerExperienceP1ReviewDraftResultVo> createReviewDraft(
        @RequestBody(required = false) YyCustomerExperienceP1ReviewDraftBo bo
    ) {
        return R.ok(yyClientExperienceP1Service.createReviewDraft(bo));
    }
}
