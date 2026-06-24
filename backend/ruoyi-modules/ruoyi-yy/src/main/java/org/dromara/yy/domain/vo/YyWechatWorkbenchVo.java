package org.dromara.yy.domain.vo;

import lombok.Data;

import java.io.Serial;
import java.io.Serializable;
import java.util.List;

/**
 * 微信生态工作台
 */
@Data
public class YyWechatWorkbenchVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String title;
    private String strategy;
    private String h5BookingUrl;
    private String miniProgramPath;
    private String servicePhoneField;
    private List<YyWechatCapabilityVo> capabilities;
    private List<YyWechatFieldMappingVo> fieldMappings;
}
