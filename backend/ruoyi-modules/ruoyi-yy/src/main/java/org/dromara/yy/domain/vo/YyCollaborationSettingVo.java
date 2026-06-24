package org.dromara.yy.domain.vo;

import io.github.linpeilie.annotations.AutoMapper;
import lombok.Data;
import org.dromara.yy.domain.YyCollaborationSetting;

import java.io.Serial;
import java.io.Serializable;
import java.util.Date;

@Data
@AutoMapper(target = YyCollaborationSetting.class)
public class YyCollaborationSettingVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private Long id;

    private String tenantId;

    private String settingType;

    private String status;

    private String configJson;

    private String remark;

    private Date createTime;

    private Date updateTime;
}
