package org.dromara.yy.service.impl;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyOrder;
import org.dromara.yy.domain.YyPhotoAlbum;
import org.dromara.yy.domain.YyProduct;
import org.dromara.yy.domain.YyStore;
import org.dromara.yy.mapper.YyPhotoAlbumMapper;
import org.dromara.yy.mapper.YyProductMapper;
import org.dromara.yy.mapper.YyStoreMapper;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

final class YyClientCustomerOrderAssembler {

    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private YyClientCustomerOrderAssembler() {
    }

    static Map<String, Object> orderMap(YyOrder order, YyStoreMapper storeMapper, YyProductMapper productMapper,
                                        YyPhotoAlbumMapper photoAlbumMapper) {
        Map<String, Object> data = new LinkedHashMap<>();
        YyStore store = order.getStoreId() == null ? null : storeMapper.selectById(order.getStoreId());
        YyProduct product = findProductByOrder(order, productMapper);
        YyPhotoAlbum album = findLatestAlbum(order, photoAlbumMapper);
        String status = toCustomerStatus(order, album);
        data.put("id", String.valueOf(order.getId()));
        data.put("orderId", String.valueOf(order.getId()));
        data.put("orderNo", order.getOrderNo());
        data.put("storeId", order.getStoreId() == null ? "" : String.valueOf(order.getStoreId()));
        data.put("productId", product == null ? StringUtils.defaultString(order.getExternalProductId()) : String.valueOf(product.getId()));
        data.put("skuId", StringUtils.defaultIfBlank(order.getExternalSkuId(), product == null ? "" : String.valueOf(product.getId())));
        data.put("customerName", null);
        data.put("customerPhoneMasked", YyClientOrderPhoneMatcher.maskPhone(order.getCustomerPhone()));
        data.put("productTitle", product == null ? "影约云预约服务" : product.getProductName());
        data.put("productImage", "");
        data.put("skuName", "标准档");
        data.put("storeName", store == null ? "" : store.getStoreName());
        data.put("status", status);
        data.put("orderStatus", status);
        data.put("statusLabel", statusLabel(status));
        data.put("amount", centToMoney(order.getTotalAmountCent()));
        data.put("payAmount", centToMoney(order.getPaidAmountCent()));
        data.put("payStatus", StringUtils.defaultIfBlank(order.getPayStatus(), "UNPAID"));
        data.put("appointmentDate", StringUtils.defaultString(order.getSlotDate()));
        data.put("appointmentTimeSlot", appointmentTimeSlot(order));
        data.put("appointmentTime", appointmentTime(order));
        data.put("createdTime", formatDate(order.getOrderTime()));
        data.put("createdAt", formatDate(order.getOrderTime()));
        data.put("albumId", album == null || album.getId() == null ? null : String.valueOf(album.getId()));
        data.put("storePhone", store == null ? "" : StringUtils.defaultString(store.getPhone()));
        data.put("storeAddress", store == null ? "" : StringUtils.defaultString(store.getAddress()));
        data.put("refundRule", "退款以门店确认和平台规则为准");
        data.put("rescheduleRule", "改期请至少提前联系门店确认");
        data.put("canCancel", canCancel(order));
        data.put("canReschedule", canReschedule(order));
        data.put("rescheduleRemainingCount", canReschedule(order) ? 1 : 0);
        data.put("refundRatio", 0);
        data.put("estimatedRefundAmount", 0);
        return data;
    }

    private static YyPhotoAlbum findLatestAlbum(YyOrder order, YyPhotoAlbumMapper photoAlbumMapper) {
        if (order == null || order.getId() == null || photoAlbumMapper == null) {
            return null;
        }
        return photoAlbumMapper.selectList(Wrappers.<YyPhotoAlbum>lambdaQuery()
                .eq(YyPhotoAlbum::getOrderId, order.getId())
                .eq(YyPhotoAlbum::getDelFlag, "0")
                .orderByDesc(YyPhotoAlbum::getId)
                .last("limit 1"))
            .stream()
            .findFirst()
            .orElse(null);
    }

    private static YyProduct findProductByOrder(YyOrder order, YyProductMapper productMapper) {
        Long productId = tryParseLong(firstNotBlank(order.getExternalSkuId(), order.getExternalProductId()));
        return productId == null ? null : productMapper.selectById(productId);
    }

    private static boolean canCancel(YyOrder order) {
        return !Set.of("COMPLETED", "CANCELLED", "REFUNDED").contains(normalized(order.getStatus()));
    }

    private static boolean canReschedule(YyOrder order) {
        return !Set.of("COMPLETED", "CANCELLED", "REFUNDED").contains(normalized(order.getStatus()));
    }

    private static String toCustomerStatus(YyOrder order, YyPhotoAlbum album) {
        String status = normalized(order.getStatus());
        if ("UNPAID".equalsIgnoreCase(StringUtils.trimToEmpty(order.getPayStatus())) && !"CANCELLED".equals(status)) {
            return "PENDING_PAYMENT";
        }
        if (Set.of("COMPLETED", "DELIVERED").contains(status) && album != null) {
            String selectionStatus = normalized(album.getSelectionStatus());
            return switch (selectionStatus) {
                case "WAITING", "SUBMITTED" -> "PENDING_SELECTION";
                case "RETOUCHING" -> "RETOUCHING";
                case "DELIVERED" -> "DELIVERED";
                default -> "DELIVERED";
            };
        }
        return switch (status) {
            case "ARRIVED", "CONFIRMED" -> "CONFIRMED";
            case "SERVING", "SHOOTING" -> "SHOOTING";
            case "PENDING_SELECTION" -> "PENDING_SELECTION";
            case "RETOUCHING" -> "RETOUCHING";
            case "COMPLETED", "DELIVERED" -> "DELIVERED";
            case "CANCELLED" -> "CANCELLED";
            case "REFUNDING" -> "REFUNDING";
            case "REFUNDED" -> "REFUNDED";
            default -> "PENDING_CONFIRM";
        };
    }

    private static String statusLabel(String status) {
        return switch (status) {
            case "PENDING_PAYMENT" -> "待支付";
            case "PENDING_CONFIRM" -> "待确认";
            case "CONFIRMED" -> "已预约";
            case "SHOOTING" -> "服务中";
            case "PENDING_SELECTION" -> "待选片";
            case "RETOUCHING" -> "修图中";
            case "DELIVERED" -> "已完成";
            case "CANCELLED" -> "已取消";
            case "REFUNDING" -> "退款中";
            case "REFUNDED" -> "已退款";
            default -> status;
        };
    }

    private static String appointmentTimeSlot(YyOrder order) {
        if (StringUtils.isBlank(order.getSlotStartTime()) || StringUtils.isBlank(order.getSlotEndTime())) {
            return "";
        }
        return order.getSlotStartTime() + "-" + order.getSlotEndTime();
    }

    private static String appointmentTime(YyOrder order) {
        if (StringUtils.isBlank(order.getSlotDate())) {
            return formatDate(order.getArrivalTime());
        }
        return order.getSlotDate() + " " + appointmentTimeSlot(order);
    }

    private static String formatDate(Date date) {
        if (date == null) {
            return "";
        }
        return DATE_TIME_FORMATTER.format(date.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime());
    }

    private static BigDecimal centToMoney(Long cent) {
        return BigDecimal.valueOf(Objects.requireNonNullElse(cent, 0L)).divide(BigDecimal.valueOf(100));
    }

    private static Long tryParseLong(String value) {
        try {
            return StringUtils.isBlank(value) ? null : Long.parseLong(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private static String firstNotBlank(String... values) {
        for (String value : values) {
            if (StringUtils.isNotBlank(value)) {
                return value;
            }
        }
        return "";
    }

    private static String normalized(String value) {
        return StringUtils.trimToEmpty(value).toUpperCase(Locale.ROOT);
    }
}
