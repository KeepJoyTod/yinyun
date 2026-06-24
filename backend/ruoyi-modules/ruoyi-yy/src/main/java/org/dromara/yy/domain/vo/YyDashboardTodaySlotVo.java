package org.dromara.yy.domain.vo;

import lombok.Data;

@Data
public class YyDashboardTodaySlotVo {

    private Long bookingId;

    private Long storeId;

    private String storeName;

    private Long studioId;

    private String studioName;

    private String startAt;

    private String endAt;

    private String bookingStatus;

    private Long orderId;

    private String orderNo;

    private String customerName;

    private String customerPhone;

    private String serviceName;

    private String orderStatus;
}
