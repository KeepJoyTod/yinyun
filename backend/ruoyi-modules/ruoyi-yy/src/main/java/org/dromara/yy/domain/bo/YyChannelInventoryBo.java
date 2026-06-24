package org.dromara.yy.domain.bo;

import lombok.Data;

import java.util.Map;

/**
 * 渠道预约库存操作请求对象。
 */
@Data
public class YyChannelInventoryBo {

    private Long storeId;
    private String channelType;
    private String accountId;
    private String poiId;
    private String productId;
    private String skuId;
    private String skuOutId;
    private String skuName;
    private Integer skuOperateType;
    private String receptionUnitId;
    private Integer timeSlot;
    private String date;
    private String startDate;
    private String endDate;
    private String startTime;
    private String endTime;
    private Integer availableStock;
    private Boolean useTestDataHeader;
    private Map<String, Object> rawPayload;
}
