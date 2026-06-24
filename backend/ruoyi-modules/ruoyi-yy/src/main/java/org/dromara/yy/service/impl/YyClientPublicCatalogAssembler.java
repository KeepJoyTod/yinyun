package org.dromara.yy.service.impl;

import org.dromara.common.core.utils.StringUtils;
import org.dromara.yy.domain.YyBookingSlotInventory;
import org.dromara.yy.domain.YyProduct;
import org.dromara.yy.domain.YyStore;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

final class YyClientPublicCatalogAssembler {

    private YyClientPublicCatalogAssembler() {
    }

    static Map<String, Object> brand(String brandCode, String brandName) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("brandId", brandCode);
        data.put("brandCode", brandCode);
        data.put("name", brandName);
        data.put("logo", "");
        data.put("logoUrl", "");
        data.put("summary", "真实门店、真实商品、真实时段库存的影约云客户预约入口");
        data.put("description", "影约云客户预约入口");
        data.put("themeColor", "#2f80ed");
        return data;
    }

    static List<Map<String, Object>> defaultMenuItems() {
        return List.of(
            menuItem("appointment", "预约时间", "STORE", "/pages/store/list/index", 10),
            menuItem("orders", "我的订单", "INTERNAL", "/pages/customer/orders/index", 20),
            menuItem("stores", "门店地址", "STORE", "/pages/store/list/index", 30),
            menuItem("service", "联系客服", "WECHAT_SERVICE", "", 40)
        );
    }

    static Map<String, Object> storeMap(YyStore store) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", String.valueOf(store.getId()));
        data.put("storeId", String.valueOf(store.getId()));
        data.put("name", store.getStoreName());
        data.put("province", "");
        data.put("city", "");
        data.put("district", "");
        data.put("address", StringUtils.defaultString(store.getAddress()));
        data.put("phone", StringUtils.defaultString(store.getPhone()));
        data.put("contactWechat", "");
        data.put("businessHours", StringUtils.defaultString(store.getBusinessHours()));
        data.put("status", toPublicStoreStatus(store.getStatus()));
        data.put("storeImage", "");
        data.put("imageUrl", "");
        data.put("sort", store.getSort());
        data.put("sortOrder", store.getSort());
        return data;
    }

    static Map<String, Object> productMap(YyProduct product) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", String.valueOf(product.getId()));
        data.put("productId", String.valueOf(product.getId()));
        data.put("storeId", String.valueOf(product.getStoreId()));
        data.put("categoryId", normalizeCategoryId(product.getProductType()));
        data.put("categoryName", normalizeCategoryName(product.getProductType()));
        data.put("name", product.getProductName());
        data.put("title", product.getProductName());
        data.put("subtitle", StringUtils.defaultString(product.getRemark()));
        data.put("coverImage", "");
        data.put("imageUrl", "");
        data.put("price", money(product.getPrice()));
        data.put("originalPrice", money(product.getPrice()));
        data.put("priceRange", product.getPrice() == null ? "" : "￥" + money(product.getPrice()));
        data.put("tag", "");
        data.put("includeCount", null);
        data.put("retouchCount", null);
        data.put("shootDuration", product.getDurationMinutes() == null ? "" : product.getDurationMinutes() + "分钟");
        data.put("applicableCount", "");
        data.put("makeupService", "");
        data.put("deliveryCycle", "");
        data.put("description", StringUtils.defaultString(product.getRemark()));
        data.put("refundRule", "退款以门店确认和平台规则为准");
        data.put("rescheduleRule", "改期请至少提前联系门店确认");
        data.put("status", toPublicProductStatus(product.getStatus()));
        data.put("sort", product.getSort());
        data.put("sortOrder", product.getSort());
        return data;
    }

    static Map<String, Object> skuMap(YyProduct product) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id", String.valueOf(product.getId()));
        data.put("skuId", String.valueOf(product.getId()));
        data.put("productId", String.valueOf(product.getId()));
        data.put("skuName", "标准档");
        data.put("price", money(product.getPrice()));
        data.put("originalPrice", money(product.getPrice()));
        data.put("durationMinutes", product.getDurationMinutes());
        data.put("stock", null);
        data.put("status", toPublicProductStatus(product.getStatus()));
        return data;
    }

    static List<Map<String, Object>> productCategories(List<YyProduct> products) {
        Map<String, Integer> countByType = new LinkedHashMap<>();
        for (YyProduct product : products) {
            String type = normalizeCategoryId(product.getProductType());
            countByType.put(type, countByType.getOrDefault(type, 0) + 1);
        }
        if (countByType.isEmpty()) {
            return List.of();
        }
        List<Map<String, Object>> result = new ArrayList<>();
        int sort = 0;
        for (Map.Entry<String, Integer> entry : countByType.entrySet()) {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("id", entry.getKey());
            data.put("categoryId", entry.getKey());
            data.put("name", normalizeCategoryName(entry.getKey()));
            data.put("icon", "");
            data.put("iconUrl", "");
            data.put("productCount", entry.getValue());
            data.put("sort", sort++);
            result.add(data);
        }
        return result;
    }

    static Map<String, Object> slotMap(YyBookingSlotInventory slot) {
        int capacity = Math.max(Objects.requireNonNullElse(slot.getCapacity(), 0), 0);
        int paidCount = Math.max(Objects.requireNonNullElse(slot.getPaidCount(), 0), 0);
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("date", slot.getBizDate());
        data.put("time", slot.getStartTime());
        data.put("start", slot.getStartTime());
        data.put("end", slot.getEndTime());
        data.put("available", "ACTIVE".equals(slot.getStatus()) && (capacity <= 0 || paidCount < capacity));
        data.put("studioId", slot.getServiceGroupId() == null ? "" : String.valueOf(slot.getServiceGroupId()));
        data.put("studioName", "");
        data.put("capacity", capacity);
        data.put("bookedCount", paidCount);
        data.put("remainingCount", capacity <= 0 ? null : Math.max(capacity - paidCount, 0));
        return data;
    }

    private static Map<String, Object> menuItem(String id, String label, String linkType, String linkTarget, int sort) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("menuItemId", id);
        data.put("label", label);
        data.put("icon", "");
        data.put("linkType", linkType);
        data.put("linkTarget", linkTarget);
        data.put("sort", sort);
        return data;
    }

    private static BigDecimal money(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private static String normalizeCategoryId(String productType) {
        return StringUtils.defaultIfBlank(StringUtils.trimToEmpty(productType), "default").toLowerCase(Locale.ROOT);
    }

    private static String normalizeCategoryName(String productType) {
        String normalized = normalizeCategoryId(productType);
        return switch (normalized) {
            case "portrait" -> "形象照";
            case "family" -> "亲子照";
            case "id" -> "证件照";
            case "wedding" -> "婚纱照";
            case "default" -> "摄影套餐";
            default -> StringUtils.defaultIfBlank(productType, "摄影套餐");
        };
    }

    private static String toPublicStoreStatus(String status) {
        return isActive(status) ? "OPEN" : "CLOSED";
    }

    private static String toPublicProductStatus(String status) {
        return isActive(status) ? "ON_SALE" : "OFF_SALE";
    }

    private static boolean isActive(String status) {
        String normalized = StringUtils.trimToEmpty(status).toUpperCase(Locale.ROOT);
        return Set.of("0", "OPEN", "ACTIVE", "ON_SALE").contains(normalized);
    }
}
