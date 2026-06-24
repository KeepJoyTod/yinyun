package org.dromara.yy.controller;

import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.idempotent.annotation.RepeatSubmit;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.web.core.BaseController;
import org.dromara.yy.domain.bo.YyMerchantDecorationBo;
import org.dromara.yy.domain.vo.YyMerchantDecorationVo;
import org.dromara.yy.service.IYyMerchantDecorationService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/merchantDecoration")
public class YyMerchantDecorationController extends BaseController {

    private final IYyMerchantDecorationService yyMerchantDecorationService;

    @GetMapping
    public R<YyMerchantDecorationVo> getCurrent(
        @RequestParam(required = false) Long storeId,
        @RequestParam(required = false) String channelType
    ) {
        return R.ok(yyMerchantDecorationService.getCurrent(storeId, channelType));
    }

    @Log(title = "Merchant Decoration", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PostMapping
    public R<YyMerchantDecorationVo> saveDraft(@RequestBody YyMerchantDecorationBo bo) {
        return R.ok(yyMerchantDecorationService.saveDraft(bo));
    }

    @Log(title = "Merchant Decoration", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PostMapping("/publish")
    public R<YyMerchantDecorationVo> publish(@RequestBody YyMerchantDecorationBo bo) {
        return R.ok(yyMerchantDecorationService.publish(bo));
    }
}
