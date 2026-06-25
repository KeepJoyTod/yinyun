package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.web.core.BaseController;
import org.dromara.yy.domain.bo.YyMemberStoredValueTransactionQueryBo;
import org.dromara.yy.domain.vo.YyMemberRechargeCapabilityVo;
import org.dromara.yy.domain.vo.YyMemberRechargeSettingVo;
import org.dromara.yy.domain.vo.YyMemberStoredValueTransactionVo;
import org.dromara.yy.service.IYyMemberStoredValueService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/member")
public class YyMemberStoredValueController extends BaseController {

    private final IYyMemberStoredValueService yyMemberStoredValueService;

    @SaCheckPermission("yy:customer:list")
    @GetMapping("/recharge-setting")
    public R<YyMemberRechargeSettingVo> getRechargeSetting() {
        return R.ok(yyMemberStoredValueService.getRechargeSetting());
    }

    @SaCheckPermission("yy:customer:list")
    @GetMapping("/recharge-capability")
    public R<YyMemberRechargeCapabilityVo> getRechargeCapability() {
        return R.ok(yyMemberStoredValueService.getRechargeCapability());
    }

    @SaCheckPermission("yy:customer:list")
    @GetMapping("/stored-value-transactions")
    public R<List<YyMemberStoredValueTransactionVo>> listStoredValueTransactions(YyMemberStoredValueTransactionQueryBo bo) {
        return R.ok(yyMemberStoredValueService.listStoredValueTransactions(bo));
    }
}
