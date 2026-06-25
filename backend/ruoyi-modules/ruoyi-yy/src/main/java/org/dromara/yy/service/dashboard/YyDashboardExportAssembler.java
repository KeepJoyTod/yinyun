package org.dromara.yy.service.dashboard;

import lombok.RequiredArgsConstructor;
import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.bo.YyDashboardExportBo;
import org.dromara.yy.domain.vo.YyDashboardExportVo;
import org.dromara.yy.domain.vo.YyDashboardFinanceVo;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class YyDashboardExportAssembler {

    private final YyDashboardMetricsAssembler metricsAssembler;

    public YyDashboardDomainSupport.ExportDateRange parseExportDateRange(YyDashboardExportBo bo) {
        if (bo == null || StringUtils.isBlank(bo.getBeginDate()) || StringUtils.isBlank(bo.getEndDate())) {
            throw new ServiceException("导出开始日期和结束日期不能为空");
        }
        try {
            LocalDate beginDate = LocalDate.parse(bo.getBeginDate().trim());
            LocalDate endDate = LocalDate.parse(bo.getEndDate().trim());
            if (beginDate.isAfter(endDate)) {
                throw new ServiceException("导出开始日期不能晚于结束日期");
            }
            if (ChronoUnit.DAYS.between(beginDate, endDate) > 30) {
                throw new ServiceException("首页导出日期范围不能超过31天");
            }
            return new YyDashboardDomainSupport.ExportDateRange(beginDate, endDate);
        } catch (DateTimeParseException ex) {
            throw new ServiceException("导出日期格式必须为 yyyy-MM-dd");
        }
    }

    public List<YyDashboardExportVo> buildRows(
        YyDashboardDomainSupport.ExportDateRange dateRange,
        Long storeId,
        String channelType,
        List<YyOrder> orders,
        Map<String, YyDashboardDomainSupport.SlotStats> slotStatsByDate,
        ZoneId zoneId
    ) {
        Map<String, List<YyOrder>> ordersByDate = orders.stream()
            .filter(order -> storeId == null || Objects.equals(storeId, order.getStoreId()))
            .filter(order -> StringUtils.isBlank(channelType)
                || Objects.equals(channelType, YyDashboardDomainSupport.normalizeText(order.getChannelType())))
            .collect(Collectors.groupingBy(order -> YyDashboardDomainSupport.resolveOperationalDate(order, zoneId),
                HashMap::new,
                Collectors.toList()));

        List<YyDashboardExportVo> rows = new ArrayList<>();
        LocalDate cursor = dateRange.begin();
        while (!cursor.isAfter(dateRange.end())) {
            String dateKey = cursor.toString();
            List<YyOrder> dayOrders = ordersByDate.getOrDefault(dateKey, Collections.emptyList());
            YyDashboardFinanceVo finance = metricsAssembler.aggregateFinance(dateKey, storeId, dayOrders, zoneId);
            rows.add(toExportRow(
                finance,
                dayOrders,
                slotStatsByDate.getOrDefault(dateKey, YyDashboardDomainSupport.SlotStats.empty()),
                channelType
            ));
            cursor = cursor.plusDays(1);
        }
        return rows;
    }

    private YyDashboardExportVo toExportRow(
        YyDashboardFinanceVo finance,
        List<YyOrder> orders,
        YyDashboardDomainSupport.SlotStats slotStats,
        String channelType
    ) {
        YyDashboardExportVo row = new YyDashboardExportVo();
        row.setDate(finance.getDate());
        row.setStoreId(finance.getStoreId() == null ? "全部门店" : String.valueOf(finance.getStoreId()));
        row.setChannel(summarizeChannels(orders, channelType));
        row.setActualIncomeYuan(YyDashboardDomainSupport.centsToYuan(finance.getActualIncomeCent()));
        row.setExpectedIncomeYuan(YyDashboardDomainSupport.centsToYuan(finance.getExpectedIncomeCent()));
        row.setProductAmountYuan(YyDashboardDomainSupport.centsToYuan(finance.getProductAmountCent()));
        row.setDiscountAmountYuan(YyDashboardDomainSupport.centsToYuan(finance.getDiscountAmountCent()));
        row.setOrderAmountYuan(YyDashboardDomainSupport.centsToYuan(finance.getOrderAmountCent()));
        row.setRefundAmountYuan(YyDashboardDomainSupport.centsToYuan(finance.getRefundAmountCent()));
        row.setOrderCount(finance.getOrderCount());
        row.setPendingOrderCount(finance.getPendingOrderCount());
        row.setServingOrderCount(finance.getServingOrderCount());
        row.setCompletedOrderCount(finance.getCompletedOrderCount());
        row.setCanceledOrderCount(finance.getCanceledOrderCount());
        row.setSlotCount(slotStats.slotCount());
        row.setCapacityTotal(slotStats.capacityTotal());
        row.setPaidCount(slotStats.paidCount());
        row.setRemainCount(slotStats.remainCount());
        row.setConflictCount(slotStats.conflictCount());
        row.setTopProductSummary(summarizeTopProducts(orders));
        return row;
    }

    private String summarizeChannels(List<YyOrder> orders, String channelType) {
        if (StringUtils.isNotBlank(channelType)) {
            return channelType;
        }
        List<String> channels = orders.stream()
            .map(YyDashboardDomainSupport::orderChannelLabel)
            .filter(StringUtils::isNotBlank)
            .distinct()
            .toList();
        if (channels.isEmpty()) {
            return "全部渠道";
        }
        if (channels.size() == 1) {
            return channels.get(0);
        }
        String summary = channels.stream().limit(3).collect(Collectors.joining("、"));
        return channels.size() > 3 ? "全部渠道(" + summary + "等)" : "全部渠道(" + summary + ")";
    }

    private String summarizeTopProducts(List<YyOrder> orders) {
        if (orders.isEmpty()) {
            return "无订单";
        }
        Map<String, YyDashboardDomainSupport.ProductStats> statsByProduct = new HashMap<>();
        for (YyOrder order : orders) {
            String label = YyDashboardDomainSupport.productLabel(order);
            YyDashboardDomainSupport.ProductStats stats =
                statsByProduct.computeIfAbsent(label, YyDashboardDomainSupport.ProductStats::new);
            stats.accumulate(
                YyDashboardDomainSupport.firstPositive(order.getTotalAmountCent(), order.getPaidAmountCent(), 0L)
            );
        }
        return statsByProduct.values().stream()
            .sorted((left, right) -> {
                int countCompare = Long.compare(right.count(), left.count());
                if (countCompare != 0) {
                    return countCompare;
                }
                return Long.compare(right.amountCent(), left.amountCent());
            })
            .limit(5)
            .map(stats -> stats.label() + ":" + stats.count() + " orders/CNY "
                + YyDashboardDomainSupport.centsToYuan(stats.amountCent()).toPlainString())
            .collect(Collectors.joining("; "));
    }
}
