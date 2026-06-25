package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import lombok.RequiredArgsConstructor;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyPhotoAsset;
import org.dromara.yy.domain.YyStore;
import org.dromara.yy.domain.YyChannelPlugin;
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
import org.dromara.yy.mapper.YyChannelPluginMapper;
import org.dromara.yy.mapper.YyOrderMapper;
import org.dromara.yy.mapper.YyPhotoAlbumMapper;
import org.dromara.yy.mapper.YyPhotoAssetMapper;
import org.dromara.yy.mapper.YyStoreMapper;
import org.dromara.yy.service.IYyDashboardService;
import org.dromara.yy.service.dashboard.YyDashboardDomainSupport;
import org.dromara.yy.service.dashboard.YyDashboardExportAssembler;
import org.dromara.yy.service.dashboard.YyDashboardMetricsAssembler;
import org.dromara.yy.service.dashboard.YyDashboardOrderQuerySupport;
import org.dromara.yy.service.dashboard.YyDashboardScheduleAssembler;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class YyDashboardServiceImpl implements IYyDashboardService {

    private final YyStoreMapper storeMapper;
    private final YyOrderMapper orderMapper;
    private final YyPhotoAlbumMapper photoAlbumMapper;
    private final YyPhotoAssetMapper photoAssetMapper;
    private final YyChannelPluginMapper channelPluginMapper;
    private final YyDashboardOrderQuerySupport orderQuerySupport;
    private final YyDashboardMetricsAssembler metricsAssembler;
    private final YyDashboardScheduleAssembler scheduleAssembler;
    private final YyDashboardExportAssembler exportAssembler;

    @Override
    public YyDashboardOverviewVo overview() {
        YyDashboardOverviewVo overview = new YyDashboardOverviewVo();
        overview.setStoreTotal(storeMapper.selectCount(Wrappers.lambdaQuery(YyStore.class)));
        overview.setBusinessStoreTotal(storeMapper.selectCount(
            Wrappers.lambdaQuery(YyStore.class).eq(YyStore::getStatus, "0")));
        overview.setOrderTotal(orderMapper.selectCount(Wrappers.lambdaQuery(YyOrder.class)));
        overview.setPendingOrderTotal(orderMapper.selectCount(
            Wrappers.lambdaQuery(YyOrder.class).eq(YyOrder::getStatus, "PENDING")));
        overview.setArrivedOrderTotal(orderMapper.selectCount(
            Wrappers.lambdaQuery(YyOrder.class).eq(YyOrder::getStatus, "ARRIVED")));
        overview.setCompletedOrderTotal(orderMapper.selectCount(
            Wrappers.lambdaQuery(YyOrder.class).eq(YyOrder::getStatus, "COMPLETED")));
        overview.setAlbumTotal(photoAlbumMapper.selectCount(Wrappers.lambdaQuery()));
        overview.setSelectedAssetTotal(photoAssetMapper.selectCount(
            Wrappers.lambdaQuery(YyPhotoAsset.class).eq(YyPhotoAsset::getIsSelected, "1")));
        overview.setChannelPluginTotal(channelPluginMapper.selectCount(Wrappers.lambdaQuery(YyChannelPlugin.class)));
        overview.setUnopenedChannelPluginTotal(channelPluginMapper.selectCount(
            Wrappers.lambdaQuery(YyChannelPlugin.class).eq(YyChannelPlugin::getAuthStatus, "UNOPENED")));
        return overview;
    }

    @Override
    public YyDashboardFinanceVo finance(String date, Long storeId) {
        LocalDate targetDate = YyDashboardDomainSupport.parseFinanceDate(date);
        ZoneId zoneId = ZoneId.systemDefault();
        List<YyOrder> orders = orderQuerySupport.selectOperationalOrders(targetDate, targetDate, storeId, null, zoneId);
        return metricsAssembler.aggregateFinance(targetDate.toString(), storeId, orders, zoneId);
    }

    @Override
    public List<YyDashboardOrderStatusStatVo> orderStatusStats(String date, Long storeId) {
        LocalDate targetDate = YyDashboardDomainSupport.parseRequiredDate(date, "首页统计日期");
        ZoneId zoneId = ZoneId.systemDefault();
        List<YyOrder> orders = orderQuerySupport.selectOperationalOrders(targetDate, targetDate, storeId, null, zoneId);
        return metricsAssembler.buildOrderStatusStats(
            metricsAssembler.filterOrdersByOperationalDate(orders, targetDate.toString(), zoneId)
        );
    }

    @Override
    public List<YyDashboardTrendStatVo> trendStats(String endDate, Integer days, Long storeId) {
        LocalDate targetEndDate = YyDashboardDomainSupport.parseRequiredDate(endDate, "首页趋势结束日期");
        int safeDays = YyDashboardDomainSupport.normalizePositiveLimit(days, 20, 31, "首页趋势天数不能超过31天");
        LocalDate beginDate = targetEndDate.minusDays(safeDays - 1L);
        ZoneId zoneId = ZoneId.systemDefault();
        List<YyOrder> orders = orderQuerySupport.selectOperationalOrders(beginDate, targetEndDate, storeId, null, zoneId);
        return metricsAssembler.buildTrendStats(targetEndDate, safeDays, orders, zoneId);
    }

    @Override
    public List<YyDashboardTodaySlotVo> todaySlots(String date, Long storeId) {
        LocalDate targetDate = YyDashboardDomainSupport.parseRequiredDate(date, "首页排期日期");
        ZoneId zoneId = ZoneId.systemDefault();
        String dateKey = targetDate.toString();
        List<YyOrder> orders = orderQuerySupport.selectOperationalOrders(targetDate, targetDate, storeId, null, zoneId);
        Map<Long, String> storeNameMap = orderQuerySupport.selectStoreNameMap(storeId);
        return scheduleAssembler.buildTodaySlots(
            dateKey,
            orderQuerySupport.selectTodaySlotInventories(dateKey, storeId),
            orders,
            storeNameMap
        );
    }

    @Override
    public YyDashboardProductRankingVo productRanking(String date, Long storeId, Integer topN) {
        LocalDate targetDate = YyDashboardDomainSupport.parseRequiredDate(date, "首页产品排行日期");
        int safeTopN = YyDashboardDomainSupport.normalizePositiveLimit(topN, 10, 20, "首页产品排行TopN不能超过20");
        ZoneId zoneId = ZoneId.systemDefault();
        List<YyOrder> orders = orderQuerySupport.selectOperationalOrders(targetDate, targetDate, storeId, null, zoneId);
        return metricsAssembler.buildProductRanking(
            metricsAssembler.filterOrdersByOperationalDate(orders, targetDate.toString(), zoneId),
            safeTopN
        );
    }

    @Override
    public YyDashboardConversionVo conversion(String date, Long storeId) {
        LocalDate targetDate = YyDashboardDomainSupport.parseRequiredDate(date, "首页转化日期");
        ZoneId zoneId = ZoneId.systemDefault();
        List<YyOrder> orders = orderQuerySupport.selectOperationalOrders(targetDate, targetDate, storeId, null, zoneId);
        return metricsAssembler.buildConversion(
            targetDate.toString(),
            storeId,
            metricsAssembler.filterOrdersByOperationalDate(orders, targetDate.toString(), zoneId)
        );
    }

    @Override
    public List<YyDashboardExportVo> exportRows(YyDashboardExportBo bo) {
        YyDashboardDomainSupport.ExportDateRange dateRange = exportAssembler.parseExportDateRange(bo);
        Long storeId = bo == null ? null : bo.getStoreId();
        String channelType = YyDashboardDomainSupport.normalizeText(bo == null ? null : bo.getChannelType());
        ZoneId zoneId = ZoneId.systemDefault();
        List<YyOrder> orders = orderQuerySupport.selectOperationalOrders(
            dateRange.begin(),
            dateRange.end(),
            storeId,
            StringUtils.isBlank(channelType) ? null : channelType,
            zoneId
        );
        return exportAssembler.buildRows(
            dateRange,
            storeId,
            channelType,
            orders,
            orderQuerySupport.aggregateSlotStats(dateRange, storeId),
            zoneId
        );
    }

    @Override
    public YyDashboardScheduleGridVo scheduleGrid(Long storeId) {
        List<String> dates = scheduleAssembler.buildScheduleGridDates(LocalDate.now(), 14);
        String startDate = dates.get(0);
        String endDate = dates.get(dates.size() - 1);
        return scheduleAssembler.buildScheduleGrid(
            storeId,
            dates,
            orderQuerySupport.selectScheduleGridSlots(startDate, endDate, storeId),
            orderQuerySupport.selectScheduleGridOrders(startDate, endDate, storeId)
        );
    }
}
