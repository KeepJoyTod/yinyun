package org.dromara.yy.service;

import org.dromara.yy.domain.vo.YyDashboardOverviewVo;
import org.dromara.yy.domain.vo.YyDashboardFinanceVo;
import org.dromara.yy.domain.vo.YyDashboardScheduleGridVo;

/**
 * 影约云首页概况Service接口
 */
public interface IYyDashboardService {

    /**
     * 查询首页概况
     */
    YyDashboardOverviewVo overview();

    /**
     * 查询首页经营概况财务聚合
     */
    YyDashboardFinanceVo finance(String date, Long storeId);

    /**
     * 查询排期看板14天网格
     */
    YyDashboardScheduleGridVo scheduleGrid(Long storeId);
}
