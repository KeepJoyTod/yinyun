package org.dromara.yy.service.dashboard;

import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.vo.YyDashboardConversionVo;
import org.dromara.yy.domain.vo.YyDashboardFinanceVo;
import org.dromara.yy.domain.vo.YyDashboardOrderStatusStatVo;
import org.dromara.yy.domain.vo.YyDashboardProductRankingRowVo;
import org.dromara.yy.domain.vo.YyDashboardProductRankingVo;
import org.dromara.yy.domain.vo.YyDashboardTrendStatVo;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Predicate;

@Component
public class YyDashboardMetricsAssembler {

    public YyDashboardFinanceVo aggregateFinance(String dateKey, Long storeId, List<YyOrder> orders, ZoneId zoneId) {
        YyDashboardFinanceVo finance = YyDashboardDomainSupport.emptyFinance(dateKey, storeId);
        for (YyOrder order : orders) {
            if (storeId != null && !Objects.equals(storeId, order.getStoreId())) {
                continue;
            }
            if (!dateKey.equals(YyDashboardDomainSupport.resolveOperationalDate(order, zoneId))) {
                continue;
            }
            applyFinanceOrder(finance, order);
        }
        return finance;
    }

    public List<YyOrder> filterOrdersByOperationalDate(List<YyOrder> orders, String dateKey, ZoneId zoneId) {
        return orders.stream()
            .filter(order -> dateKey.equals(YyDashboardDomainSupport.resolveOperationalDate(order, zoneId)))
            .toList();
    }

    public List<YyDashboardOrderStatusStatVo> buildOrderStatusStats(List<YyOrder> orders) {
        return List.of(
            statusStat("待服务", "待服务", orders, order -> !YyDashboardDomainSupport.isCanceled(order)
                && !YyDashboardDomainSupport.isRefunded(order)
                && "PENDING".equals(YyDashboardDomainSupport.statusKey(order))),
            statusStat("服务中", "服务中", orders, order -> !YyDashboardDomainSupport.isCanceled(order)
                && !YyDashboardDomainSupport.isRefunded(order)
                && List.of("CONFIRMED", "ARRIVED", "SERVING", "SHOOTING", "IN_SERVICE")
                .contains(YyDashboardDomainSupport.statusKey(order))),
            statusStat("已完成", "已完成", orders, order -> !YyDashboardDomainSupport.isCanceled(order)
                && !YyDashboardDomainSupport.isRefunded(order)
                && List.of("COMPLETED", "FINISHED", "DONE")
                .contains(YyDashboardDomainSupport.statusKey(order))),
            statusStat("已取消", "已取消", orders, YyDashboardDomainSupport::isCanceled),
            statusStat("已退款", "已退款", orders,
                order -> YyDashboardDomainSupport.isRefunded(order) && !YyDashboardDomainSupport.isCanceled(order))
        );
    }

    public List<YyDashboardTrendStatVo> buildTrendStats(
        LocalDate endDate,
        int days,
        List<YyOrder> orders,
        ZoneId zoneId
    ) {
        Map<String, YyDashboardDomainSupport.TrendBucket> buckets = new HashMap<>();
        for (YyOrder order : orders) {
            String bookedKey = YyDashboardDomainSupport.toDateKey(order.getOrderTime(), zoneId);
            if (!bookedKey.isEmpty()) {
                YyDashboardDomainSupport.TrendBucket bucket =
                    buckets.computeIfAbsent(bookedKey, key -> new YyDashboardDomainSupport.TrendBucket());
                bucket.incrementBooked(
                    YyDashboardDomainSupport.firstPositive(order.getTotalAmountCent(), order.getPaidAmountCent(), 0L)
                );
            }
            String arrivedKey = YyDashboardDomainSupport.resolveArrivedTrendDate(order, zoneId);
            if (!arrivedKey.isEmpty()) {
                YyDashboardDomainSupport.TrendBucket bucket =
                    buckets.computeIfAbsent(arrivedKey, key -> new YyDashboardDomainSupport.TrendBucket());
                bucket.incrementArrived();
            }
        }

        List<YyDashboardTrendStatVo> rows = new ArrayList<>();
        for (int index = days - 1; index >= 0; index--) {
            LocalDate day = endDate.minusDays(index);
            String dayKey = day.toString();
            YyDashboardDomainSupport.TrendBucket bucket =
                buckets.getOrDefault(dayKey, YyDashboardDomainSupport.TrendBucket.empty());
            YyDashboardTrendStatVo vo = new YyDashboardTrendStatVo();
            vo.setDay(dayKey);
            vo.setBookedCount(bucket.bookedCount());
            vo.setArrivedCount(bucket.arrivedCount());
            vo.setAmountCent(bucket.amountCent());
            rows.add(vo);
        }
        return rows;
    }

    public YyDashboardProductRankingVo buildProductRanking(List<YyOrder> orders, int topN) {
        Map<String, YyDashboardDomainSupport.ProductStats> statsByProduct = new HashMap<>();
        for (YyOrder order : orders) {
            String label = YyDashboardDomainSupport.productLabel(order);
            YyDashboardDomainSupport.ProductStats stats =
                statsByProduct.computeIfAbsent(label, YyDashboardDomainSupport.ProductStats::new);
            stats.accumulate(
                YyDashboardDomainSupport.firstPositive(order.getTotalAmountCent(), order.getPaidAmountCent(), 0L)
            );
        }

        List<YyDashboardDomainSupport.ProductStats> rankedByCount = statsByProduct.values().stream()
            .sorted(Comparator
                .comparingLong(YyDashboardDomainSupport.ProductStats::count).reversed()
                .thenComparing(Comparator.comparingLong(YyDashboardDomainSupport.ProductStats::amountCent).reversed())
                .thenComparing(YyDashboardDomainSupport.ProductStats::label))
            .limit(topN)
            .toList();
        List<YyDashboardDomainSupport.ProductStats> rankedByAmount = statsByProduct.values().stream()
            .sorted(Comparator
                .comparingLong(YyDashboardDomainSupport.ProductStats::amountCent).reversed()
                .thenComparing(Comparator.comparingLong(YyDashboardDomainSupport.ProductStats::count).reversed())
                .thenComparing(YyDashboardDomainSupport.ProductStats::label))
            .limit(topN)
            .toList();

        YyDashboardProductRankingVo vo = new YyDashboardProductRankingVo();
        vo.setByOrderCount(toProductRankingRows(rankedByCount));
        vo.setByAmount(toProductRankingRows(rankedByAmount));
        return vo;
    }

    public YyDashboardConversionVo buildConversion(String dateKey, Long storeId, List<YyOrder> orders) {
        long bookedCount = orders.size();
        long paidCount = orders.stream().filter(YyDashboardDomainSupport::isPaid).count();
        long arrivedCount = orders.stream().filter(YyDashboardDomainSupport::isArrived).count();
        long completedCount = orders.stream().filter(YyDashboardDomainSupport::isCompleted).count();

        YyDashboardConversionVo vo = new YyDashboardConversionVo();
        vo.setDate(dateKey);
        vo.setStoreId(storeId);
        vo.setBookedCount(bookedCount);
        vo.setPaidCount(paidCount);
        vo.setArrivedCount(arrivedCount);
        vo.setCompletedCount(completedCount);
        vo.setPaidRate(YyDashboardDomainSupport.ratio(paidCount, bookedCount));
        vo.setArrivedRate(YyDashboardDomainSupport.ratio(arrivedCount, paidCount));
        vo.setCompletedRate(YyDashboardDomainSupport.ratio(completedCount, arrivedCount));
        return vo;
    }

    private void applyFinanceOrder(YyDashboardFinanceVo finance, YyOrder order) {
        long orderAmountCent = YyDashboardDomainSupport.firstPositive(order.getTotalAmountCent(), order.getPaidAmountCent(), 0L);
        long paidAmountCent = YyDashboardDomainSupport.paidAmountCent(order, orderAmountCent);
        long refundAmountCent = Math.max(0L, YyDashboardDomainSupport.valueOrZero(order.getRefundAmountCent()));

        finance.setOrderCount(finance.getOrderCount() + 1);
        finance.setOrderAmountCent(finance.getOrderAmountCent() + orderAmountCent);
        finance.setProductAmountCent(finance.getProductAmountCent() + orderAmountCent);
        finance.setRefundAmountCent(finance.getRefundAmountCent() + refundAmountCent);
        finance.setActualIncomeCent(finance.getActualIncomeCent() + Math.max(0L, paidAmountCent - refundAmountCent));
        if (!YyDashboardDomainSupport.isCanceled(order) && !YyDashboardDomainSupport.isRefunded(order)) {
            finance.setExpectedIncomeCent(finance.getExpectedIncomeCent() + orderAmountCent);
        }
        YyDashboardDomainSupport.applyStatusCount(finance, order);
    }

    private YyDashboardOrderStatusStatVo statusStat(
        String status,
        String label,
        List<YyOrder> orders,
        Predicate<YyOrder> matcher
    ) {
        List<YyOrder> rows = orders.stream().filter(matcher).toList();
        YyDashboardOrderStatusStatVo vo = new YyDashboardOrderStatusStatVo();
        vo.setStatus(status);
        vo.setLabel(label);
        vo.setCount((long) rows.size());
        vo.setAmountCent(rows.stream()
            .mapToLong(order -> YyDashboardDomainSupport.firstPositive(order.getTotalAmountCent(), order.getPaidAmountCent(), 0L))
            .sum());
        return vo;
    }

    private List<YyDashboardProductRankingRowVo> toProductRankingRows(List<YyDashboardDomainSupport.ProductStats> rows) {
        List<YyDashboardProductRankingRowVo> result = new ArrayList<>();
        for (int index = 0; index < rows.size(); index++) {
            YyDashboardDomainSupport.ProductStats stats = rows.get(index);
            YyDashboardProductRankingRowVo row = new YyDashboardProductRankingRowVo();
            row.setRank(index + 1);
            row.setProductName(stats.label());
            row.setOrderCount(stats.count());
            row.setAmountCent(stats.amountCent());
            result.add(row);
        }
        return result;
    }
}
