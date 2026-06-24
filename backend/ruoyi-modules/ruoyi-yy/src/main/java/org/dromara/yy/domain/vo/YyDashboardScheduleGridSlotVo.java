package org.dromara.yy.domain.vo;

import lombok.Data;

/**
 * 排期看板单个时段格子视图对象。
 */
@Data
public class YyDashboardScheduleGridSlotVo {

    private Long id;

    private Long storeId;

    private String bizDate;

    private String startTime;

    private String endTime;

    private Integer capacity;

    private Integer paidCount;

    private Integer conflictCount;

    /**
     * 剩余可预约数 = capacity - paidCount
     */
    private Integer remainCount;

    /**
     * SLOT_EMPTY / SLOT_FULL / SLOT_PARTIAL / SLOT_CONFLICT
     */
    private String slotStatus;

    /**
     * 该时段下的订单摘要列表
     */
    private java.util.List<SlotOrderSummary> orders;

    @Data
    public static class SlotOrderSummary {

        private Long orderId;

        private String orderNo;

        private String customerName;

        private String status;

        private Long paidAmountCent;

        private String source;
    }
}
