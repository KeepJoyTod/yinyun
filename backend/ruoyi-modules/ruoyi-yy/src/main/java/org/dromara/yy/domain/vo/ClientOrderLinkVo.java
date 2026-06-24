package org.dromara.yy.domain.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 客户端订单链接视图。
 */
@Data
public class ClientOrderLinkVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String orderId;
    private String orderNo;
    private String channelType;
    private String status;
    private String payStatus;
    private String externalStatus;
    private String customerName;
    private String phoneMasked;
    private String amount;
    private String title;
    private String productTitle;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createdTime;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date appointmentTime;

    private Boolean pickupAvailable;
    private String pickupUrl;
    private String orderDetailUrl;
}
