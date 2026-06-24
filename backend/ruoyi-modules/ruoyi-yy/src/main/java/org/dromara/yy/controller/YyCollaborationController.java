package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.idempotent.annotation.RepeatSubmit;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.web.core.BaseController;
import org.dromara.yy.domain.bo.YyCollaborationLicenseBindStoreBo;
import org.dromara.yy.domain.bo.YyCollaborationLicenseBo;
import org.dromara.yy.domain.bo.YyCollaborationSettingBo;
import org.dromara.yy.domain.bo.YyProductCollaborationConfigBo;
import org.dromara.yy.domain.vo.YyCollaborationLicenseVo;
import org.dromara.yy.domain.vo.YyCollaborationSettingVo;
import org.dromara.yy.domain.vo.YyProductCollaborationConfigVo;
import org.dromara.yy.service.IYyCollaborationService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/collaboration")
public class YyCollaborationController extends BaseController {

    private final IYyCollaborationService yyCollaborationService;

    @SaCheckPermission("yy:bookingConfig:list")
    @GetMapping("/setting/{settingType}")
    public R<YyCollaborationSettingVo> getSetting(@NotBlank(message = "settingType不能为空") @PathVariable String settingType) {
        return R.ok(yyCollaborationService.querySetting(settingType));
    }

    @SaCheckPermission("yy:bookingConfig:edit")
    @Log(title = "协作设置", businessType = BusinessType.UPDATE)
    @RepeatSubmit
    @PutMapping("/setting/{settingType}")
    public R<YyCollaborationSettingVo> saveSetting(
        @NotBlank(message = "settingType不能为空") @PathVariable String settingType,
        @Valid @RequestBody YyCollaborationSettingBo bo
    ) {
        bo.setSettingType(settingType);
        return R.ok(yyCollaborationService.saveSetting(bo));
    }

    @SaCheckPermission("yy:product:list")
    @GetMapping("/product-config/list")
    public R<List<YyProductCollaborationConfigVo>> listProductConfigs() {
        return R.ok(yyCollaborationService.queryProductConfigs());
    }

    @SaCheckPermission("yy:product:edit")
    @Log(title = "产品协作配置", businessType = BusinessType.UPDATE)
    @RepeatSubmit
    @PutMapping("/product-config/{productId}")
    public R<YyProductCollaborationConfigVo> saveProductConfig(
        @NotNull(message = "productId不能为空") @PathVariable Long productId,
        @Valid @RequestBody YyProductCollaborationConfigBo bo
    ) {
        bo.setProductId(productId);
        return R.ok(yyCollaborationService.saveProductConfig(productId, bo));
    }

    @SaCheckPermission("yy:bookingConfig:list")
    @GetMapping("/license/list")
    public R<List<YyCollaborationLicenseVo>> listLicenses(@RequestParam(required = false) Long storeId) {
        return R.ok(yyCollaborationService.queryLicenses(storeId));
    }

    @SaCheckPermission("yy:bookingConfig:edit")
    @Log(title = "协作许可证", businessType = BusinessType.UPDATE)
    @RepeatSubmit
    @PutMapping("/license")
    public R<YyCollaborationLicenseVo> saveLicense(@Valid @RequestBody YyCollaborationLicenseBo bo) {
        return R.ok(yyCollaborationService.saveLicense(bo));
    }

    @SaCheckPermission("yy:bookingConfig:edit")
    @Log(title = "协作许可证门店绑定", businessType = BusinessType.UPDATE)
    @RepeatSubmit
    @PostMapping("/license/{licenseId}/bind-store")
    public R<YyCollaborationLicenseVo> bindLicenseStore(
        @NotNull(message = "licenseId不能为空") @PathVariable Long licenseId,
        @Valid @RequestBody YyCollaborationLicenseBindStoreBo bo
    ) {
        return R.ok(yyCollaborationService.bindLicenseStore(licenseId, bo));
    }

    @SaCheckPermission("yy:bookingConfig:edit")
    @Log(title = "协作许可证门店解绑", businessType = BusinessType.UPDATE)
    @RepeatSubmit
    @PostMapping("/license/{licenseId}/unbind-store/{storeId}")
    public R<YyCollaborationLicenseVo> unbindLicenseStore(
        @NotNull(message = "licenseId不能为空") @PathVariable Long licenseId,
        @NotNull(message = "storeId不能为空") @PathVariable Long storeId
    ) {
        return R.ok(yyCollaborationService.unbindLicenseStore(licenseId, storeId));
    }
}
