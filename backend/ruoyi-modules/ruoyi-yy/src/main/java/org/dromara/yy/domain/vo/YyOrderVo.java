package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import cn.idev.excel.annotation.format.DateTimeFormat;
import com.fasterxml.jackson.annotation.JsonFormat;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyOrder;
import java.io.Serial;
import java.io.Serializable;
import java.util.Date;
import java.util.List;

/**
 * 影约云预约订单视图对象 yy_order
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyOrder.class)
public class YyOrderVo implements Serializable {

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

    @ExcelProperty(value = "订单编号")
    /**
     * 订单编号
     */
    private String orderNo;

    @ExcelProperty(value = "客户姓名")
    /**
     * 客户姓名
     */
    private String customerName;

    @ExcelProperty(value = "客户手机号")
    /**
     * 客户手机号
     */
    private String customerPhone;

    @ExcelProperty(value = "订单来源")
    /**
     * 订单来源
     */
    private String source;

    @ExcelProperty(value = "预约方式")
    /**
     * 预约方式
     */
    private String bookingMethod;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat("yyyy-MM-dd HH:mm:ss")
    @ExcelProperty(value = "下单时间")
    /**
     * 下单时间
     */
    private Date orderTime;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat("yyyy-MM-dd HH:mm:ss")
    @ExcelProperty(value = "到店时间")
    /**
     * 到店时间
     */
    private Date arrivalTime;

    @ExcelProperty(value = "订单状态")
    /**
     * 订单状态
     */
    private String status;

    @ExcelProperty(value = "工位")
    /**
     * 工位
     */
    private String workstationNo;

    @ExcelProperty(value = "外部订单号")
    /**
     * 外部订单号
     */
    private String externalOrderId;

    /**
     * 渠道类型
     */
    @ExcelProperty(value = "渠道类型")
    private String channelType;

    /**
     * 订单总金额（分）
     */
    @ExcelProperty(value = "订单总金额(分)")
    private Long totalAmountCent;

    /**
     * 实付金额（分）
     */
    @ExcelProperty(value = "实付金额(分)")
    private Long paidAmountCent;

    /**
     * 支付状态
     */
    @ExcelProperty(value = "支付状态")
    private String payStatus;

    /**
     * 支付时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @DateTimeFormat("yyyy-MM-dd HH:mm:ss")
    @ExcelProperty(value = "支付时间")
    private Date paidTime;

    /**
     * 退款状态
     */
    @ExcelProperty(value = "退款状态")
    private String refundStatus;

    /**
     * 退款金额（分）
     */
    @ExcelProperty(value = "退款金额(分)")
    private Long refundAmountCent;

    /**
     * 外部商品ID
     */
    @ExcelProperty(value = "外部商品ID")
    private String externalProductId;

    /**
     * 外部SKU ID
     */
    @ExcelProperty(value = "外部SKU ID")
    private String externalSkuId;

    /**
     * 外部门店/POI ID
     */
    @ExcelProperty(value = "外部门店/POI ID")
    private String externalPoiId;

    /**
     * 服务组ID
     */
    @ExcelProperty(value = "服务组ID")
    private Long serviceGroupId;

    /**
     * 本地库存时段ID
     */
    @ExcelProperty(value = "库存时段ID")
    private Long inventorySlotId;

    /**
     * 预约日期 yyyy-MM-dd
     */
    @ExcelProperty(value = "预约日期")
    private String slotDate;

    /**
     * 预约开始时间 HH:mm
     */
    @ExcelProperty(value = "预约开始时间")
    private String slotStartTime;

    /**
     * 预约结束时间 HH:mm
     */
    @ExcelProperty(value = "预约结束时间")
    private String slotEndTime;

    /**
     * 库存状态
     */
    @ExcelProperty(value = "库存状态")
    private String inventoryStatus;

    /**
     * 库存冲突原因
     */
    @ExcelProperty(value = "库存冲突原因")
    private String conflictReason;

    /**
     * 订单属性快照和值
     */
    private String orderAttributeJson;

    /**
     * 订单属性结构化值
     */
    private List<YyOrderAttributeValueVo> orderAttributes;

    /**
     * 渠道外部状态
     */
    @ExcelProperty(value = "渠道外部状态")
    private String externalStatus;

    /**
     * 渠道同步状态
     */
    @ExcelProperty(value = "渠道同步状态")
    private String syncStatus;

    /**
     * 关联取片相册数量
     */
    private Long photoAlbumCount;

    /**
     * 关联相册中客户可见底片数量
     */
    private Long photoVisibleAssetCount;

    /**
     * 客户可见但缺 OSS Key 的底片数量
     */
    private Long photoMissingObjectKeyCount;

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
