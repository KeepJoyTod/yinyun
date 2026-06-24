package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import lombok.RequiredArgsConstructor;
import org.dromara.yy.channel.douyin.DouyinLifeChannelAdapter;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 * 抖音生活服务公网 SPI 回调入口。
 */
@SaIgnore
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/douyin/life")
public class YyDouyinLifeSpiController {

    private final DouyinLifeChannelAdapter douyinLifeChannelAdapter;

    @PostMapping(value = "/webhook", produces = MediaType.APPLICATION_JSON_VALUE)
    public Object webhook(
        @RequestBody(required = false) String payload,
        @RequestHeader Map<String, String> headers,
        HttpServletRequest request
    ) {
        Object response = douyinLifeChannelAdapter.handleOpenPlatformWebhook(payload, headers, request.getQueryString());
        if (response instanceof String challenge) {
            return Map.of("challenge", challenge);
        }
        return response;
    }

    @PostMapping("/tripartite-code/create")
    public Map<String, Object> tripartiteCodeCreate(
        @RequestBody(required = false) String payload,
        @RequestHeader Map<String, String> headers,
        HttpServletRequest request
    ) {
        return douyinLifeChannelAdapter.issueTripartiteCode(payload, headers, request.getQueryString());
    }

    @PostMapping("/voucher/batch-revoke")
    public Map<String, Object> voucherBatchRevoke(
        @RequestBody(required = false) String payload,
        @RequestHeader Map<String, String> headers,
        HttpServletRequest request
    ) {
        return douyinLifeChannelAdapter.handleLifeSpi("voucher_batch_revoke", payload, headers, request.getQueryString());
    }

    @PostMapping("/voucher/revoke")
    public Map<String, Object> voucherRevoke(
        @RequestBody(required = false) String payload,
        @RequestHeader Map<String, String> headers,
        HttpServletRequest request
    ) {
        return douyinLifeChannelAdapter.handleLifeSpi("voucher_revoke", payload, headers, request.getQueryString());
    }

    @PostMapping("/refund/apply")
    public Map<String, Object> refundApply(
        @RequestBody(required = false) String payload,
        @RequestHeader Map<String, String> headers,
        HttpServletRequest request
    ) {
        return douyinLifeChannelAdapter.handleLifeSpi("refund_apply", payload, headers, request.getQueryString());
    }

    @PostMapping("/refund/notify")
    public Map<String, Object> refundNotify(
        @RequestBody(required = false) String payload,
        @RequestHeader Map<String, String> headers,
        HttpServletRequest request
    ) {
        return douyinLifeChannelAdapter.handleLifeSpi("refund_notify", payload, headers, request.getQueryString());
    }

    @PostMapping("/order/query")
    public Map<String, Object> lifeOrderQuery(
        @RequestBody(required = false) String payload,
        @RequestHeader Map<String, String> headers,
        HttpServletRequest request
    ) {
        return douyinLifeChannelAdapter.handleLifeSpi("life_order_query", payload, headers, request.getQueryString());
    }

    @PostMapping("/fulfil/check-info-sync")
    public Map<String, Object> fulfilCheckInfoSync(
        @RequestBody(required = false) String payload,
        @RequestHeader Map<String, String> headers,
        HttpServletRequest request
    ) {
        return douyinLifeChannelAdapter.handleLifeSpi("fulfil_check_info_sync", payload, headers, request.getQueryString());
    }

    @PostMapping("/reservation/order-create")
    public Map<String, Object> reservationOrderCreate(
        @RequestBody(required = false) String payload,
        @RequestHeader Map<String, String> headers,
        HttpServletRequest request
    ) {
        return douyinLifeChannelAdapter.handleLifeSpi("reservation_order_create", payload, headers, request.getQueryString());
    }

    @PostMapping("/reservation/pay-notify")
    public Map<String, Object> reservationPayNotify(
        @RequestBody(required = false) String payload,
        @RequestHeader Map<String, String> headers,
        HttpServletRequest request
    ) {
        return douyinLifeChannelAdapter.handleLifeSpi("reservation_pay_notify", payload, headers, request.getQueryString());
    }

    @PostMapping("/reservation/order-query")
    public Map<String, Object> reservationOrderQuery(
        @RequestBody(required = false) String payload,
        @RequestHeader Map<String, String> headers,
        HttpServletRequest request
    ) {
        return douyinLifeChannelAdapter.handleLifeSpi("reservation_order_query", payload, headers, request.getQueryString());
    }

    @PostMapping("/reservation/stock-query")
    public Map<String, Object> reservationStockQuery(
        @RequestBody(required = false) String payload,
        @RequestHeader Map<String, String> headers,
        HttpServletRequest request
    ) {
        return douyinLifeChannelAdapter.handleLifeSpi("reservation_stock_query", payload, headers, request.getQueryString());
    }
}
