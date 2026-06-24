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
import org.dromara.yy.domain.bo.YyPhotoAssetBo;
import org.dromara.yy.domain.vo.YyPhotoAssetVo;
import org.dromara.yy.service.IYyPhotoAssetService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 底片列表
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/photoAsset")
public class YyPhotoAssetController extends BaseController {

    private final IYyPhotoAssetService yyPhotoAssetService;

    /**
     * 查询底片列表列表
     */
    @SaCheckPermission("yy:photoAsset:list")
    @GetMapping("/list")
    public TableDataInfo<YyPhotoAssetVo> list(YyPhotoAssetBo bo, PageQuery pageQuery) {
        return yyPhotoAssetService.queryPageList(bo, pageQuery);
    }

    /**
     * 导出底片列表列表
     */
    @SaCheckPermission("yy:photoAsset:export")
    @Log(title = "底片列表", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(YyPhotoAssetBo bo, HttpServletResponse response) {
        List<YyPhotoAssetVo> list = yyPhotoAssetService.queryList(bo);
        ExcelUtil.exportExcel(list, "底片列表", YyPhotoAssetVo.class, response);
    }

    /**
     * 获取底片列表详细信息
     */
    @SaCheckPermission("yy:photoAsset:list")
    @GetMapping("/{id}")
    public R<YyPhotoAssetVo> getInfo(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(yyPhotoAssetService.queryById(id));
    }

    /**
     * 新增底片列表
     */
    @SaCheckPermission("yy:photoAsset:add")
    @Log(title = "底片列表", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyPhotoAssetBo bo) {
        return toAjax(yyPhotoAssetService.insertByBo(bo));
    }

    /**
     * 修改底片列表
     */
    @SaCheckPermission("yy:photoAsset:edit")
    @Log(title = "底片列表", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyPhotoAssetBo bo) {
        return toAjax(yyPhotoAssetService.updateByBo(bo));
    }

    /**
     * 删除底片列表
     */
    @SaCheckPermission("yy:photoAsset:remove")
    @Log(title = "底片列表", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空") @PathVariable Long[] ids) {
        return toAjax(yyPhotoAssetService.deleteWithValidByIds(List.of(ids), true));
    }
}
