package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;
import java.io.Serial;

/**
 * 影约云渠道订单映射对象 yy_channel_order_mapping
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_channel_order_mapping")
public class YyChannelOrderMapping extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @TableId(value = "id")
    private Long id;

    /**
     * 门店ID
     */
    private Long storeId;

    /**
     * 本地订单ID
     */
    private Long orderId;

    /**
     * 渠道类型
     */
    private String channelType;

    /**
     * 外部订单号
     */
    private String externalOrderId;

    /**
     * 外部状态
     */
    private String externalStatus;

    /**
     * 同步状态
     */
    private String syncStatus;

    /**
     * 原始报文
     */
    private String rawPayload;

    /**
     * 备注
     */
    private String remark;

    /**
     * 删除标志
     */
    @TableLogic
    private String delFlag;
}
