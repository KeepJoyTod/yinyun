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
import org.dromara.yy.domain.bo.YyOrderRescheduleBo;
import org.dromara.yy.domain.bo.YyOrderTransitionBo;
import org.dromara.yy.domain.bo.YyStaffBookingCreateBo;
import org.dromara.yy.domain.vo.YyOrderVo;
import org.dromara.yy.domain.vo.YyPhotoAlbumVo;
import org.dromara.yy.service.IYyOrderService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 预约订单
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/order")
public class YyOrderController extends BaseController {

    private final IYyOrderService yyOrderService;

    /**
     * 查询预约订单列表
     */
    @SaCheckPermission("yy:order:list")
    @GetMapping("/list")
    public TableDataInfo<YyOrderVo> list(YyOrderBo bo, PageQuery pageQuery) {
        return yyOrderService.queryPageList(bo, pageQuery);
    }

    /**
     * 导出预约订单列表
     */
    @SaCheckPermission("yy:order:export")
    @Log(title = "预约订单", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(YyOrderBo bo, HttpServletResponse response) {
        List<YyOrderVo> list = yyOrderService.queryList(bo);
        ExcelUtil.exportExcel(list, "预约订单", YyOrderVo.class, response);
    }

    /**
     * 获取预约订单详细信息
     */
    @SaCheckPermission("yy:order:query")
    @GetMapping("/{id}")
    public R<YyOrderVo> getInfo(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(yyOrderService.queryById(id));
    }

    /**
     * 幂等修复订单取片相册占位
     */
    @SaCheckPermission("yy:photoAlbum:add")
    @Log(title = "订单取片相册占位", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping("/{id}/photo-album-placeholder")
    public R<YyPhotoAlbumVo> repairPhotoAlbumPlaceholder(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(yyOrderService.repairPhotoAlbumPlaceholder(id));
    }

    /**
     * 工作台订单状态流转
     */
    @SaCheckPermission("yy:order:edit")
    @Log(title = "预约订单状态流转", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PostMapping("/{id}/transition")
    public R<YyOrderVo> transition(@NotNull(message = "主键不能为空") @PathVariable Long id,
                                   @Validated @RequestBody YyOrderTransitionBo bo) {
        return R.ok(yyOrderService.transitionStatus(id, bo.getExpectedStatus(), bo.getTargetStatus(), bo.getRemark()));
    }

    /**
     * 工作台订单改期
     */
    @SaCheckPermission("yy:order:edit")
    @Log(title = "预约订单改期", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PostMapping("/{id}/reschedule")
    public R<YyOrderVo> reschedule(@NotNull(message = "主键不能为空") @PathVariable Long id,
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

    /**
     * 店员工作台新增预约。
     */
    @SaCheckPermission("yy:order:add")
    @Log(title = "店员新增预约", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping("/staff-booking")
    public R<YyOrderVo> staffBooking(@Validated @RequestBody YyStaffBookingCreateBo bo) {
        return R.ok(yyOrderService.createStaffBooking(bo));
    }

    /**
     * 新增预约订单
     */
    @SaCheckPermission("yy:order:add")
    @Log(title = "预约订单", businessType = BusinessType.INSERT)
    @RepeatSubmit()
    @PostMapping()
    public R<Void> add(@Validated(AddGroup.class) @RequestBody YyOrderBo bo) {
        return toAjax(yyOrderService.insertByBo(bo));
    }

    /**
     * 修改预约订单
     */
    @SaCheckPermission("yy:order:edit")
    @Log(title = "预约订单", businessType = BusinessType.UPDATE)
    @RepeatSubmit()
    @PutMapping()
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyOrderBo bo) {
        return toAjax(yyOrderService.updateByBo(bo));
    }

    /**
     * 删除预约订单
     */
    @SaCheckPermission("yy:order:remove")
    @Log(title = "预约订单", businessType = BusinessType.DELETE)
    @DeleteMapping("/{ids}")
    public R<Void> remove(@NotEmpty(message = "主键不能为空") @PathVariable Long[] ids) {
        return toAjax(yyOrderService.deleteWithValidByIds(List.of(ids), true));
    }
}
