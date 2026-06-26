package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.idempotent.annotation.RepeatSubmit;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.web.core.BaseController;
import org.dromara.yy.domain.bo.YyOrderRefundRequestBo;
import org.dromara.yy.domain.vo.YyRiskApprovalVo;
import org.dromara.yy.service.IYyOrderRefundService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/order")
public class YyOrderRefundController extends BaseController {

    private final IYyOrderRefundService orderRefundService;

    @SaCheckPermission("yy:order:edit")
    @Log(title = "预约订单退款申请", businessType = BusinessType.UPDATE)
    @RepeatSubmit
    @PostMapping("/{id}/refund/request")
    public R<YyRiskApprovalVo> requestRefund(@NotNull(message = "id is required") @PathVariable Long id,
                                             @Validated @RequestBody YyOrderRefundRequestBo bo) {
        return R.ok(orderRefundService.requestRefund(id, bo));
    }
}
