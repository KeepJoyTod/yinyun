package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.idempotent.annotation.RepeatSubmit;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.web.core.BaseController;
import org.dromara.yy.domain.bo.YyCardBatchOrderCreateBo;
import org.dromara.yy.domain.bo.YyCardBatchOrderQueryBo;
import org.dromara.yy.domain.vo.YyCardBatchOrderVo;
import org.dromara.yy.service.IYyCardBatchOrderService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/card-batch-orders")
public class YyCardBatchOrderController extends BaseController {

    private final IYyCardBatchOrderService cardBatchOrderService;

    @SaCheckPermission("yy:order:add")
    @GetMapping
    public R<List<YyCardBatchOrderVo>> listCardBatchOrders(YyCardBatchOrderQueryBo bo) {
        return R.ok(cardBatchOrderService.listCardBatchOrders(bo));
    }

    @SaCheckPermission("yy:order:add")
    @Log(title = "批量开卡审批申请", businessType = BusinessType.INSERT)
    @RepeatSubmit
    @PostMapping
    public R<YyCardBatchOrderVo> createCardBatchOrder(@Valid @RequestBody YyCardBatchOrderCreateBo bo) {
        return R.ok(cardBatchOrderService.createCardBatchOrder(bo));
    }
}
