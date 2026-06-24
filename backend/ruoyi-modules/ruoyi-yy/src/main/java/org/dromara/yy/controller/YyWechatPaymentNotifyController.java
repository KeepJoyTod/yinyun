package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.dromara.yy.service.IYyWechatPaymentNotifyService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 微信支付成功回调入口。
 */
@SaIgnore
@RequiredArgsConstructor
@RestController
public class YyWechatPaymentNotifyController {

    private final IYyWechatPaymentNotifyService wechatPaymentNotifyService;

    @PostMapping("/api/customer/pay/wechat/notify")
    public Map<String, Object> notify(
        @RequestBody(required = false) String payload,
        @RequestHeader Map<String, String> headers,
        HttpServletRequest request
    ) {
        return wechatPaymentNotifyService.handleNotify(payload, headers, request.getQueryString());
    }
}
