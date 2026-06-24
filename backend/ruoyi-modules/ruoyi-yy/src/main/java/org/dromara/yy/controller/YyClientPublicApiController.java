package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.yy.domain.bo.ClientCustomerBindPhoneBo;
import org.dromara.yy.domain.bo.ClientCustomerLoginBo;
import org.dromara.yy.domain.bo.ClientCustomerOrderCancelBo;
import org.dromara.yy.domain.bo.ClientCustomerOrderCreateBo;
import org.dromara.yy.domain.bo.ClientCustomerOrderRescheduleBo;
import org.dromara.yy.service.IYyClientPublicApiService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Joe/uniapp 客户公开接口。
 */
@SaIgnore
@RequiredArgsConstructor
@RestController
public class YyClientPublicApiController {

    private final IYyClientPublicApiService clientPublicApiService;

    @GetMapping("/api/public/brand/{brandCode}")
    public R<Map<String, Object>> brand(@PathVariable String brandCode) {
        return R.ok(clientPublicApiService.brand(brandCode));
    }

    @GetMapping("/api/public/pages/home")
    public R<Map<String, Object>> home(@RequestParam(required = false) String brandCode) {
        return R.ok(clientPublicApiService.home(brandCode));
    }

    @GetMapping("/api/public/stores")
    public R<List<Map<String, Object>>> stores(
        @RequestParam(required = false) String brandCode,
        @RequestParam(required = false) String keyword
    ) {
        return R.ok(clientPublicApiService.stores(brandCode, keyword));
    }

    @GetMapping("/api/public/stores/{storeId}/products")
    public R<Map<String, Object>> storeProducts(@PathVariable Long storeId) {
        return R.ok(clientPublicApiService.storeProducts(storeId));
    }

    @GetMapping("/api/public/products/{productId}")
    public R<Map<String, Object>> productDetail(@PathVariable Long productId) {
        return R.ok(clientPublicApiService.productDetail(productId));
    }

    @GetMapping("/api/public/stores/{storeId}/slots")
    public R<List<Map<String, Object>>> storeSlots(
        @PathVariable Long storeId,
        @RequestParam String date,
        @RequestParam(required = false) Long productId
    ) {
        return R.ok(clientPublicApiService.storeSlots(storeId, date, productId));
    }

    @PostMapping("/api/customer/auth/wechat-login")
    public R<Map<String, Object>> customerLogin(@Valid @RequestBody ClientCustomerLoginBo bo) {
        return R.ok(clientPublicApiService.customerLogin(bo));
    }

    @PostMapping("/api/customer/auth/bind-phone")
    public R<Map<String, Object>> bindPhone(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @Valid @RequestBody ClientCustomerBindPhoneBo bo
    ) {
        return R.ok(clientPublicApiService.bindPhone(authorization, bo));
    }

    @GetMapping("/api/customer/profile")
    public R<Map<String, Object>> profile(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return R.ok(clientPublicApiService.customerProfile(authorization));
    }

    @GetMapping("/api/customer/orders/summary")
    public R<Map<String, Object>> orderSummary(@RequestHeader(value = "Authorization", required = false) String authorization) {
        return R.ok(clientPublicApiService.orderSummary(authorization));
    }

    @GetMapping("/api/customer/orders")
    public R<Map<String, Object>> orders(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @RequestParam(required = false) Integer page,
        @RequestParam(required = false) Integer size,
        @RequestParam(required = false) String status
    ) {
        return R.ok(clientPublicApiService.customerOrders(authorization, page, size, status));
    }

    @GetMapping("/api/customer/orders/{orderId}")
    public R<Map<String, Object>> order(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @PathVariable Long orderId
    ) {
        return R.ok(clientPublicApiService.customerOrder(authorization, orderId));
    }

    @PostMapping("/api/customer/orders")
    public R<Map<String, Object>> createOrder(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @Valid @RequestBody ClientCustomerOrderCreateBo bo
    ) {
        return R.ok(clientPublicApiService.createCustomerOrder(authorization, bo));
    }

    @PostMapping("/api/customer/orders/{orderId}/pay")
    public R<Map<String, Object>> payOrder(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @PathVariable Long orderId
    ) {
        return R.ok(clientPublicApiService.payCustomerOrder(authorization, orderId));
    }

    @PostMapping("/api/customer/orders/{orderId}/cancel")
    public R<Map<String, Object>> cancelOrder(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @PathVariable Long orderId,
        @RequestBody(required = false) ClientCustomerOrderCancelBo bo
    ) {
        return R.ok(clientPublicApiService.cancelCustomerOrder(authorization, orderId, bo));
    }

    @PostMapping("/api/customer/orders/{orderId}/reschedule")
    public R<Map<String, Object>> rescheduleOrder(
        @RequestHeader(value = "Authorization", required = false) String authorization,
        @PathVariable Long orderId,
        @Valid @RequestBody ClientCustomerOrderRescheduleBo bo
    ) {
        return R.ok(clientPublicApiService.rescheduleCustomerOrder(authorization, orderId, bo));
    }
}
