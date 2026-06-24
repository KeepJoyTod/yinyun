package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.common.idempotent.annotation.RepeatSubmit;
import org.dromara.common.ratelimiter.annotation.RateLimiter;
import org.dromara.common.ratelimiter.enums.LimitType;
import org.dromara.yy.domain.bo.ClientBookingIntentRequest;
import org.dromara.yy.domain.vo.ClientBookingIntentVo;
import org.dromara.yy.service.IYyOrderService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.concurrent.TimeUnit;

/**
 * 客户电脑网页预约入口。
 */
@SaIgnore
@RequiredArgsConstructor
@RestController
@RequestMapping("/client/booking")
public class YyClientBookingController {

    private final IYyOrderService orderService;

    @PostMapping("/intent")
    @RateLimiter(time = 60, count = 10, limitType = LimitType.IP)
    @RepeatSubmit(interval = 5, timeUnit = TimeUnit.SECONDS, message = "预约已提交，请勿重复提交")
    public R<ClientBookingIntentVo> create(@Valid @RequestBody ClientBookingIntentRequest request, HttpServletRequest servletRequest) {
        return create(request, clientIp(servletRequest));
    }

    R<ClientBookingIntentVo> create(ClientBookingIntentRequest request, String clientIp) {
        return R.ok(orderService.createClientBookingIntent(request, clientIp));
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (StringUtils.isNotBlank(forwarded)) {
            return clientIp(forwarded);
        }
        return request.getRemoteAddr();
    }

    private String clientIp(String forwardedFor) {
        if (StringUtils.isBlank(forwardedFor)) {
            return "";
        }
        return forwardedFor.split(",")[0].trim();
    }
}
