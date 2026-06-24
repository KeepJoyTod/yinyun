package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.common.excel.utils.ExcelUtil;
import org.dromara.common.log.annotation.Log;
import org.dromara.common.log.enums.BusinessType;
import org.dromara.yy.domain.bo.YyDashboardExportBo;
import org.dromara.yy.domain.vo.YyDashboardConversionVo;
import org.dromara.yy.domain.vo.YyDashboardExportVo;
import org.dromara.yy.domain.vo.YyDashboardFinanceVo;
import org.dromara.yy.domain.vo.YyDashboardOrderStatusStatVo;
import org.dromara.yy.domain.vo.YyDashboardOverviewVo;
import org.dromara.yy.domain.vo.YyDashboardProductRankingVo;
import org.dromara.yy.domain.vo.YyDashboardScheduleGridVo;
import org.dromara.yy.domain.vo.YyDashboardTodaySlotVo;
import org.dromara.yy.domain.vo.YyDashboardTrendStatVo;
import org.dromara.yy.service.IYyDashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 影约云首页概况
 */
@RequiredArgsConstructor
@RestController
@RequestMapping("/yy/dashboard")
public class YyDashboardController {

    private final IYyDashboardService yyDashboardService;

    /**
     * 查询首页概况
     */
    @SaCheckPermission("yy:dashboard:list")
    @GetMapping("/overview")
    public R<YyDashboardOverviewVo> overview() {
        return R.ok(yyDashboardService.overview());
    }

    /**
     * 查询首页经营概况财务聚合
     */
    @SaCheckPermission("yy:dashboard:list")
    @GetMapping("/finance")
    public R<YyDashboardFinanceVo> finance(
        @RequestParam(required = false) String date,
        @RequestParam(required = false) Long storeId
    ) {
        return R.ok(yyDashboardService.finance(date, storeId));
    }

    @SaCheckPermission("yy:dashboard:list")
    @GetMapping("/order-status-stats")
    public R<List<YyDashboardOrderStatusStatVo>> orderStatusStats(
        @RequestParam(required = false) String date,
        @RequestParam(required = false) Long storeId
    ) {
        return R.ok(yyDashboardService.orderStatusStats(date, storeId));
    }

    @SaCheckPermission("yy:dashboard:list")
    @GetMapping("/trend-stats")
    public R<List<YyDashboardTrendStatVo>> trendStats(
        @RequestParam(required = false) String endDate,
        @RequestParam(required = false) Integer days,
        @RequestParam(required = false) Long storeId
    ) {
        return R.ok(yyDashboardService.trendStats(endDate, days, storeId));
    }

    @SaCheckPermission("yy:dashboard:list")
    @GetMapping("/today-slots")
    public R<List<YyDashboardTodaySlotVo>> todaySlots(
        @RequestParam(required = false) String date,
        @RequestParam(required = false) Long storeId
    ) {
        return R.ok(yyDashboardService.todaySlots(date, storeId));
    }

    @SaCheckPermission("yy:dashboard:list")
    @GetMapping("/product-ranking")
    public R<YyDashboardProductRankingVo> productRanking(
        @RequestParam(required = false) String date,
        @RequestParam(required = false) Long storeId,
        @RequestParam(required = false) Integer topN
    ) {
        return R.ok(yyDashboardService.productRanking(date, storeId, topN));
    }

    @SaCheckPermission("yy:dashboard:list")
    @GetMapping("/conversion")
    public R<YyDashboardConversionVo> conversion(
        @RequestParam(required = false) String date,
        @RequestParam(required = false) Long storeId
    ) {
        return R.ok(yyDashboardService.conversion(date, storeId));
    }

    @SaCheckPermission("yy:dashboard:export")
    @Log(title = "首页汇总导出", businessType = BusinessType.EXPORT)
    @PostMapping("/export")
    public void export(YyDashboardExportBo bo, HttpServletResponse response) {
        List<YyDashboardExportVo> list = yyDashboardService.exportRows(bo);
        ExcelUtil.exportExcel(list, "首页汇总导出", YyDashboardExportVo.class, response);
    }

    /**
     * 查询排期看板14天网格
     */
    @SaCheckPermission("yy:dashboard:list")
    @GetMapping("/schedule-grid")
    public R<YyDashboardScheduleGridVo> scheduleGrid(
        @RequestParam(required = false) Long storeId
    ) {
        return R.ok(yyDashboardService.scheduleGrid(storeId));
    }
}
