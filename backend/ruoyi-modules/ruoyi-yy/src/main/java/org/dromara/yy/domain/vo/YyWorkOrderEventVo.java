package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

/**
 * 工单事件视图对象
 */
@Data
public class YyWorkOrderEventVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;
    private Long workOrderId;
    private String eventType;
    private String eventDetail;
    private Long operatorId;
    private String operatorName;
    private String remark;
    private Date createTime;
}
