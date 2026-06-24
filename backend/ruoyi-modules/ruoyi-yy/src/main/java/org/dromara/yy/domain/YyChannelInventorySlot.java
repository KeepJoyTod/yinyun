package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;

import java.io.Serial;

/**
 * 影约云渠道库存槽对象 yy_channel_inventory_slot
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_channel_inventory_slot")
public class YyChannelInventorySlot extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id")
    private Long id;

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

    @TableLogic
    private String delFlag;
}
