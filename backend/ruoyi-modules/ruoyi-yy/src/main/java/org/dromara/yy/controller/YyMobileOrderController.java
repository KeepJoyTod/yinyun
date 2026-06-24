package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.yy.domain.vo.YyMobileOrderVo;
import org.dromara.yy.service.IYyOrderService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 移动端订单状态查询。
 */
@SaIgnore
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/mobile")
public class YyMobileOrderController {

    private final IYyOrderService yyOrderService;

    @GetMapping("/orders")
    public R<List<YyMobileOrderVo>> orders(
        @RequestParam(required = false) Long storeId,
        @RequestParam(required = false) String phone,
        @RequestParam(required = false) String phoneLast4
    ) {
        return R.ok(yyOrderService.queryMobileOrdersByPhone(storeId, phone, phoneLast4));
    }
}
