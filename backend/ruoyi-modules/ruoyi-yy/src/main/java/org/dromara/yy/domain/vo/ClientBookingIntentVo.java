package org.dromara.yy.domain.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.util.Date;

/**
 * 客户预约意向提交结果。
 */
@Data
public class ClientBookingIntentVo {

    private String orderNo;

    private String status;

    private String customerPhoneMasked;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date arrivalTime;
}
