package org.dromara.yy.service;

import org.dromara.yy.domain.vo.YyDashboardOverviewVo;
import org.dromara.yy.domain.vo.YyDashboardFinanceVo;
import org.dromara.yy.domain.vo.YyDashboardConversionVo;
import org.dromara.yy.domain.vo.YyDashboardOrderStatusStatVo;
import org.dromara.yy.domain.vo.YyDashboardProductRankingVo;
import org.dromara.yy.domain.vo.YyDashboardScheduleGridVo;
import org.dromara.yy.domain.vo.YyDashboardTodaySlotVo;
import org.dromara.yy.domain.vo.YyDashboardTrendStatVo;
import org.dromara.yy.domain.bo.YyDashboardExportBo;
import org.dromara.yy.domain.vo.YyDashboardExportVo;

import java.util.List;

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

    List<YyDashboardOrderStatusStatVo> orderStatusStats(String date, Long storeId);

    List<YyDashboardTrendStatVo> trendStats(String endDate, Integer days, Long storeId);

    List<YyDashboardTodaySlotVo> todaySlots(String date, Long storeId);

    YyDashboardProductRankingVo productRanking(String date, Long storeId, Integer topN);

    YyDashboardConversionVo conversion(String date, Long storeId);

    List<YyDashboardExportVo> exportRows(YyDashboardExportBo bo);

    /**
     * 查询排期看板14天网格
     */
    YyDashboardScheduleGridVo scheduleGrid(Long storeId);
}
