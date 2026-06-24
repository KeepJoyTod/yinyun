package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.idempotent.annotation.RepeatSubmit;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.web.core.BaseController;
import org.dromara.yy.domain.bo.YyOrderPaymentConfirmBo;
import org.dromara.yy.domain.vo.YyOrderVo;
import org.dromara.yy.service.IYyOrderPaymentEntryService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 订单支付入口控制器。
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/order")
public class YyOrderPaymentController extends BaseController {

    private final IYyOrderPaymentEntryService yyOrderPaymentEntryService;

    @SaCheckPermission("yy:order:edit")
    @Log(title = "预约订单确认收款", businessType = BusinessType.UPDATE)
    @RepeatSubmit
    @PostMapping("/{id}/payment/confirm")
    public R<YyOrderVo> confirmPayment(@NotNull(message = "主键不能为空") @PathVariable Long id,
                                       @Validated @RequestBody YyOrderPaymentConfirmBo bo) {
        return R.ok(yyOrderPaymentEntryService.confirmPayment(id, bo));
    }
}
