package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.web.core.BaseController;
import org.dromara.yy.domain.vo.YyProductBenefitBindingVo;
import org.dromara.yy.domain.vo.YyProductCatalogVo;
import org.dromara.yy.domain.vo.YyProductInventoryBindingVo;
import org.dromara.yy.domain.vo.YyProductOrderReadinessVo;
import org.dromara.yy.service.IYyProductBenefitBindingService;
import org.dromara.yy.service.IYyProductCatalogService;
import org.dromara.yy.service.IYyProductInventoryBindingService;
import org.dromara.yy.service.IYyProductOrderReadinessService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/productCatalog")
public class YyProductCatalogController extends BaseController {
    private final IYyProductCatalogService productCatalogService;
    private final IYyProductOrderReadinessService orderReadinessService;
    private final IYyProductInventoryBindingService inventoryBindingService;
    private final IYyProductBenefitBindingService benefitBindingService;

    @SaCheckPermission("yy:product:list")
    @GetMapping("/{productId}")
    public R<YyProductCatalogVo> getCatalog(@NotNull(message = "productId cannot be null") @PathVariable Long productId) {
        return R.ok(productCatalogService.queryCatalogByProductId(productId));
    }

    @SaCheckPermission("yy:product:list")
    @GetMapping("/{productId}/order-readiness")
    public R<YyProductOrderReadinessVo> getOrderReadiness(@NotNull(message = "productId cannot be null") @PathVariable Long productId) {
        return R.ok(orderReadinessService.checkOrderReadiness(productId));
    }

    @SaCheckPermission("yy:product:list")
    @GetMapping("/{productId}/inventory-binding")
    public R<YyProductInventoryBindingVo> getInventoryBinding(@NotNull(message = "productId cannot be null") @PathVariable Long productId) {
        return R.ok(inventoryBindingService.checkInventoryBinding(productId));
    }

    @SaCheckPermission("yy:product:list")
    @GetMapping("/{productId}/benefit-binding")
    public R<YyProductBenefitBindingVo> getBenefitBinding(@NotNull(message = "productId cannot be null") @PathVariable Long productId) {
        return R.ok(benefitBindingService.checkBenefitBinding(productId));
    }
}
