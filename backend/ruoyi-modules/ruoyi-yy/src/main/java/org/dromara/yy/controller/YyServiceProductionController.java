package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.idempotent.annotation.RepeatSubmit;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.web.core.BaseController;
import org.dromara.yy.domain.bo.*;
import org.dromara.yy.domain.vo.*;
import org.dromara.yy.service.IYyServiceProductionService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 服务生产模块。
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/serviceProduction")
public class YyServiceProductionController extends BaseController {

    private final IYyServiceProductionService yyServiceProductionService;

    @SaCheckPermission("yy:photoAlbum:list")
    @GetMapping("/retouchTask/list")
    public TableDataInfo<YyRetouchTaskVo> retouchTasks(YyRetouchTaskQueryBo bo, PageQuery pageQuery) {
        return yyServiceProductionService.queryRetouchTaskPageList(bo, pageQuery);
    }

    @SaCheckPermission("yy:photoAlbum:edit")
    @Log(title = "三方修图任务", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PostMapping("/retouchTask/{id}/action")
    public R<YyRetouchTaskVo> updateRetouchTask(
        @NotNull(message = "主键不能为空") @PathVariable Long id,
        @RequestBody(required = false) YyRetouchTaskActionBo bo
    ) {
        return R.ok(yyServiceProductionService.updateRetouchTask(id, bo));
    }

    @SaCheckPermission("yy:employee:list")
    @GetMapping("/retouchProvider/list")
    public R<List<YyRetouchProviderVo>> retouchProviders(YyRetouchProviderQueryBo bo) {
        return R.ok(yyServiceProductionService.queryRetouchProviders(bo));
    }

    @SaCheckPermission("yy:employee:add")
    @Log(title = "三方修图服务商", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping("/retouchProvider")
    public R<YyRetouchProviderVo> addRetouchProvider(@Validated(AddGroup.class) @RequestBody YyRetouchProviderBo bo) {
        return R.ok(yyServiceProductionService.saveRetouchProvider(bo));
    }

    @SaCheckPermission("yy:employee:edit")
    @Log(title = "三方修图服务商", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping("/retouchProvider")
    public R<YyRetouchProviderVo> editRetouchProvider(@Validated(EditGroup.class) @RequestBody YyRetouchProviderBo bo) {
        return R.ok(yyServiceProductionService.saveRetouchProvider(bo));
    }

    @SaCheckPermission("yy:bookingConfig:list")
    @GetMapping("/collaborationPolicy")
    public R<YyCollaborationPolicyVo> collaborationPolicy() {
        return R.ok(yyServiceProductionService.queryCollaborationPolicy());
    }

    @SaCheckPermission("yy:bookingConfig:edit")
    @Log(title = "内部协作策略", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping("/collaborationPolicy")
    public R<YyCollaborationPolicyVo> saveCollaborationPolicy(@Valid @RequestBody YyCollaborationPolicyBo bo) {
        return R.ok(yyServiceProductionService.saveCollaborationPolicy(bo));
    }

    @SaCheckPermission("yy:bookingConfig:list")
    @GetMapping("/licenseBinding/list")
    public R<List<YyServiceLicenseBindingVo>> licenseBindings(@RequestParam(required = false) Long storeId) {
        return R.ok(yyServiceProductionService.queryLicenseBindings(storeId));
    }

    @SaCheckPermission("yy:bookingConfig:edit")
    @Log(title = "协作套件许可证", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping("/licenseBinding")
    public R<YyServiceLicenseBindingVo> saveLicenseBinding(@Valid @RequestBody YyServiceLicenseBindingBo bo) {
        return R.ok(yyServiceProductionService.saveLicenseBinding(bo));
    }
}
