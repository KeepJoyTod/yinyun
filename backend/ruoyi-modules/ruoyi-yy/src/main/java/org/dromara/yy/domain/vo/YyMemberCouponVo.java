package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;

@Data
public class YyMemberCouponVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long customerId;
    private String couponName;
    private String couponType;
    private String status;
    private BigDecimal discountAmount;
    private BigDecimal thresholdAmount;
    private String sourceType;
    private Long sourceId;
    private String expireTime;
    private String remark;
}
