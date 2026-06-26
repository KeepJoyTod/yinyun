package org.dromara.yy.domain;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.tenant.core.TenantEntity;
import java.io.Serial;
import java.util.Date;

/**
 * 影约云预约订单对象 yy_order
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_order")
public class YyOrder extends TenantEntity {

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
     * 订单编号
     */
    private String orderNo;

    /**
     * 客户姓名
     */
    private String customerName;

    /**
     * 客户手机号
     */
    private String customerPhone;

    /**
     * 订单来源
     */
    private String source;

    /**
     * 预约方式
     */
    private String bookingMethod;

    /**
     * 下单时间
     */
    private Date orderTime;

    /**
     * 到店时间
     */
    private Date arrivalTime;

    /**
     * 订单状态
     */
    private String status;

    /**
     * 工位
     */
    private String workstationNo;

    /**
     * 外部订单号
     */
    private String externalOrderId;

    /**
     * 渠道类型
     */
    private String channelType;

    /**
     * 订单总金额（分）
     */
    private Long totalAmountCent;

    /**
     * 实付金额（分）
     */
    private Long paidAmountCent;

    /**
     * 支付状态
     */
    private String payStatus;

    /**
     * 支付时间
     */
    private Date paidTime;

    /**
     * 退款状态
     */
    private String refundStatus;

    /**
     * 退款金额（分）
     */
    private Long refundAmountCent;

    /**
     * 外部商品ID
     */
    private String externalProductId;

    /**
     * 外部SKU ID
     */
    private String externalSkuId;

    /**
     * 外部门店/POI ID
     */
    private String externalPoiId;

    /**
     * 服务组ID
     */
    private Long serviceGroupId;

    /**
     * 本地库存时段ID
     */
    private Long inventorySlotId;

    /**
     * 预约日期 yyyy-MM-dd
     */
    private String slotDate;

    /**
     * 预约开始时间 HH:mm
     */
    private String slotStartTime;

    /**
     * 预约结束时间 HH:mm
     */
    private String slotEndTime;

    /**
     * 库存状态
     */
    private String inventoryStatus;

    /**
     * 库存冲突原因
     */
    private String conflictReason;

    /**
     * 订单属性快照和值
     */
    private String orderAttributeJson;

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
