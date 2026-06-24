package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyChannelOrderMapping;
import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 影约云渠道订单映射视图对象 yy_channel_order_mapping
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyChannelOrderMapping.class)
public class YyChannelOrderMappingVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    /**
     * 主键
     */
    @ExcelProperty(value = "主键")
    private Long id;

    /**
     * 租户编号
     */
    private String tenantId;

    @ExcelProperty(value = "门店ID")
    /**
     * 门店ID
     */
    private Long storeId;

    @ExcelProperty(value = "本地订单ID")
    /**
     * 本地订单ID
     */
    private Long orderId;

    @ExcelProperty(value = "渠道类型")
    /**
     * 渠道类型
     */
    private String channelType;

    @ExcelProperty(value = "外部订单号")
    /**
     * 外部订单号
     */
    private String externalOrderId;

    @ExcelProperty(value = "外部状态")
    /**
     * 外部状态
     */
    private String externalStatus;

    @ExcelProperty(value = "同步状态")
    /**
     * 同步状态
     */
    private String syncStatus;

    @ExcelProperty(value = "原始报文")
    /**
     * 原始报文
     */
    private String rawPayload;

    @ExcelProperty(value = "备注")
    /**
     * 备注
     */
    private String remark;

    /**
     * 创建时间
     */
    @ExcelProperty(value = "创建时间")
    private Date createTime;

    /**
     * 更新时间
     */
    @ExcelProperty(value = "更新时间")
    private Date updateTime;
}
