package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.yy.domain.bo.ClientOrderVerifyRequest;
import org.dromara.yy.domain.vo.ClientOrderLinkVo;
import org.dromara.yy.domain.vo.ClientOrderTokenVo;
import org.dromara.yy.service.IYyOrderService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 客户端订单查询。
 */
@SaIgnore
@RequiredArgsConstructor
@RestController
@RequestMapping("/client/orders")
public class YyClientOrderController {

    private final IYyOrderService yyOrderService;

    @GetMapping("/by-phone")
    public R<List<ClientOrderLinkVo>> byPhone(
        @RequestParam(required = false) Long storeId,
        @RequestParam(required = false) String phone,
        @RequestParam(required = false) String phoneLast4
    ) {
        return R.ok(yyOrderService.queryClientOrderLinksByPhone(storeId, phone, phoneLast4));
    }

    @PostMapping("/auth/verify")
    public R<ClientOrderTokenVo> verify(@RequestBody ClientOrderVerifyRequest request) {
        return R.ok(yyOrderService.verifyClientOrderAccess(request.getStoreId(), request.getPhone(), request.getPhoneLast4()));
    }

    @GetMapping
    public R<List<ClientOrderLinkVo>> listByToken(
        @RequestHeader(value = "X-Client-Order-Token", required = false) String clientOrderToken
    ) {
        return R.ok(yyOrderService.queryClientOrderLinksByToken(clientOrderToken));
    }

    @GetMapping("/{orderNo}")
    public R<ClientOrderLinkVo> detailByToken(
        @PathVariable String orderNo,
        @RequestHeader(value = "X-Client-Order-Token", required = false) String clientOrderToken
    ) {
        return R.ok(yyOrderService.queryClientOrderLinkByToken(orderNo, clientOrderToken));
    }
}
