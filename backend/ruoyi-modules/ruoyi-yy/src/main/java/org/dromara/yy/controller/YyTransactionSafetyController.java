package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.web.core.BaseController;
import org.dromara.yy.domain.bo.YyCompositePaymentCreateBo;
import org.dromara.yy.domain.bo.YyEntitlementReservationCreateBo;
import org.dromara.yy.domain.bo.YyMemberWithdrawCreateBo;
import org.dromara.yy.domain.bo.YyStoredValueConsumeCreateBo;
import org.dromara.yy.domain.bo.YyTransactionSafetyActionBo;
import org.dromara.yy.domain.bo.YyTransactionSafetyQueryBo;
import org.dromara.yy.domain.vo.YyCompositePaymentOrderVo;
import org.dromara.yy.domain.vo.YyEntitlementReservationVo;
import org.dromara.yy.domain.vo.YyMemberWithdrawOrderVo;
import org.dromara.yy.domain.vo.YyStoredValueConsumeOrderVo;
import org.dromara.yy.service.IYyTransactionSafetyService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/transaction-safety")
public class YyTransactionSafetyController extends BaseController {

    private final IYyTransactionSafetyService transactionSafetyService;

    @SaCheckPermission("yy:customer:list")
    @GetMapping("/entitlement-reservations")
    public R<List<YyEntitlementReservationVo>> listEntitlementReservations(YyTransactionSafetyQueryBo bo) {
        return R.ok(transactionSafetyService.listEntitlementReservations(bo));
    }

    @SaCheckPermission("yy:customer:list")
    @PostMapping("/entitlement-reservations")
    public R<YyEntitlementReservationVo> createEntitlementReservation(@Valid @RequestBody YyEntitlementReservationCreateBo bo) {
        return R.ok(transactionSafetyService.createEntitlementReservation(bo));
    }

    @SaCheckPermission("yy:customer:list")
    @PostMapping("/entitlement-reservations/{id}/release")
    public R<YyEntitlementReservationVo> releaseEntitlementReservation(@PathVariable Long id, @RequestBody(required = false) YyTransactionSafetyActionBo bo) {
        return R.ok(transactionSafetyService.releaseEntitlementReservation(id, bo));
    }

    @SaCheckPermission("yy:customer:list")
    @PostMapping("/entitlement-reservations/{id}/fulfill")
    public R<YyEntitlementReservationVo> fulfillEntitlementReservation(@PathVariable Long id, @RequestBody(required = false) YyTransactionSafetyActionBo bo) {
        return R.ok(transactionSafetyService.fulfillEntitlementReservation(id, bo));
    }

    @SaCheckPermission("yy:customer:list")
    @PostMapping("/entitlement-reservations/release-expired")
    public R<List<YyEntitlementReservationVo>> releaseExpiredEntitlementReservations(@RequestBody(required = false) YyTransactionSafetyActionBo bo) {
        return R.ok(transactionSafetyService.releaseExpiredEntitlementReservations(bo));
    }

    @SaCheckPermission("yy:customer:list")
    @GetMapping("/composite-payments")
    public R<List<YyCompositePaymentOrderVo>> listCompositePayments(YyTransactionSafetyQueryBo bo) {
        return R.ok(transactionSafetyService.listCompositePayments(bo));
    }

    @SaCheckPermission("yy:customer:list")
    @PostMapping("/composite-payments")
    public R<YyCompositePaymentOrderVo> createCompositePayment(@Valid @RequestBody YyCompositePaymentCreateBo bo) {
        return R.ok(transactionSafetyService.createCompositePayment(bo));
    }

    @SaCheckPermission("yy:customer:list")
    @PostMapping("/composite-payments/{id}/confirm")
    public R<YyCompositePaymentOrderVo> confirmCompositePayment(@PathVariable Long id, @RequestBody(required = false) YyTransactionSafetyActionBo bo) {
        return R.ok(transactionSafetyService.confirmCompositePayment(id, bo));
    }

    @SaCheckPermission("yy:customer:list")
    @PostMapping("/composite-payments/{id}/fail")
    public R<YyCompositePaymentOrderVo> failCompositePayment(@PathVariable Long id, @RequestBody(required = false) YyTransactionSafetyActionBo bo) {
        return R.ok(transactionSafetyService.failCompositePayment(id, bo));
    }

    @SaCheckPermission("yy:customer:list")
    @GetMapping("/stored-value-consumes")
    public R<List<YyStoredValueConsumeOrderVo>> listStoredValueConsumes(YyTransactionSafetyQueryBo bo) {
        return R.ok(transactionSafetyService.listStoredValueConsumes(bo));
    }

    @SaCheckPermission("yy:customer:list")
    @PostMapping("/stored-value-consumes")
    public R<YyStoredValueConsumeOrderVo> createStoredValueConsume(@Valid @RequestBody YyStoredValueConsumeCreateBo bo) {
        return R.ok(transactionSafetyService.createStoredValueConsume(bo));
    }

    @SaCheckPermission("yy:customer:list")
    @PostMapping("/stored-value-consumes/{id}/confirm")
    public R<YyStoredValueConsumeOrderVo> confirmStoredValueConsume(@PathVariable Long id, @RequestBody(required = false) YyTransactionSafetyActionBo bo) {
        return R.ok(transactionSafetyService.confirmStoredValueConsume(id, bo));
    }

    @SaCheckPermission("yy:customer:list")
    @PostMapping("/stored-value-consumes/{id}/reverse")
    public R<YyStoredValueConsumeOrderVo> reverseStoredValueConsume(@PathVariable Long id, @RequestBody(required = false) YyTransactionSafetyActionBo bo) {
        return R.ok(transactionSafetyService.reverseStoredValueConsume(id, bo));
    }

    @SaCheckPermission("yy:customer:list")
    @GetMapping("/withdraw-orders")
    public R<List<YyMemberWithdrawOrderVo>> listMemberWithdrawOrders(YyTransactionSafetyQueryBo bo) {
        return R.ok(transactionSafetyService.listMemberWithdrawOrders(bo));
    }

    @SaCheckPermission("yy:customer:list")
    @PostMapping("/withdraw-orders")
    public R<YyMemberWithdrawOrderVo> createMemberWithdrawOrder(@Valid @RequestBody YyMemberWithdrawCreateBo bo) {
        return R.ok(transactionSafetyService.createMemberWithdrawOrder(bo));
    }

    @SaCheckPermission("yy:customer:list")
    @PostMapping("/withdraw-orders/{id}/mark-paid")
    public R<YyMemberWithdrawOrderVo> markWithdrawPaid(@PathVariable Long id, @RequestBody(required = false) YyTransactionSafetyActionBo bo) {
        return R.ok(transactionSafetyService.markWithdrawPaid(id, bo));
    }
}
