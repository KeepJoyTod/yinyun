package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;

@Data
public class YyToolPrecisionDeliveryTaskVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String taskId;

    private String taskName;

    private String channelType;

    private String targetLabel;

    private String deliveryStatus;

    private String status;
}
