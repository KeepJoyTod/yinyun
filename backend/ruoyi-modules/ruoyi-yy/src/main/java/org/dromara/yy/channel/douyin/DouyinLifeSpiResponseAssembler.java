package org.dromara.yy.channel.douyin;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.dromara.common.core.utils.StringUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.function.Supplier;

import static org.dromara.yy.channel.douyin.DouyinLifePayloadSupport.certificateCode;
import static org.dromara.yy.channel.douyin.DouyinLifePayloadSupport.firstNotBlank;
import static org.dromara.yy.channel.douyin.DouyinLifePayloadSupport.firstText;
import static org.dromara.yy.channel.douyin.DouyinLifePayloadSupport.numericDigest;
import static org.dromara.yy.channel.douyin.DouyinLifePayloadSupport.parsePositiveInt;

final class DouyinLifeSpiResponseAssembler {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private DouyinLifeSpiResponseAssembler() {
    }

    static Map<String, Object> genericSuccess(
        String apiName,
        String payload,
        Function<JsonNode, Integer> stockResolver
    ) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("error_code", 0);
        data.put("description", "success");
        data.put("result", 1);
        try {
            JsonNode root = StringUtils.isBlank(payload) ? null : OBJECT_MAPPER.readTree(payload);
            if (apiName.contains("order-create") || apiName.contains("order_create")) {
                appendReservationOrderCreateData(data, root, payload);
            }
            if (apiName.contains("order-query") || apiName.contains("order_query")) {
                data.put("order_id", firstNotBlank(firstText(root, "order_id", "orderId"), ""));
                data.put("third_order_id", firstNotBlank(firstText(root, "third_order_id", "thirdOrderId"), ""));
                data.put("order_status", firstNotBlank(firstText(root, "order_status", "orderStatus", "status"), "UNKNOWN"));
            }
            if ((apiName.contains("stock-query") || apiName.contains("stock_query")) && stockResolver != null) {
                appendStockQueryData(data, root, stockResolver);
            }
        } catch (Exception ignored) {
            // 回调落库优先，未知字段不阻塞平台重试。
        }
        return wrapData(data);
    }

    static Map<String, Object> refundApplyResponse(
        String payload,
        Supplier<String> refundModeSupplier,
        Supplier<String> rejectReasonSupplier
    ) {
        String mode = firstNotBlank(
            refundModeSupplier == null ? "" : refundModeSupplier.get(),
            "processing"
        ).trim().toLowerCase(Locale.ROOT);

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("error_code", 0);
        switch (mode) {
            case "agree", "allow", "allowed", "success" -> {
                data.put("description", "success");
                data.put("result", 1);
            }
            case "reject", "refuse", "deny", "denied" -> appendRefundRejectData(data, payload, rejectReasonSupplier);
            default -> {
                data.put("description", "退款申请已接收，等待服务商审核回调");
                data.put("result", 0);
            }
        }
        return wrapData(data);
    }

    static Map<String, Object> genericFailure(String message) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("error_code", 9999);
        data.put("description", message);
        data.put("result", 2);
        data.put("fail_reason", "SIGNATURE_INVALID");
        data.put("fail_reason_desc", message);
        return wrapData(data);
    }

    static Map<String, Object> tripartiteCodeFailure(int errorCode, String message) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("error_code", errorCode);
        data.put("description", message);
        data.put("result", 2);
        data.put("fail_reason", "SYSTEM_ERROR");
        data.put("fail_reason_desc", message);
        return wrapData(data);
    }

    private static Map<String, Object> wrapData(Map<String, Object> data) {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("data", data);
        return response;
    }

    private static void appendRefundRejectData(
        Map<String, Object> data,
        String payload,
        Supplier<String> rejectReasonSupplier
    ) {
        String reason = firstNotBlank(
            rejectReasonSupplier == null ? "" : rejectReasonSupplier.get(),
            "服务商侧已发码或已核销，暂不支持退款"
        );
        data.put("description", reason);
        data.put("result", 2);
        data.put("reason", reason);

        try {
            JsonNode root = StringUtils.isBlank(payload) ? null : OBJECT_MAPPER.readTree(payload);
            List<Map<String, Object>> certificates = buildRefundRejectCertificates(root);
            if (!certificates.isEmpty()) {
                data.put("certificate", certificates);
                data.put("certificates", certificates);
                List<String> codes = certificates.stream()
                    .map(item -> String.valueOf(item.get("code")))
                    .filter(StringUtils::isNotBlank)
                    .toList();
                if (!codes.isEmpty()) {
                    data.put("codes", codes);
                }
                List<String> vouchers = certificates.stream()
                    .map(item -> String.valueOf(item.get("voucher")))
                    .filter(StringUtils::isNotBlank)
                    .toList();
                if (!vouchers.isEmpty()) {
                    data.put("vouchers", vouchers);
                }
            }
        } catch (Exception ignored) {
            // 拒绝原因优先返回，券码补充失败时不阻塞记录日志。
        }
    }

    private static List<Map<String, Object>> buildRefundRejectCertificates(JsonNode root) {
        if (root == null || root.isNull()) {
            return List.of();
        }
        String orderId = firstText(root, "order_id", "orderId");
        List<JsonNode> sourceCertificates = refundCertificateNodes(root);
        if (sourceCertificates.isEmpty()) {
            String certificateId = firstText(root, "certificate_id", "certificateId");
            if (StringUtils.isBlank(certificateId)) {
                return List.of();
            }
            sourceCertificates = List.of(root);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        int index = 1;
        for (JsonNode source : sourceCertificates) {
            String certificateId = firstText(source, "certificate_id", "certificateId");
            if (StringUtils.isBlank(certificateId)) {
                index++;
                continue;
            }
            String code = firstNotBlank(
                firstText(source, "code"),
                certificateCode(firstNotBlank(orderId, "refund"), certificateId, index)
            );
            Map<String, Object> certificate = new LinkedHashMap<>();
            certificate.put("certificate_id", certificateId);
            certificate.put("code", code);
            String voucher = firstText(source, "voucher");
            if (StringUtils.isNotBlank(voucher)) {
                certificate.put("voucher", voucher);
            }
            result.add(certificate);
            index++;
        }
        return result;
    }

    private static List<JsonNode> refundCertificateNodes(JsonNode root) {
        for (String fieldName : List.of("certificates", "certificate", "certificateList")) {
            JsonNode node = root.get(fieldName);
            if (node != null && node.isArray()) {
                List<JsonNode> result = new ArrayList<>();
                for (JsonNode item : node) {
                    result.add(item);
                }
                return result;
            }
        }
        return List.of();
    }

    private static void appendReservationOrderCreateData(Map<String, Object> data, JsonNode root, String payload) {
        String bookId = firstNotBlank(
            firstText(root, "book_id", "bookId"),
            firstText(root, "order_id", "orderId"),
            numericDigest("book|" + firstNotBlank(payload, ""), 18)
        );
        String outBookId = firstNotBlank(
            firstText(root, "out_book_id", "outBookId"),
            "YYB-" + bookId
        );
        data.put("book_id", bookId);
        data.put("out_book_id", outBookId);

        Map<String, Object> confirmInfo = new LinkedHashMap<>();
        confirmInfo.put("confirm_mode", parsePositiveInt(firstText(root, "confirm_mode", "confirmMode"), 1, 9));
        confirmInfo.put("confirm_result", parsePositiveInt(firstText(root, "confirm_result", "confirmResult"), 1, 9));
        confirmInfo.put("fulfil_type", parsePositiveInt(firstText(root, "fulfil_type", "fulfilType"), 1, 9));
        confirmInfo.put("hotel_confirm_number", outBookId);
        data.put("confirm_info", confirmInfo);
    }

    private static void appendStockQueryData(
        Map<String, Object> data,
        JsonNode root,
        Function<JsonNode, Integer> stockResolver
    ) {
        int stock = stockResolver.apply(root);
        data.put("stock", stock);
        data.put("available_stock", stock);
        data.put("available", stock > 0);

        List<String> dates = resolveStockQueryDates(root);
        List<JsonNode> skuNodes = stockQuerySkuNodes(root);
        List<Map<String, Object>> skuInfoList = new ArrayList<>();
        List<Map<String, Object>> flatStockList = new ArrayList<>();
        String poiId = firstText(root, "poi_id", "poiId");
        String startTime = firstNotBlank(firstText(root, "start_time", "startTime"), "10:00");
        String endTime = firstNotBlank(firstText(root, "end_time", "endTime"), "10:30");

        for (JsonNode skuNode : skuNodes) {
            String skuId = firstText(skuNode, "sku_id", "skuId");
            String skuOutId = firstText(skuNode, "sku_out_id", "skuOutId", "third_sku_id", "thirdSkuId");
            Map<String, Object> skuInfo = new LinkedHashMap<>();
            putObject(skuInfo, "sku_id", skuId);
            putObject(skuInfo, "sku_out_id", skuOutId);
            List<Map<String, Object>> stockItems = new ArrayList<>();
            for (String date : dates) {
                Map<String, Object> stockItem = buildStockQueryItem(poiId, skuId, skuOutId, date, startTime, endTime, stock);
                stockItems.add(stockItem);
                flatStockList.add(stockItem);
            }
            skuInfo.put("stock_info_list", stockItems);
            skuInfo.put("stock_list", stockItems);
            skuInfoList.add(skuInfo);
        }

        if (!skuInfoList.isEmpty()) {
            data.put("sku_info_list", skuInfoList);
        }
        if (!flatStockList.isEmpty()) {
            data.put("stock_info_list", flatStockList);
            data.put("stock_list", flatStockList);
            data.put("reception_stock_list", flatStockList);
        }
    }

    private static List<JsonNode> stockQuerySkuNodes(JsonNode root) {
        if (root != null && root.has("sku_info_list") && root.get("sku_info_list").isArray()) {
            List<JsonNode> nodes = new ArrayList<>();
            for (JsonNode item : root.get("sku_info_list")) {
                nodes.add(item);
            }
            return nodes;
        }
        return root == null ? List.of() : List.of(root);
    }

    private static List<String> resolveStockQueryDates(JsonNode root) {
        String date = firstText(root, "date", "biz_date", "bizDate", "booking_date", "bookingDate");
        if (StringUtils.isNotBlank(date)) {
            return List.of(date);
        }
        String startDate = firstText(root, "start_date", "startDate");
        String endDate = firstText(root, "end_date", "endDate");
        try {
            LocalDate start = StringUtils.isBlank(startDate) ? LocalDate.now() : LocalDate.parse(startDate);
            LocalDate end = StringUtils.isBlank(endDate) ? start : LocalDate.parse(endDate);
            if (end.isBefore(start)) {
                end = start;
            }
            List<String> dates = new ArrayList<>();
            LocalDate cursor = start;
            while (!cursor.isAfter(end) && dates.size() < 31) {
                dates.add(cursor.toString());
                cursor = cursor.plusDays(1);
            }
            return dates;
        } catch (Exception ignored) {
            return List.of(LocalDate.now().toString());
        }
    }

    private static Map<String, Object> buildStockQueryItem(
        String poiId,
        String skuId,
        String skuOutId,
        String date,
        String startTime,
        String endTime,
        int stock
    ) {
        Map<String, Object> item = new LinkedHashMap<>();
        putObject(item, "poi_id", poiId);
        putObject(item, "sku_id", skuId);
        putObject(item, "sku_out_id", skuOutId);
        item.put("date", date);
        item.put("start_time", startTime);
        item.put("end_time", endTime);
        item.put("time_range", List.of(startTime, endTime));
        item.put("stock", stock);
        item.put("available_stock", stock);
        item.put("available", stock > 0);
        return item;
    }

    private static void putObject(Map<String, Object> body, String key, Object value) {
        if (value != null) {
            body.put(key, value);
        }
    }
}
