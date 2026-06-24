package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import jakarta.validation.constraints.NotEmpty;
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
import org.dromara.yy.domain.bo.YyPhotoTagBo;
import org.dromara.yy.domain.vo.YyPhotoTagVo;
import org.dromara.yy.service.IYyPhotoTagService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 璧勬簮鏍囩
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/photoTag")
public class YyPhotoTagController extends BaseController {

    private final IYyPhotoTagService yyPhotoTagService;

    @SaCheckPermission("yy:photoAsset:list")
    @GetMapping("/list")
    public TableDataInfo<YyPhotoTagVo> list(YyPhotoTagBo bo, PageQuery pageQuery) {
        return yyPhotoTagService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("yy:photoAsset:add")
    @Log(title = "璧勬簮鏍囩", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyPhotoTagBo bo) {
        return toAjax(yyPhotoTagService.insertByBo(bo));
    }

    @SaCheckPermission("yy:photoAsset:edit")
    @Log(title = "璧勬簮鏍囩", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyPhotoTagBo bo) {
        return toAjax(yyPhotoTagService.updateByBo(bo));
    }

    @SaCheckPermission("yy:photoAsset:remove")
    @Log(title = "璧勬簮鏍囩", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "涓婚敭涓嶈兘涓虹┖") @PathVariable Long[] ids) {
        return toAjax(yyPhotoTagService.deleteWithValidByIds(List.of(ids), true));
    }
}
