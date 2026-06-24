package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.idempotent.annotation.RepeatSubmit;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.web.core.BaseController;
import org.dromara.yy.domain.bo.YyMemberRechargeCreateBo;
import org.dromara.yy.domain.vo.YyMemberRechargeOrderVo;
import org.dromara.yy.service.IYyMemberRechargeService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/member")
public class YyMemberRechargeController extends BaseController {

    private final IYyMemberRechargeService yyMemberRechargeService;

    @SaCheckPermission("yy:customer:edit")
    @Log(title = "会员手工充值建单", businessType = BusinessType.INSERT)
    @RepeatSubmit
    @PostMapping("/customer/{customerId}/recharge-orders")
    public R<YyMemberRechargeOrderVo> createRechargeOrder(
        @NotNull(message = "客户ID不能为空") @PathVariable Long customerId,
        @Validated @RequestBody YyMemberRechargeCreateBo bo
    ) {
        return R.ok(yyMemberRechargeService.createRechargeOrder(customerId, bo));
    }

    @SaCheckPermission("yy:customer:edit")
    @Log(title = "会员手工充值确认到账", businessType = BusinessType.UPDATE)
    @RepeatSubmit
    @PostMapping("/recharge-orders/{rechargeOrderId}/confirm")
    public R<YyMemberRechargeOrderVo> confirmRechargeOrder(
        @NotNull(message = "充值单ID不能为空") @PathVariable Long rechargeOrderId
    ) {
        return R.ok(yyMemberRechargeService.confirmRechargeOrder(rechargeOrderId));
    }
}
