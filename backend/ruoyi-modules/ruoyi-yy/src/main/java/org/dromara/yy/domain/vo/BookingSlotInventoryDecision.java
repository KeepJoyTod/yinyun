package org.dromara.yy.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 订单支付后预约库存处理结果。
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingSlotInventoryDecision {

    /**
     * 库存状态：CONFIRMED、CONFLICT、SKIPPED
     */
    private String inventoryStatus;

    /**
     * 是否本次实际扣减库存。
     */
    private boolean deducted;

    /**
     * 关联的库存时段ID。
     */
    private Long inventorySlotId;

    /**
     * 说明或冲突原因。
     */
    private String message;

    public static BookingSlotInventoryDecision confirmed(Long inventorySlotId, boolean deducted) {
        return new BookingSlotInventoryDecision("CONFIRMED", deducted, inventorySlotId, "");
    }

    public static BookingSlotInventoryDecision conflict(Long inventorySlotId, String message) {
        return new BookingSlotInventoryDecision("CONFLICT", false, inventorySlotId, message);
    }

    public static BookingSlotInventoryDecision skipped(String message) {
        return new BookingSlotInventoryDecision("SKIPPED", false, null, message);
    }
}
