package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.excel.utils.ExcelUtil;
import org.dromara.common.idempotent.annotation.RepeatSubmit;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.common.mybatis.core.page.PageQuery;
import org.dromara.common.mybatis.core.page.TableDataInfo;
import org.dromara.common.web.core.BaseController;
import org.dromara.yy.domain.bo.YyBookingSlotInventoryBo;
import org.dromara.yy.domain.bo.YyScheduleGovernanceBo;
import org.dromara.yy.domain.vo.YyBookingSlotInventoryVo;
import org.dromara.yy.domain.vo.YyScheduleGovernancePreviewVo;
import org.dromara.yy.service.IYyBookingSlotInventoryService;
import org.dromara.yy.service.IYyScheduleGovernanceService;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 预约时段库存账本
 */
@Validated
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/bookingSlotInventory")
public class YyBookingSlotInventoryController extends BaseController {

    private final IYyBookingSlotInventoryService yyBookingSlotInventoryService;
    private final IYyScheduleGovernanceService yyScheduleGovernanceService;

    @SaCheckPermission("yy:bookingInventory:list")
    @GetMapping("/list")
    public TableDataInfo<YyBookingSlotInventoryVo> list(YyBookingSlotInventoryBo bo, PageQuery pageQuery) {
        return yyBookingSlotInventoryService.queryPageList(bo, pageQuery);
    }

    @SaCheckPermission("yy:bookingInventory:export")
    @Log(title = "预约时段库存账本", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(YyBookingSlotInventoryBo bo, HttpServletResponse response) {
        List<YyBookingSlotInventoryVo> list = yyBookingSlotInventoryService.queryList(bo);
        ExcelUtil.exportExcel(list, "预约时段库存账本", YyBookingSlotInventoryVo.class, response);
    }

    @SaCheckPermission("yy:bookingInventory:query")
    @GetMapping("/{id}")
    public R<YyBookingSlotInventoryVo> getInfo(@NotNull(message = "主键不能为空") @PathVariable Long id) {
        return R.ok(yyBookingSlotInventoryService.queryById(id));
    }

    @SaCheckPermission("yy:bookingInventory:edit")
    @Log(title = "预约时段库存账本", businessType = BusinessType.UPDATE)
    @RepeatSubmit
    @PutMapping
    public R<Void> edit(@Validated(EditGroup.class) @RequestBody YyBookingSlotInventoryBo bo) {
        return toAjax(yyBookingSlotInventoryService.updateByBo(bo));
    }

    @SaCheckPermission("yy:bookingInventory:list")
    @Log(title = "预约时段治理预览", businessType = BusinessType.OTHER)
    @RepeatSubmit
    @PostMapping("/governance/preview")
    public R<YyScheduleGovernancePreviewVo> previewGovernance(@Validated @RequestBody YyScheduleGovernanceBo bo) {
        return R.ok(yyScheduleGovernanceService.preview(bo));
    }

    @SaCheckPermission("yy:bookingInventory:edit")
    @Log(title = "预约时段治理", businessType = BusinessType.UPDATE)
    @RepeatSubmit
    @PostMapping("/governance/apply")
    public R<YyScheduleGovernancePreviewVo> applyGovernance(@Validated @RequestBody YyScheduleGovernanceBo bo) {
        return R.ok(yyScheduleGovernanceService.apply(bo));
    }
}
