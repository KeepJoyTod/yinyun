package org.dromara.yy.domain.bo;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.github.linpeilie.annotations.AutoMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.dromara.common.core.validate.AddGroup;
import org.dromara.common.core.validate.EditGroup;
import org.dromara.common.mybatis.core.domain.BaseEntity;
import org.dromara.yy.domain.YyOrder;
import java.util.List;
import java.util.Date;

/**
 * 影约云预约订单业务对象 yy_order
 */
@Data
@EqualsAndHashCode(callSuper = true)
@AutoMapper(target = YyOrder.class, reverseConvertGenerate = false)
public class YyOrderBo extends BaseEntity {

    /**
     * 订单号、客户姓名、手机号、外部订单号关键字
     */
    private String keyword;

    /**
     * 主键
     */
    @NotNull(message = "主键不能为空", groups = { EditGroup.class })
    private Long id;

    @NotNull(message = "门店ID不能为空", groups = { AddGroup.class })
    /**
     * 门店ID
     */
    private Long storeId;

    @NotBlank(message = "订单编号不能为空", groups = { AddGroup.class })
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

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    /**
     * 下单时间
     */
    private Date orderTime;

    /**
     * 下单开始时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date beginOrderTime;

    /**
     * 下单结束时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date endOrderTime;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    /**
     * 到店时间
     */
    private Date arrivalTime;

    /**
     * 到店开始时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date beginArrivalTime;

    /**
     * 到店结束时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date endArrivalTime;

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
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
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
     * 订单属性结构化值
     */
    private List<YyOrderAttributeValueBo> orderAttributes;

    /**
     * 渠道外部状态
     */
    private String externalStatus;

    /**
     * 渠道同步状态
     */
    private String syncStatus;

    /**
     * 只查询不可交付取片订单：缺手机号、无相册、无可见照片、可见照片缺OSS Key
     */
    private String photoDeliveryIssueOnly;

    /**
     * 备注
     */
    private String remark;
}
