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
 * 影约云支付流水对象 yy_payment_record
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("yy_payment_record")
public class YyPaymentRecord extends TenantEntity {

    @Serial
    private static final long serialVersionUID = 1L;

    @TableId(value = "id")
    private Long id;

    private Long storeId;

    private Long orderId;

    private String channelType;

    private String provider;

    private String outTradeNo;

    private String platformOrderId;

    private String transactionId;

    private Long amountCent;

    private Long paidAmountCent;

    private String currency;

    private String payStatus;

    private Date paidTime;

    private Date notifyTime;

    private Date closeTime;

    private String refundStatus;

    private Long refundAmountCent;

    private String rawPayload;

    private String remark;

    @TableLogic
    private String delFlag;
}
