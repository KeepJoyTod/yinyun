package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.yy.domain.bo.YyPromotionTrialBo;
import org.dromara.yy.domain.vo.YyPromotionTrialResultVo;
import org.dromara.yy.service.IYyPromotionTrialService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/promotionTrial")
public class YyPromotionTrialController {

    private final IYyPromotionTrialService promotionTrialService;

    @SaCheckPermission("yy:order:list")
    @PostMapping("/run")
    public R<YyPromotionTrialResultVo> run(@RequestBody YyPromotionTrialBo bo) {
        return R.ok(promotionTrialService.runTrial(bo));
    }
}
