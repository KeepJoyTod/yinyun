package org.dromara.yy.controller;

import cn.dev33.satoken.annotation.SaCheckPermission;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.domain.R;
import org.dromara.yy.domain.vo.YyDashboardFinanceVo;
import org.dromara.yy.domain.vo.YyDashboardOverviewVo;
import org.dromara.yy.domain.vo.YyDashboardScheduleGridVo;
import org.dromara.yy.service.IYyDashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
