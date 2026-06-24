package org.dromara.yy.domain.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 移动端订单状态视图。
 */
@Data
public class YyMobileOrderVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String orderNo;
    private String source;
    private String status;
    private String externalStatus;
    private String customerName;
    private String customerPhoneMasked;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date orderTime;
}
