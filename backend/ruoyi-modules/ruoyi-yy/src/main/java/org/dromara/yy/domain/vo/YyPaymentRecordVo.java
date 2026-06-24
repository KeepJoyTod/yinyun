package org.dromara.yy.domain.vo;

import cn.idev.excel.annotation.ExcelIgnoreUnannotated;
import cn.idev.excel.annotation.ExcelProperty;
import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyPaymentRecord;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 支付流水视图对象 yy_payment_record
 */
@Data
@ExcelIgnoreUnannotated
@AutoMapper(target = YyPaymentRecord.class)
public class YyPaymentRecordVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

    @ExcelProperty(value = "门店ID")
    private Long storeId;

    @ExcelProperty(value = "订单ID")
    private Long orderId;

    @ExcelProperty(value = "渠道类型")
    private String channelType;

    @ExcelProperty(value = "支付提供方")
    private String provider;

    @ExcelProperty(value = "商户订单号")
    private String outTradeNo;

    @ExcelProperty(value = "平台订单号")
    private String platformOrderId;

    @ExcelProperty(value = "交易流水号")
    private String transactionId;

    @ExcelProperty(value = "应付金额分")
    private Long amountCent;

    @ExcelProperty(value = "实付金额分")
    private Long paidAmountCent;

    @ExcelProperty(value = "支付状态")
    private String payStatus;

    @ExcelProperty(value = "支付时间")
    private Date paidTime;

    @ExcelProperty(value = "通知时间")
    private Date notifyTime;

    private String currency;

    private String rawPayload;

    private String remark;
}
