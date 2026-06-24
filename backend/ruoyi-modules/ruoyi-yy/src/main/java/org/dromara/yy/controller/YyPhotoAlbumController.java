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
import org.dromara.yy.domain.bo.YyPhotoAlbumBo;
import org.dromara.yy.domain.bo.YyPhotoAlbumActionBo;
import org.dromara.yy.domain.vo.YyPhotoAlbumActionResultVo;
import org.dromara.yy.domain.vo.YyPhotoAlbumOperationsSummaryVo;
import org.dromara.yy.domain.vo.YyPhotoAlbumVo;
import org.dromara.yy.service.IYyPhotoAlbumService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 客片相册
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/photoAlbum")
public class YyPhotoAlbumController extends BaseController {

    private final IYyPhotoAlbumService yyPhotoAlbumService;

    /**
     * 查询客片相册列表
     */
    @SaCheckPermission("yy:photoAlbum:list")
    @GetMapping("/list")
    public TableDataInfo<YyPhotoAlbumVo> list(YyPhotoAlbumBo bo, PageQuery pageQuery) {
        return yyPhotoAlbumService.queryPageList(bo, pageQuery);
    }

    /**
     * 批量查询相册运营排障聚合信息
     */
    @SaCheckPermission("yy:photoAlbum:list")
    @GetMapping("/operations-summary")
    public R<List<YyPhotoAlbumOperationsSummaryVo>> operationsSummary(@RequestParam List<Long> albumIds) {
        return R.ok(yyPhotoAlbumService.queryOperationsSummary(albumIds));
    }

    /**
     * 导出客片相册列表
     */
    @SaCheckPermission("yy:photoAlbum:export")
    @Log(title = "客片相册", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(YyPhotoAlbumBo bo, HttpServletResponse response) {
        List<YyPhotoAlbumVo> list = yyPhotoAlbumService.queryList(bo);
        ExcelUtil.exportExcel(list, "客片相册", YyPhotoAlbumVo.class, response);
    }

    /**
     * 获取客片相册详细信息
     */
    @SaCheckPermission("yy:photoAlbum:list")
    @GetMapping("/{id}")
    public R<YyPhotoAlbumVo> getInfo(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(yyPhotoAlbumService.queryById(id));
    }

    /**
     * 确认客户选片结果。
     */
    @SaCheckPermission("yy:photoAlbum:edit")
    @Log(title = "客片相册", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PostMapping("/{id}/selection/confirm")
    public R<YyPhotoAlbumActionResultVo> confirmSelection(
        @NotNull(message = "主键不能为空") @PathVariable Long id,
        @RequestBody(required = false) YyPhotoAlbumActionBo actionBo
    ) {
        return R.ok(yyPhotoAlbumService.confirmSelection(id, actionBo));
    }

    /**
     * 标记相册完成最终交付。
     */
    @SaCheckPermission("yy:photoAlbum:edit")
    @Log(title = "客片相册", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PostMapping("/{id}/deliver")
    public R<YyPhotoAlbumActionResultVo> deliver(
        @NotNull(message = "主键不能为空") @PathVariable Long id,
        @RequestBody(required = false) YyPhotoAlbumActionBo actionBo
    ) {
        return R.ok(yyPhotoAlbumService.deliverAlbum(id, actionBo));
    }

    /**
     * 记录客户通知动作。
     */
    @SaCheckPermission("yy:photoAlbum:edit")
    @Log(title = "客片相册", businessType = BusinessType.OTHER)
    @RepeatSubmit()
    @PostMapping("/{id}/notify")
    public R<YyPhotoAlbumActionResultVo> notifyCustomer(
        @NotNull(message = "主键不能为空") @PathVariable Long id,
        @RequestBody(required = false) YyPhotoAlbumActionBo actionBo
    ) {
        return R.ok(yyPhotoAlbumService.notifyAlbum(id, actionBo));
    }

    /**
     * 新增客片相册
     */
    @SaCheckPermission("yy:photoAlbum:add")
    @Log(title = "客片相册", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyPhotoAlbumBo bo) {
        return toAjax(yyPhotoAlbumService.insertByBo(bo));
    }

    /**
     * 修改客片相册
     */
    @SaCheckPermission("yy:photoAlbum:edit")
    @Log(title = "客片相册", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyPhotoAlbumBo bo) {
        return toAjax(yyPhotoAlbumService.updateByBo(bo));
    }

    /**
     * 删除客片相册
     */
    @SaCheckPermission("yy:photoAlbum:remove")
    @Log(title = "客片相册", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空") @PathVariable Long[] ids) {
        return toAjax(yyPhotoAlbumService.deleteWithValidByIds(List.of(ids), true));
    }
}
