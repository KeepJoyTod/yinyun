package org.dromara.yy.domain.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serial;
import java.io.Serializable;

/**
 * 微信生态字段映射
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class YyWechatFieldMappingVo implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private String source;
    private String localField;
    private String usage;
    private Boolean required;
}
