package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.yy.domain.bo.YyFinanceTransactionQueryBo;
import org.dromara.yy.domain.vo.YyFinanceOverviewVo;
import org.dromara.yy.domain.vo.YyFinanceTransactionVo;
import org.dromara.yy.service.IYyFinanceCenterService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/finance-center")
public class YyFinanceCenterController {

    private final IYyFinanceCenterService yyFinanceCenterService;

    @SaCheckPermission("yy:dashboard:list")
    @GetMapping("/overview")
    public R<YyFinanceOverviewVo> overview() {
        return R.ok(yyFinanceCenterService.getOverview());
    }

    @SaCheckPermission("yy:dashboard:list")
    @GetMapping("/transactions")
    public R<List<YyFinanceTransactionVo>> transactions(@Validated @ModelAttribute YyFinanceTransactionQueryBo bo) {
        return R.ok(yyFinanceCenterService.listTransactions(bo));
    }
}
