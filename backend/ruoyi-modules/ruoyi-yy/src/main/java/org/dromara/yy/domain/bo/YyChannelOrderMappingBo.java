package org.dromara.yy.domain.bo;

import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyChannelOrderMapping;

/**
 * 影约云渠道订单映射业务对象 yy_channel_order_mapping
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyChannelOrderMapping.class, reverseConvertGenerate = false)
public class YyChannelOrderMappingBo extends BaseEntity {

    /**
     * 主键
     */
    @NotNull(message = "主键不能为空", groups = { EditGroup.class })
    private Long id;

    /**
     * 门店ID
     */
    private Long storeId;

    /**
     * 本地订单ID
     */
    private Long orderId;

    @NotBlank(message = "渠道类型不能为空", groups = { AddGroup.class, EditGroup.class })
    /**
     * 渠道类型
     */
    private String channelType;

    @NotBlank(message = "外部订单号不能为空", groups = { AddGroup.class, EditGroup.class })
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
}
