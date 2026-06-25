package org.dromara.yy.service.dashboard;

import org.dromara.common.core.exception.ServiceException;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.vo.YyDashboardFinanceVo;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.Date;
import java.util.List;

public final class YyDashboardDomainSupport {

    private YyDashboardDomainSupport() {
    }

    public static String normalizeText(String value) {
        return StringUtils.defaultString(value).trim();
    }

    public static String normalizeClockText(String value) {
        String text = normalizeText(value);
        if (text.matches("^\\d{2}:\\d{2}:\\d{2}$")) {
            return text;
        }
        if (text.matches("^\\d{2}:\\d{2}$")) {
            return text + ":00";
        }
        return "";
    }

    public static String slotKey(String date, String startTime, String endTime) {
        String day = normalizeText(date);
        String start = normalizeClockText(startTime);
        String end = normalizeClockText(endTime);
        if (StringUtils.isBlank(day) || StringUtils.isBlank(start)) {
            return "";
        }
        return day + "|" + start + "|" + StringUtils.defaultIfBlank(end, start);
    }

    public static String toDateKey(Date value, ZoneId zoneId) {
        if (value == null) {
            return "";
        }
        return value.toInstant().atZone(zoneId).toLocalDate().toString();
    }

    public static String resolveOperationalDate(YyOrder order, ZoneId zoneId) {
        if (order == null) {
            return "";
        }
        if (StringUtils.isNotBlank(order.getSlotDate())) {
            return order.getSlotDate().trim();
        }
        if (order.getArrivalTime() != null) {
            return order.getArrivalTime().toInstant().atZone(zoneId).toLocalDate().toString();
        }
        if (order.getOrderTime() != null) {
            return order.getOrderTime().toInstant().atZone(zoneId).toLocalDate().toString();
        }
        return "";
    }

    public static String resolveArrivedTrendDate(YyOrder order, ZoneId zoneId) {
        if (StringUtils.isNotBlank(order.getSlotDate()) && StringUtils.isNotBlank(order.getSlotStartTime())) {
            return order.getSlotDate().trim();
        }
        if (order.getArrivalTime() != null) {
            return toDateKey(order.getArrivalTime(), zoneId);
        }
        return "";
    }

    public static String buildSlotDateTime(String slotDate, String slotTime) {
        String day = normalizeText(slotDate);
        String clock = normalizeClockText(slotTime);
        if (StringUtils.isBlank(day) || StringUtils.isBlank(clock)) {
            return "";
        }
        return day + " " + clock;
    }

    public static String resolveSlotEndTime(YyOrder order) {
        String endTime = normalizeClockText(order.getSlotEndTime());
        if (StringUtils.isNotBlank(endTime)) {
            return endTime;
        }
        String startTime = normalizeClockText(order.getSlotStartTime());
        if (StringUtils.isBlank(startTime)) {
            return "";
        }
        String[] parts = startTime.split(":");
        int hours = Integer.parseInt(parts[0]);
        int minutes = Integer.parseInt(parts[1]);
        int totalMinutes = hours * 60 + minutes + 60;
        int nextHour = (totalMinutes / 60) % 24;
        int nextMinute = totalMinutes % 60;
        return String.format("%02d:%02d:00", nextHour, nextMinute);
    }

    public static boolean hasRealSlotRange(YyOrder order) {
        return StringUtils.isNotBlank(normalizeText(order.getSlotDate()))
            && StringUtils.isNotBlank(normalizeClockText(order.getSlotStartTime()));
    }

    public static long firstPositive(Long first, Long second, Long fallback) {
        if (first != null && first > 0) {
            return first;
        }
        if (second != null && second > 0) {
            return second;
        }
        return valueOrZero(fallback);
    }

    public static long valueOrZero(Long value) {
        return value == null ? 0L : value;
    }

    public static int intOrZero(Integer value) {
        return value == null ? 0 : value;
    }

    public static long paidAmountCent(YyOrder order, long fallbackAmountCent) {
        if (order == null || !isPaid(order)) {
            return 0L;
        }
        long paidAmountCent = valueOrZero(order.getPaidAmountCent());
        return paidAmountCent > 0 ? paidAmountCent : fallbackAmountCent;
    }

    public static boolean isPaid(YyOrder order) {
        String payStatus = StringUtils.defaultString(order.getPayStatus()).trim().toUpperCase();
        return "PAID".equals(payStatus) || "PARTIAL_REFUNDED".equals(payStatus);
    }

    public static boolean isRefunded(YyOrder order) {
        String status = StringUtils.defaultString(order.getStatus()).trim().toUpperCase();
        String payStatus = StringUtils.defaultString(order.getPayStatus()).trim().toUpperCase();
        String refundStatus = StringUtils.defaultString(order.getRefundStatus()).trim().toUpperCase();
        return "REFUNDED".equals(status)
            || "REFUNDED".equals(payStatus)
            || "FULL_REFUNDED".equals(refundStatus);
    }

    public static boolean isCanceled(YyOrder order) {
        String status = StringUtils.defaultString(order.getStatus()).trim().toUpperCase();
        return "CANCELED".equals(status) || "CANCELLED".equals(status) || "CLOSED".equals(status);
    }

    public static boolean isArrived(YyOrder order) {
        return List.of("ARRIVED", "SERVING", "SHOOTING", "IN_SERVICE", "COMPLETED", "FINISHED", "DONE")
            .contains(statusKey(order));
    }

    public static boolean isCompleted(YyOrder order) {
        return List.of("COMPLETED", "FINISHED", "DONE").contains(statusKey(order));
    }

    public static String statusKey(YyOrder order) {
        return StringUtils.defaultString(order == null ? null : order.getStatus()).trim().toUpperCase();
    }

    public static String statusLabel(YyOrder order) {
        return switch (statusKey(order)) {
            case "PENDING" -> "待确认";
            case "CONFIRMED" -> "已确认";
            case "ARRIVED" -> "已到店";
            case "SERVING", "SHOOTING", "IN_SERVICE" -> "服务中";
            case "COMPLETED", "FINISHED", "DONE" -> "已完成";
            case "CANCELED", "CANCELLED", "CLOSED" -> "已取消";
            case "REFUNDED" -> "已退款";
            default -> normalizeText(order == null ? null : order.getStatus());
        };
    }

    public static double ratio(long numerator, long denominator) {
        if (denominator <= 0) {
            return 0D;
        }
        return BigDecimal.valueOf(numerator)
            .divide(BigDecimal.valueOf(denominator), 4, RoundingMode.HALF_UP)
            .doubleValue();
    }

    public static void applyStatusCount(YyDashboardFinanceVo finance, YyOrder order) {
        String status = StringUtils.defaultString(order.getStatus()).trim().toUpperCase();
        if (isCanceled(order) || isRefunded(order)) {
            finance.setCanceledOrderCount(finance.getCanceledOrderCount() + 1);
            return;
        }
        if ("COMPLETED".equals(status) || "FINISHED".equals(status) || "DONE".equals(status)) {
            finance.setCompletedOrderCount(finance.getCompletedOrderCount() + 1);
            return;
        }
        if ("SERVING".equals(status) || "SHOOTING".equals(status) || "IN_SERVICE".equals(status)) {
            finance.setServingOrderCount(finance.getServingOrderCount() + 1);
            return;
        }
        finance.setPendingOrderCount(finance.getPendingOrderCount() + 1);
    }

    public static YyDashboardFinanceVo emptyFinance(String dateKey, Long storeId) {
        YyDashboardFinanceVo finance = new YyDashboardFinanceVo();
        finance.setDate(dateKey);
        finance.setStoreId(storeId);
        finance.setActualIncomeCent(0L);
        finance.setExpectedIncomeCent(0L);
        finance.setProductAmountCent(0L);
        finance.setDiscountAmountCent(0L);
        finance.setOrderAmountCent(0L);
        finance.setRefundAmountCent(0L);
        finance.setOrderCount(0L);
        finance.setPendingOrderCount(0L);
        finance.setServingOrderCount(0L);
        finance.setCompletedOrderCount(0L);
        finance.setCanceledOrderCount(0L);
        return finance;
    }

    public static BigDecimal centsToYuan(Long cents) {
        return BigDecimal.valueOf(valueOrZero(cents)).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    public static String productLabel(YyOrder order) {
        String productId = normalizeText(order.getExternalProductId());
        String skuId = normalizeText(order.getExternalSkuId());
        if (StringUtils.isNotBlank(productId) && StringUtils.isNotBlank(skuId)) {
            return productId + "/" + skuId;
        }
        if (StringUtils.isNotBlank(skuId)) {
            return "SKU " + skuId;
        }
        if (StringUtils.isNotBlank(productId)) {
            return "Product " + productId;
        }
        return "Unknown product";
    }

    public static String orderChannelLabel(YyOrder order) {
        String channel = normalizeText(order.getChannelType());
        if (StringUtils.isNotBlank(channel)) {
            return channel;
        }
        String source = normalizeText(order.getSource());
        return StringUtils.isNotBlank(source) ? source : "UNKNOWN";
    }

    public static LocalDate parseRequiredDate(String date, String fieldLabel) {
        if (StringUtils.isBlank(date)) {
            throw new ServiceException(fieldLabel + "不能为空");
        }
        try {
            return LocalDate.parse(date.trim());
        } catch (DateTimeParseException ex) {
            throw new ServiceException(fieldLabel + "格式必须为 yyyy-MM-dd");
        }
    }

    public static int normalizePositiveLimit(Integer value, int defaultValue, int maxValue, String overflowMessage) {
        if (value == null || value <= 0) {
            return defaultValue;
        }
        if (value > maxValue) {
            throw new ServiceException(overflowMessage);
        }
        return value;
    }

    public static LocalDate parseFinanceDate(String date) {
        if (StringUtils.isBlank(date)) {
            return LocalDate.now();
        }
        return LocalDate.parse(date.trim());
    }

    public static final class ExportDateRange {
        private final LocalDate begin;
        private final LocalDate end;

        public ExportDateRange(LocalDate begin, LocalDate end) {
            this.begin = begin;
            this.end = end;
        }

        public LocalDate begin() {
            return begin;
        }

        public LocalDate end() {
            return end;
        }

        public String beginKey() {
            return begin.toString();
        }

        public String endKey() {
            return end.toString();
        }

        public Date beginTime(ZoneId zoneId) {
            return Date.from(begin.atStartOfDay(zoneId).toInstant());
        }

        public Date exclusiveEndTime(ZoneId zoneId) {
            return Date.from(end.plusDays(1).atStartOfDay(zoneId).toInstant());
        }
    }

    public static final class SlotStats {
        private long slotCount;
        private long capacityTotal;
        private long paidCount;
        private long remainCount;
        private long conflictCount;

        public static SlotStats empty() {
            return new SlotStats();
        }

        public void accumulate(Integer capacityValue, Integer paidValue, Integer conflictValue) {
            int capacity = intOrZero(capacityValue);
            int paid = intOrZero(paidValue);
            int conflict = intOrZero(conflictValue);
            slotCount++;
            capacityTotal += capacity;
            paidCount += paid;
            remainCount += Math.max(0, capacity - paid);
            conflictCount += conflict;
        }

        public long slotCount() {
            return slotCount;
        }

        public long capacityTotal() {
            return capacityTotal;
        }

        public long paidCount() {
            return paidCount;
        }

        public long remainCount() {
            return remainCount;
        }

        public long conflictCount() {
            return conflictCount;
        }
    }

    public static final class TrendBucket {
        private long bookedCount;
        private long arrivedCount;
        private long amountCent;

        public static TrendBucket empty() {
            return new TrendBucket();
        }

        public void incrementBooked(long amountCentValue) {
            bookedCount++;
            amountCent += amountCentValue;
        }

        public void incrementArrived() {
            arrivedCount++;
        }

        public long bookedCount() {
            return bookedCount;
        }

        public long arrivedCount() {
            return arrivedCount;
        }

        public long amountCent() {
            return amountCent;
        }
    }

    public static final class ProductStats {
        private final String label;
        private long count;
        private long amountCent;

        public ProductStats(String label) {
            this.label = label;
        }

        public void accumulate(long amountCentValue) {
            count++;
            amountCent += amountCentValue;
        }

        public String label() {
            return label;
        }

        public long count() {
            return count;
        }

        public long amountCent() {
            return amountCent;
        }
    }
}
