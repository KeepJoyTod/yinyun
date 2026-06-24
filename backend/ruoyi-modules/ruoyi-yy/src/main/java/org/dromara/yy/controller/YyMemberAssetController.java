package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.web.core.BaseController;
import org.dromara.yy.domain.vo.YyMemberBalanceLedgerVo;
import org.dromara.yy.domain.vo.YyMemberBenefitLedgerVo;
import org.dromara.yy.domain.vo.YyMemberCardInstanceVo;
import org.dromara.yy.domain.vo.YyMemberCouponVo;
import org.dromara.yy.domain.vo.YyMemberGrowthLedgerVo;
import org.dromara.yy.domain.vo.YyMemberOverviewVo;
import org.dromara.yy.domain.vo.YyMemberPointsLedgerVo;
import org.dromara.yy.service.IYyMemberAssetService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/member")
public class YyMemberAssetController extends BaseController {

    private final IYyMemberAssetService yyMemberAssetService;

    @SaCheckPermission("yy:customer:list")
    @GetMapping("/customer/{customerId}/overview")
    public R<YyMemberOverviewVo> getOverview(@NotNull(message = "客户ID不能为空") @PathVariable Long customerId) {
        return R.ok(yyMemberAssetService.getMemberOverview(customerId));
    }

    @SaCheckPermission("yy:customer:list")
    @GetMapping("/customer/{customerId}/cards")
    public R<List<YyMemberCardInstanceVo>> listCards(@NotNull(message = "客户ID不能为空") @PathVariable Long customerId) {
        return R.ok(yyMemberAssetService.listMemberCards(customerId));
    }

    @SaCheckPermission("yy:customer:list")
    @GetMapping("/customer/{customerId}/benefits")
    public R<List<YyMemberBenefitLedgerVo>> listBenefits(@NotNull(message = "客户ID不能为空") @PathVariable Long customerId) {
        return R.ok(yyMemberAssetService.listMemberBenefits(customerId));
    }

    @SaCheckPermission("yy:customer:list")
    @GetMapping("/customer/{customerId}/coupons")
    public R<List<YyMemberCouponVo>> listCoupons(@NotNull(message = "客户ID不能为空") @PathVariable Long customerId) {
        return R.ok(yyMemberAssetService.listMemberCoupons(customerId));
    }

    @SaCheckPermission("yy:customer:list")
    @GetMapping("/customer/{customerId}/points-ledger")
    public R<List<YyMemberPointsLedgerVo>> listPointsLedger(
        @NotNull(message = "客户ID不能为空") @PathVariable Long customerId,
        @RequestParam(defaultValue = "20") int limit
    ) {
        return R.ok(yyMemberAssetService.listMemberPointsLedger(customerId, limit));
    }

    @SaCheckPermission("yy:customer:list")
    @GetMapping("/customer/{customerId}/growth-ledger")
    public R<List<YyMemberGrowthLedgerVo>> listGrowthLedger(
        @NotNull(message = "客户ID不能为空") @PathVariable Long customerId,
        @RequestParam(defaultValue = "20") int limit
    ) {
        return R.ok(yyMemberAssetService.listMemberGrowthLedger(customerId, limit));
    }

    @SaCheckPermission("yy:customer:list")
    @GetMapping("/customer/{customerId}/balance-ledger")
    public R<List<YyMemberBalanceLedgerVo>> listBalanceLedger(
        @NotNull(message = "客户ID不能为空") @PathVariable Long customerId,
        @RequestParam(defaultValue = "20") int limit
    ) {
        return R.ok(yyMemberAssetService.listMemberBalanceLedger(customerId, limit));
    }
}
