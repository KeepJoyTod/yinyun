package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.yy.domain.vo.YyOrderAnalysisScaffoldVo;
import org.dromara.yy.service.IYyOrderAnalysisService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/reportOrderAnalysis")
public class YyOrderAnalysisController {

    private final IYyOrderAnalysisService yyOrderAnalysisService;

    @SaCheckPermission("yy:report:list")
    @GetMapping("/overview")
    public R<YyOrderAnalysisScaffoldVo> overview(
        @RequestParam(required = false) Long storeId,
        @RequestParam(required = false) String dateFrom,
        @RequestParam(required = false) String dateTo
    ) {
        return R.ok(yyOrderAnalysisService.queryOverview(storeId, dateFrom, dateTo));
    }
}
