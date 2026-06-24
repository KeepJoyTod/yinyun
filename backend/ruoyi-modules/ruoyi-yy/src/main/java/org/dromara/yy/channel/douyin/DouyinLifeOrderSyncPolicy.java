package org.dromara.yy.channel.douyin;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.dromara.common.core.utils.StringUtils;

import java.util.Locale;

import static org.dromara.yy.channel.douyin.DouyinLifePayloadSupport.firstNotBlank;
import static org.dromara.yy.channel.douyin.DouyinLifePayloadSupport.firstText;
import static org.dromara.yy.channel.douyin.DouyinLifePayloadSupport.parseJsonObjectText;

final class DouyinLifeOrderSyncPolicy {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private DouyinLifeOrderSyncPolicy() {
    }

    static String mapLocalStatus(String eventStatus) {
        if (StringUtils.isBlank(eventStatus)) {
            return "UNKNOWN";
        }
        String normalizedStatus = eventStatus.trim().toUpperCase(Locale.ROOT).replace('-', '_');
        return switch (normalizedStatus) {
            case "1", "101", "201", "PAY_SUCCESS", "PAID", "PAYED",
                "WAIT_USE", "UNUSED", "TO_USE", "TO_BE_USED", "WAIT_SERVICE", "WAITING_SERVICE", "待服务" -> "PENDING";
            case "2", "202", "ACCEPTED", "CONFIRMED",
                "RESERVED", "BOOKED", "BOOKING_SUCCESS", "RESERVE_SUCCESS", "ACCEPT_SUCCESS", "CONFIRM_SUCCESS", "已确认" -> "CONFIRMED";
            case "3", "203", "IMPLEMENT_CONFIRMED", "SERVING",
                "IN_SERVICE", "SERVICE_START", "SERVICE_STARTED", "SERVICE_PROCESSING", "FULFIL_PROCESSING", "服务中", "拍摄中" -> "SERVING";
            case "4", "204", "USER_CONFIRMED", "COMPLETED", "FINISHED",
                "DONE", "FINISH", "SERVICE_FINISHED", "SERVICE_COMPLETED",
                "VERIFY", "VERIFY_SUCCESS", "VERIFIED", "USED", "CERTIFICATE_USED", "FULFIL_SUCCESS", "FULFILLED", "已完成", "选片中" -> "COMPLETED";
            case "5", "205", "CANCELLED", "CANCELED", "CANCEL", "CANCEL_SUCCESS", "ORDER_CANCELLED", "已取消" -> "CANCELLED";
            case "REFUND", "REFUND_SUCCESS", "REFUND_FINISHED", "REFUNDED" -> "REFUNDED";
            case "PARTIAL_REFUND", "PARTIAL_REFUND_SUCCESS", "PARTIAL_REFUNDED" -> "PARTIAL_REFUNDED";
            default -> eventStatus;
        };
    }

    static String mapPayStatus(String localStatus) {
        return switch (firstNotBlank(localStatus, "")) {
            case "PENDING", "CONFIRMED", "SERVING", "COMPLETED" -> "PAID";
            case "CANCELLED" -> "CLOSED";
            case "REFUNDED" -> "REFUNDED";
            case "PARTIAL_REFUNDED" -> "PARTIAL_REFUNDED";
            default -> "UNKNOWN";
        };
    }

    static boolean shouldSyncLocalOrder(String localStatus) {
        return switch (localStatus) {
            case "PENDING", "CONFIRMED", "SERVING", "COMPLETED", "CANCELLED", "REFUNDED", "PARTIAL_REFUNDED" -> true;
            default -> false;
        };
    }

    static boolean isRefundLocalStatus(String localStatus) {
        return "REFUNDED".equals(localStatus) || "PARTIAL_REFUNDED".equals(localStatus);
    }

    static boolean isInboundOrderSyncEvent(String normalizedApiKey) {
        if (StringUtils.isBlank(normalizedApiKey)) {
            return false;
        }
        return normalizedApiKey.contains("order-create")
            || normalizedApiKey.contains("pay-notify")
            || normalizedApiKey.contains("refund-notify")
            || normalizedApiKey.contains("refund-notice");
    }

    static boolean isInboundOrderSyncPayload(String payload) {
        if (StringUtils.isBlank(payload)) {
            return false;
        }
        try {
            JsonNode root = OBJECT_MAPPER.readTree(payload);
            String externalOrderId = firstText(root, "order_id", "orderId", "out_order_no", "outOrderNo", "book_id", "bookId");
            String eventStatus = firstNotBlank(
                firstText(root, "order_status", "orderStatus", "status", "status_code", "state", "event_status", "action"),
                firstText(parseJsonObjectText(firstText(root, "content", "Content", "data", "Data")),
                    "order_status", "orderStatus", "status", "status_code", "state", "event_status", "action")
            );
            if (StringUtils.isBlank(externalOrderId)) {
                externalOrderId = firstText(parseJsonObjectText(firstText(root, "content", "Content", "data", "Data")),
                    "order_id", "orderId", "out_order_no", "outOrderNo", "book_id", "bookId");
            }
            return StringUtils.isNotBlank(externalOrderId) && shouldSyncLocalOrder(mapLocalStatus(eventStatus));
        } catch (Exception ignored) {
            return false;
        }
    }
}
