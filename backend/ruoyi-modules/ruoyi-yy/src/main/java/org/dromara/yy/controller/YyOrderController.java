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
import org.dromara.yy.domain.bo.YyOrderBo;
import org.dromara.yy.domain.bo.YyOrderCopyBo;
import org.dromara.yy.domain.bo.YyOrderRescheduleBo;
import org.dromara.yy.domain.bo.YyOrderTransitionBo;
import org.dromara.yy.domain.bo.YyStaffBookingCreateBo;
import org.dromara.yy.domain.vo.YyOrderVo;
import org.dromara.yy.domain.vo.YyPhotoAlbumVo;
import org.dromara.yy.service.IYyOrderService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/order")
public class YyOrderController extends BaseController {

    private final IYyOrderService yyOrderService;

    @SaCheckPermission("yy:order:list")
    @GetMapping("/list")
    public TableDataInfo<YyOrderVo> list(YyOrderBo bo, PageQuery pageQuery) {
        return yyOrderService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("yy:order:export")
    @Log(title = "Order export", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(YyOrderBo bo, HttpServletResponse response) {
        List<YyOrderVo> list = yyOrderService.queryList(bo);
        ExcelUtil.exportExcel(list, "Orders", YyOrderVo.class, response);
    }

    @SaCheckPermission("yy:order:query")
    @GetMapping("/{id}")
    public R<YyOrderVo> getInfo(@NotNull(message = "id must not be null") @PathVariable Long id) {
        return R.ok(yyOrderService.queryById(id));
    }

    @SaCheckPermission("yy:photoAlbum:add")
    @Log(title = "Photo album placeholder", businessType = BusinessType.INSERT)
    @RepeatSubmit
    @PostMapping("/{id}/photo-album-placeholder")
    public R<YyPhotoAlbumVo> repairPhotoAlbumPlaceholder(@NotNull(message = "id must not be null") @PathVariable Long id) {
        return R.ok(yyOrderService.repairPhotoAlbumPlaceholder(id));
    }

    @SaCheckPermission("yy:order:edit")
    @Log(title = "Order transition", businessType = BusinessType.UPDATE)
    @RepeatSubmit
    @PostMapping("/{id}/transition")
    public R<YyOrderVo> transition(@NotNull(message = "id must not be null") @PathVariable Long id,
                                   @Validated @RequestBody YyOrderTransitionBo bo) {
        return R.ok(yyOrderService.transitionStatus(id, bo.getExpectedStatus(), bo.getTargetStatus(), bo.getRemark()));
    }

    @SaCheckPermission("yy:order:edit")
    @Log(title = "Order reschedule", businessType = BusinessType.UPDATE)
    @RepeatSubmit
    @PostMapping("/{id}/reschedule")
    public R<YyOrderVo> reschedule(@NotNull(message = "id must not be null") @PathVariable Long id,
                                   @Validated @RequestBody YyOrderRescheduleBo bo) {
        return R.ok(yyOrderService.reschedule(
            id,
            bo.getExpectedStatus(),
            bo.getArrivalTime(),
            bo.getServiceGroupId(),
            bo.getSlotDate(),
            bo.getSlotStartTime(),
            bo.getSlotEndTime(),
            bo.getRemark()
        ));
    }

    @SaCheckPermission("yy:order:add")
    @Log(title = "Order create", businessType = BusinessType.INSERT)
    @RepeatSubmit
    @PostMapping("/staff-booking")
    public R<YyOrderVo> staffBooking(@Validated @RequestBody YyStaffBookingCreateBo bo) {
        return R.ok(yyOrderService.createStaffBooking(bo));
    }

    @SaCheckPermission("yy:order:add")
    @Log(title = "Order copy", businessType = BusinessType.INSERT)
    @RepeatSubmit
    @PostMapping("/{id}/copy")
    public R<YyOrderVo> copy(@NotNull(message = "id must not be null") @PathVariable Long id,
                             @Validated @RequestBody YyOrderCopyBo bo) {
        return R.ok(yyOrderService.copyOrder(id, bo));
    }

    @SaCheckPermission("yy:order:add")
    @Log(title = "Order create", businessType = BusinessType.INSERT)
    @RepeatSubmit
    @PostMapping
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyOrderBo bo) {
        return toAjax(yyOrderService.insertByBo(bo));
    }

    @SaCheckPermission("yy:order:edit")
    @Log(title = "Order update", businessType = BusinessType.UPDATE)
    @RepeatSubmit
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyOrderBo bo) {
        return toAjax(yyOrderService.updateByBo(bo));
    }

    @SaCheckPermission("yy:order:remove")
    @Log(title = "Order delete", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "ids must not be empty") @PathVariable Long[] ids) {
        return toAjax(yyOrderService.deleteWithValidByIds(List.of(ids), true));
    }
}
