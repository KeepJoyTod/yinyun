package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.excel.utils.ExcelUtil;
import org.dromara.common.idempotent.annotation.RepeatSubmit;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.web.core.BaseController;
import org.dromara.yy.domain.bo.YyPhotoAssetBatchUpdateBo;
import org.dromara.yy.domain.bo.YyPhotoAssetBo;
import org.dromara.yy.domain.vo.YyPhotoAssetVo;
import org.dromara.yy.domain.vo.YyPhotoResourceRowVo;
import org.dromara.yy.domain.vo.YyPhotoResourceUsageSummaryVo;
import org.dromara.yy.service.IYyPhotoAssetService;
import org.dromara.yy.service.IYyPhotoResourceUsageService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 搴曠墖鍒楄〃
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/photoAsset")
public class YyPhotoAssetController extends BaseController {

    private final IYyPhotoAssetService yyPhotoAssetService;
    private final IYyPhotoResourceUsageService yyPhotoResourceUsageService;

    @SaCheckPermission("yy:photoAsset:list")
    @GetMapping("/list")
    public TableDataInfo<YyPhotoAssetVo> list(YyPhotoAssetBo bo, PageQuery pageQuery) {
        return yyPhotoAssetService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("yy:photoAsset:list")
    @GetMapping("/resource-list")
    public TableDataInfo<YyPhotoResourceRowVo> resourceList(YyPhotoAssetBo bo, PageQuery pageQuery) {
        return yyPhotoAssetService.queryResourcePageList(bo, pageQuery);
    }

    @SaCheckPermission("yy:photoAsset:export")
    @Log(title = "搴曠墖鍒楄〃", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(YyPhotoAssetBo bo, HttpServletResponse response) {
        List<YyPhotoAssetVo> list = yyPhotoAssetService.queryList(bo);
        ExcelUtil.exportExcel(list, "搴曠墖鍒楄〃", YyPhotoAssetVo.class, response);
    }

    @SaCheckPermission("yy:photoAsset:list")
    @GetMapping("/usage-summary")
    public R<YyPhotoResourceUsageSummaryVo> usageSummary() {
        return R.ok(yyPhotoResourceUsageService.getUsageSummary());
    }

    @SaCheckPermission("yy:photoAsset:list")
    @GetMapping("/{id}")
    public R<YyPhotoAssetVo> getInfo(@NotNull(message = "涓婚敭涓嶈兘涓虹┖") @PathVariable Long id) {
        return R.ok(yyPhotoAssetService.queryById(id));
    }

    @SaCheckPermission("yy:photoAsset:add")
    @Log(title = "搴曠墖鍒楄〃", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyPhotoAssetBo bo) {
        return toAjax(yyPhotoAssetService.insertByBo(bo));
    }

    @SaCheckPermission("yy:photoAsset:edit")
    @Log(title = "搴曠墖鍒楄〃", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyPhotoAssetBo bo) {
        return toAjax(yyPhotoAssetService.updateByBo(bo));
    }

    @SaCheckPermission("yy:photoAsset:edit")
    @Log(title = "璧勬簮鎵归噺鏇存柊", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PostMapping("/batch-update")
    public R<Void> batchUpdate(@Validated @RequestBody YyPhotoAssetBatchUpdateBo bo) {
        return toAjax(yyPhotoAssetService.batchUpdateResources(bo));
    }

    @SaCheckPermission("yy:photoAsset:remove")
    @Log(title = "搴曠墖鍒楄〃", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "涓婚敭涓嶈兘涓虹┖") @PathVariable Long[] ids) {
        return toAjax(yyPhotoAssetService.deleteWithValidByIds(List.of(ids), true));
    }
}
