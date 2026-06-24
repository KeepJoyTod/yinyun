package org.dromara.yy.domain.vo;

import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyProductCollaborationConfig;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
@AutoMapper(target = YyProductCollaborationConfig.class)
public class YyProductCollaborationConfigVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

    private String tenantId;

    private Long productId;

    private Long storeId;

    private String workflowJson;

    private String needMakeup;

    private String needPhotography;

    private String needRetouch;

    private String needReview;

    private String needSelectionReview;

    private String needPickup;

    private Integer makeupCount;

    private Integer deliverWithinHours;

    private String status;

    private String remark;

    private Date createTime;

    private Date updateTime;
}
