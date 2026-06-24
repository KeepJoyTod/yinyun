package org.dromara.yy.domain.vo;

import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyChannelInventorySlot;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 影约云渠道库存槽视图对象 yy_channel_inventory_slot
 */
@Data
@AutoMapper(target = YyChannelInventorySlot.class)
public class YyChannelInventorySlotVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private String tenantId;
    private Long storeId;
    private String channelType;
    private String accountId;
    private String poiId;
    private String skuId;
    private String skuOutId;
    private String bizDate;
    private String startTime;
    private String endTime;
    private Integer availableStock;
    private String syncStatus;
    private String lastLogId;
    private String rawPayload;
    private String remark;
    private Date createTime;
    private Date updateTime;
}
